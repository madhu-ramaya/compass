import { promisify } from 'util';
import fs from 'fs';
const checkFileExists = promisify(fs.exists);
const getFileStats = promisify(fs.stat);
import stream from 'stream';
import mime from 'mime-types';
import PROCESS_STATUS from '../constants/process-status';
import { appRegistryEmit, globalAppRegistryEmit } from './compass';
import detectImportFile from '../utils/detect-import-file';
import createParser, { createProgressStream } from '../utils/import-parser';
import createPreviewWritable, { createPeekStream } from '../utils/import-preview';
import createLoggerAndTelemetry from '@mongodb-js/compass-logging';

const { log, mongoLogId, debug, track } = createLoggerAndTelemetry(
  'COMPASS-IMPORT-EXPORT-UI'
);

/**
 * ## Action names
 */
const PREFIX = 'import-export/add-data';
export const STARTED = `${PREFIX}/STARTED`;
export const CANCELED = `${PREFIX}/CANCELED`;
export const GUESSTIMATED_PROGRESS = `${PREFIX}/GUESSTIMATED_PROGRESS`;
export const PROGRESS = `${PREFIX}/PROGRESS`;
export const FINISHED = `${PREFIX}/FINISHED`;
export const FAILED = `${PREFIX}/FAILED`;
export const FILE_TYPE_SELECTED = `${PREFIX}/FILE_TYPE_SELECTED`;
export const FILE_SELECTED = `${PREFIX}/FILE_SELECTED`;
export const OPEN = `${PREFIX}/OPEN`;
export const CLOSE = `${PREFIX}/CLOSE`;
export const SET_PREVIEW = `${PREFIX}/SET_PREVIEW`;
export const SET_DELIMITER = `${PREFIX}/SET_DELIMITER`;
export const SET_GUESSTIMATED_TOTAL = `${PREFIX}/SET_GUESSTIMATED_TOTAL`;
export const SET_STOP_ON_ERRORS = `${PREFIX}/SET_STOP_ON_ERRORS`;
export const SET_IGNORE_BLANKS = `${PREFIX}/SET_IGNORE_BLANKS`;
export const TOGGLE_INCLUDE_FIELD = `${PREFIX}/TOGGLE_INCLUDE_FIELD`;
export const SET_FIELD_TYPE = `${PREFIX}/SET_FIELD_TYPE`;
export const SET_ADD_DATA_COUNT = `${PREFIX}/SET_ADD_DATA_COUNT`;
export const SET_ADD_FIELD_COUNT = `${PREFIX}/SET_ADD_FIELD_COUNT`;

/**
 * ## Initial state.
 *
 * @api private
 */
export const INITIAL_STATE = {
  isOpen: false,
  errors: [],
  fileName: '',
  fileIsMultilineJSON: false,
  useHeaderLines: true,
  status: PROCESS_STATUS.UNSPECIFIED,
  fileStats: null,
  docsTotal: -1,
  docsProcessed: 0,
  docsWritten: 0,
  guesstimatedDocsTotal: 0,
  guesstimatedDocsProcessed: 0,
  delimiter: ',',
  stopOnErrors: false,
  ignoreBlanks: true,
  fields: [],
  values: [],
  previewLoaded: false,
  exclude: [],
  transform: [],
  fileType: ''
};

/**
 * ### Import status action creators
 *
 * @see startImport below.
 *
 * ```
 * STARTED >
 * | *ERROR* || SET_GUESSTIMATED_TOTAL >
 *           | <-- PROGRESS -->
 *           | *FINISHED*
 * ```
 */

/**
 * @param {Number} progress
 * @param {Number} docsWritten
 * @api private
 */
export const onGuesstimatedProgress = (docsProcessed, docsTotal) => ({
  type: GUESSTIMATED_PROGRESS,
  guesstimatedDocsProcessed: docsProcessed,
  guesstimatedDocsTotal: docsTotal
});

export const onProgress = ({ docsWritten, docsProcessed, errors }) => ({
  type: PROGRESS,
  docsWritten,
  docsProcessed,
  errors
});

/**
 * @param {stream.Readable} source
 * @param {stream.Readable} dest
 * @api private
 */
export const onStarted = (source, dest) => ({
  type: STARTED,
  source: source,
  dest: dest
});

/**
 * @param {Number} docsWritten
 * @api private
 */
export const onFinished = (docsWritten, docsTotal) => ({
  type: FINISHED,
  docsWritten,
  docsTotal
});

/**
 * @param {Error} error
 * @api private
 */
export const onFailed = error => ({ type: FAILED, error });

/**
 * @param {Number} guesstimatedDocsTotal
 * @api private
 */
export const onGuesstimatedDocsTotal = guesstimatedDocsTotal => ({
  type: SET_GUESSTIMATED_TOTAL,
  guesstimatedDocsTotal: guesstimatedDocsTotal
});


export const setAddDataRecordsCount = addDataRecordsCount => {
  return {
    type: SET_ADD_DATA_COUNT,
    addDataRecordsCount: addDataRecordsCount,
  };
};

export const setFieldsPerRecordCount = fieldsPerRecordCount => {
  return {
    type: SET_ADD_FIELD_COUNT,
    fieldsPerRecordCount: fieldsPerRecordCount,
  };
};


function getSampleJson(index, fieldsCount) {
  const stringCount = fieldsCount && fieldsCount['string']? fieldsCount['string']: 1
  const numberCount = fieldsCount && fieldsCount['number']? fieldsCount['number']: 1
  const arrayCount = fieldsCount && fieldsCount['array']? fieldsCount['array']: 1
  const objCount = fieldsCount && fieldsCount['document']? fieldsCount['document']: 1
  let response = {'id': index}

  for(let i=0; i< stringCount; i++){
    response["string"+i] = Math.random().toString()
  }
  for(let i=0; i< numberCount; i++){
    response["number"+i] = Math.random()
  }
  for(let i=0; i< arrayCount; i++){
    response["array"+i] = [Math.random()]
  }
  for(let i=0; i< objCount; i++){
    response["object"+i] = { 'item': Math.random() }
  }
  return response
}

/**
 * Sets up a streaming based pipeline to execute the import
 * and update status/progress.
 *
 * All of the exciting bits happen in `../utils/` :)
 * @api public
 */
export const startAddData = () => {
  return (dispatch, getState) => {
    const state = getState();
    const {
      ns,
      dataService: { dataService },
      addData,
    } = state;
    const {
      fileType,
      delimiter,
      stopOnErrors,
      addDataRecordsCount,
      fieldsPerRecordCount
    } = addData;

    const progress = createProgressStream(addDataRecordsCount, function(err, info) {
      if (err) return;
      dispatch(onGuesstimatedProgress(info.transferred, addDataRecordsCount));
    });

    dispatch(onGuesstimatedDocsTotal(addDataRecordsCount));
    progress.setLength(addDataRecordsCount);
    dispatch(onGuesstimatedDocsTotal(addDataRecordsCount));

    const batchCount = ~~(addDataRecordsCount / 50)
    let temp = 0

    for (let batch = 0; batch <= batchCount; batch++) {
      for (let i = temp; i < 50 * (batch + 1); i++) {
        const sampleJson = getSampleJson(i, fieldsPerRecordCount)
        const docs = [sampleJson];

        console.time('addData');
        console.group('addData:start');
        console.group('addData Options:');
        console.table({
          stopOnErrors
        });

        dataService.insertMany(ns, docs, {}, (error) => {
          if (error) {
            return this.setState({
              insert: {
                doc: {},
                jsonDoc: this.state.insert.jsonDoc,
                jsonView: true,
                message: error.message,
                mode: ERROR,
                isOpen: true,
                isCommentNeeded: this.state.insert.isCommentNeeded
              }
            });
          }
        });

        if (i == addDataRecordsCount-1)
          break;
      }
      dispatch(onGuesstimatedProgress(temp, addDataRecordsCount));
      temp=temp+50
    }

    console.log('Running addData...');

    track('Add Data Completed', {
      file_type: fileType,
      all_fields: true,
      stop_on_error_selected: stopOnErrors,
      number_of_docs: addDataRecordsCount,
      success: true,
    });

    log.info(mongoLogId(1001000082), 'Add data', 'Add data completed', {
      ns,
      docsWritten: addDataRecordsCount,
      docsProcessed: addDataRecordsCount,
    });

    const payload = {
      ns,
      addDataRecordsCount,
      delimiter,
      stopOnErrors,
      hasExcluded: false,
      hasTransformed: false,
      error: []
    };
    dispatch(appRegistryEmit('add data-finished', payload));
    dispatch(globalAppRegistryEmit('add data-finished', payload));
    dispatch(appRegistryEmit('refresh-data'));
    dispatch(globalAppRegistryEmit('refresh-data'));

    dispatch(onFinished(addDataRecordsCount, addDataRecordsCount));
    console.groupEnd();
  }
};

/**
 * Cancels an active import if there is one, noop if not.
 *
 * @api public
 */
export const cancelAddData = () => {
  return (dispatch, getState) => {
    const { addData } = getState();
    const { source, dest } = addData;

    if (!source || !dest) {
      debug('no active import to cancel.');
      return;
    }
    debug('cancelling');
    source.unpipe();

    debug('import canceled by user');
    dispatch({ type: CANCELED });
  };
};

/**
 * Load a preview of the first few documents in the selected file
 * which is used to calculate an inital set of `fields` and `values`.
 *
 * `loadPreviewDocs()` is only called internally when any state used
 * for specifying import parsing is modified.
 *
 * @param {String} fileName
 * @param {String} fileType
 * @api private
 */
const loadPreviewDocs = (
  fileName,
  fileType,
  delimiter,
  fileIsMultilineJSON
) => {
  return dispatch => {
    debug('loading preview', {
      fileName,
      fileType,
      delimiter,
      fileIsMultilineJSON
    });
    /**
     * TODO: lucas: add dispatches for preview loading, error, etc.
     * as needed. For the time being, its fast enough and we want
     * errors/faults hard so we can figure out edge cases that
     * actually need it.
     */
    const source = fs.createReadStream(fileName, {
      encoding: 'utf8',
      end: 20 * 1024
    });

    const dest = createPreviewWritable({
      fileType,
      delimiter,
      fileIsMultilineJSON
    });

    stream.pipeline(
      source,
      createPeekStream(fileType, delimiter, fileIsMultilineJSON),
      dest,
      function (err) {
        if (err) {
          log.error(mongoLogId(1001000097), 'Import', 'Failed to load preview docs', err);
          debug('Error while loading preview docs', err);
          return;
        }
        dispatch({
          type: SET_PREVIEW,
          fields: dest.fields,
          values: dest.values
        });
      }
    );
  };
};

/**
 * ### User actions for speficying import options
 */

/**
 * Mark a field to be included or excluded from the import.
 *
 * @param {String} path Dot notation path of the field.
 * @api public
 */
export const toggleIncludeField = path => ({
  type: TOGGLE_INCLUDE_FIELD,
  path: path
});

/**
 * Specify the `type` values at `path` should be cast to.
 *
 * @param {String} path Dot notation accessor for value.
 * @param {String} bsonType A bson type identifier.
 * @example
 * ```javascript
 * //  Cast string _id from a csv to a bson.ObjectID
 * setFieldType('_id', 'ObjectID');
 * // Cast `{stats: {flufiness: "100"}}` to
 * // `{stats: {flufiness: 100}}`
 * setFieldType('stats.flufiness', 'Int32');
 * ```
 * @api public
 */
export const setFieldType = (path, bsonType) => {
  return {
    type: SET_FIELD_TYPE,
    path: path,
    bsonType: bsonType
  };
};

/**
 * Gather file metadata quickly when the user specifies `fileName`
 * @param {String} fileName
 * @api public
 * @see utils/detect-import-file.js
 */
export const selectImportFileName = fileName => {
  return (dispatch, getState) => {
    let fileStats = {};
    checkFileExists(fileName)
      .then(exists => {
        if (!exists) {
          throw new Error(`File ${fileName} not found`);
        }
        return getFileStats(fileName);
      })
      .then(stats => {
        fileStats = {
          ...stats,
          type: mime.lookup(fileName)
        };
        return promisify(detectImportFile)(fileName);
      })
      .then(detected => {
        debug('get detection results');
        dispatch({
          type: FILE_SELECTED,
          fileName: fileName,
          fileStats: fileStats,
          fileIsMultilineJSON: detected.fileIsMultilineJSON,
          fileType: detected.fileType
        });

        /**
         * TODO: lucas: @see utils/detect-import-file.js for future delimiter detection.
         */
        const delimiter = getState().addData.delimiter;
        dispatch(
          loadPreviewDocs(
            fileName,
            detected.fileType,
            delimiter,
            detected.fileIsMultilineJSON
          )
        );
      })
      .catch(err => {
        debug('dispatching error', err);
        dispatch(onFailed(err));
      });
  };
};

/**
 * The user has manually selected the `fileType` of the import.
 *
 * @param {String} fileType
 * @api public
 */
export const selectImportFileType = fileType => {
  return (dispatch, getState) => {
    const {
      previewLoaded,
      fileName,
      delimiter,
      fileIsMultilineJSON
    } = getState().addData;

    dispatch({
      type: FILE_TYPE_SELECTED,
      fileType: fileType
    });

    if (previewLoaded) {
      debug('preview needs updated because fileType changed');
      dispatch(
        loadPreviewDocs(fileName, fileType, delimiter, fileIsMultilineJSON)
      );
    }
  };
};

/**
 * Set the tabular delimiter.
 * @param {String} delimiter One of `,` for csv, `\t` for csv
 *
 * @api public
 */
export const setDelimiter = delimiter => {
  return (dispatch, getState) => {
    const {
      previewLoaded,
      fileName,
      fileType,
      fileIsMultilineJSON
    } = getState().addData;
    dispatch({
      type: SET_DELIMITER,
      delimiter: delimiter
    });

    if (previewLoaded) {
      debug(
        'preview needs updated because delimiter changed',
        fileName,
        fileType,
        delimiter,
        fileIsMultilineJSON
      );
      dispatch(
        loadPreviewDocs(fileName, fileType, delimiter, fileIsMultilineJSON)
      );
    }
  };
};

/**
 * Stop the import if mongo returns an error for a document write
 * such as a duplicate key for a unique index. In practice,
 * the cases for this being false when importing are very minimal.
 * For example, a duplicate unique key on _id is almost always caused
 * by the user attempting to resume from a previous import without
 * removing all documents sucessfully imported.
 *
 * @param {Boolean} stopOnErrors To stop or not to stop
 * @api public
 * @see utils/collection-stream.js
 * @see https://docs.mongodb.com/manual/reference/program/mongoimport/#cmdoption-mongoimport-stoponerror
 */
export const setStopOnErrors = stopOnErrors => ({
  type: SET_STOP_ON_ERRORS,
  stopOnErrors: stopOnErrors
});

/**
 * Any `value` that is `''` will not have this field set in the final
 * document written to mongo.
 *
 * @param {Boolean} ignoreBlanks
 * @api public
 * @see https://docs.mongodb.com/manual/reference/program/mongoimport/#cmdoption-mongoimport-ignoreblanks
 * @todo lucas: Standardize as `setIgnoreBlanks`?
 */
export const setIgnoreBlanks = ignoreBlanks => ({
  type: SET_IGNORE_BLANKS,
  ignoreBlanks: ignoreBlanks
});

/**
 * Open the add data modal.
 * @api public
 */
export const openAddData = () => {
  track('Add Data Opened');
  return {
    type: OPEN,
  };
};

/**
 * Close the import modal.
 * @api public
 */
export const closeAddData = () => ({
  type: CLOSE
});

/**
 * The import module reducer.
 *
 * @param {Object} state - The state.
 * @param {Object} action - The action.
 *
 * @returns {Object} The state.
 */
// eslint-disable-next-line complexity
const reducer = (state = INITIAL_STATE, action) => {
  debug('reducer handling action', action);
  if (action.type === FILE_SELECTED) {
    return {
      ...state,
      fileName: action.fileName,
      fileType: action.fileType,
      fileStats: action.fileStats,
      fileIsMultilineJSON: action.fileIsMultilineJSON,
      status: PROCESS_STATUS.UNSPECIFIED,
      docsTotal: -1,
      docsProcessed: 0,
      docsWritten: 0,
      guesstimatedDocsTotal: 0,
      guesstimatedDocsProcessed: 0,
      errors: [],
      source: undefined,
      dest: undefined,
      fields: []
    };
  }

  /**
   * ## Options
   */
  if (action.type === FILE_TYPE_SELECTED) {
    return {
      ...state,
      fileType: action.fileType
    };
  }

  if (action.type === SET_STOP_ON_ERRORS) {
    return {
      ...state,
      stopOnErrors: action.stopOnErrors
    };
  }

  if (action.type === SET_IGNORE_BLANKS) {
    return {
      ...state,
      ignoreBlanks: action.ignoreBlanks
    };
  }

  if (action.type === SET_DELIMITER) {
    return {
      ...state,
      delimiter: action.delimiter
    };
  }

  if (action.type === SET_ADD_DATA_COUNT) {
    return {
      ...state,
      addDataRecordsCount: action.addDataRecordsCount
    };
  }

  if (action.type === SET_ADD_FIELD_COUNT) {
    return {
      ...state,
      fieldsPerRecordCount: action.fieldsPerRecordCount
    };
  }

  /**
   * ## Preview and projection/data type options
   */
  if (action.type === SET_PREVIEW) {
    const newState = {
      ...state,
      values: action.values,
      fields: action.fields,
      previewLoaded: true,
      exclude: []
    };

    newState.transform = newState.fields
      .filter(field => field.checked)
      .map(field => [field.path, field.type]);

    return newState;
  }
  /**
   * When checkbox next to a field is checked/unchecked
   */
  if (action.type === TOGGLE_INCLUDE_FIELD) {
    /**
     * TODO: lucas: Move away from `state.fields` being
     * array of objects to using all array's of strings.
     * For now, there is some duplication of fields+transform+exclude
     * we'll come back to and fixup.
     */
    const newState = {
      ...state
    };

    newState.fields = newState.fields.map(field => {
      if (field.path === action.path) {
        field.checked = !field.checked;
      }
      return field;
    });

    newState.transform = newState.fields
      .map(field => [field.path, field.type]);


    newState.exclude = newState.fields
      .filter(field => !field.checked)
      .map(field => field.path);

    return newState;
  }

  /**
   * Changing field type from a select dropdown.
   */
  if (action.type === SET_FIELD_TYPE) {
    const newState = {
      ...state
    };

    newState.fields = newState.fields.map(field => {
      if (field.path === action.path) {
        // If a user changes a field type, automatically check it for them
        // so they don't need an extra click or forget to click it an get frustrated
        // like I did so many times :)
        field.checked = true;
        field.type = action.bsonType;
      }
      return field;
    });

    newState.exclude = newState.fields
      .filter(field => !field.checked)
      .map(field => field.path);

    newState.transform = newState.fields
      .filter(field => field.checked)
      .map(field => [field.path, field.type]);

    return newState;
  }

  /**
   * ## Status/Progress
   */
  if (action.type === FAILED) {
    return {
      ...state,
      // In cases where `FAILED` happened on import it might emit an event with
      // an error that was already saved in the `errors` array. We want to avoid
      // that by checking if the error is there before storing it in the state
      errors: state.errors.includes(action.error)
        ? state.errors
        : state.errors.concat(action.error),
      status: PROCESS_STATUS.FAILED,
    };
  }

  if (action.type === STARTED) {
    return {
      ...state,
      errors: [],
      docsTotal: -1,
      docsProcessed: 0,
      docsWritten: 0,
      guesstimatedDocsTotal: 0,
      guesstimatedDocsProcessed: 0,
      status: PROCESS_STATUS.STARTED,
      source: action.source,
      dest: action.dest
    };
  }

  if (action.type === SET_GUESSTIMATED_TOTAL) {
    return {
      ...state,
      guesstimatedDocsTotal: action.guesstimatedDocsTotal
    };
  }

  if (action.type === GUESSTIMATED_PROGRESS) {
    return {
      ...state,
      guesstimatedDocsProcessed: action.guesstimatedDocsProcessed,
      guesstimatedDocsTotal: action.guesstimatedDocsTotal
    };
  }

  if (action.type === PROGRESS) {
    return {
      ...state,
      docsWritten: action.docsWritten,
      docsProcessed: action.docsProcessed,
      errors: action.errors,
    };
  }

  if (action.type === FINISHED) {
    const isComplete = state.status !== PROCESS_STATUS.CANCELED;
    const hasErrors = state.errors.length > 0;

    let status = state.stats;

    if (isComplete && hasErrors) {
      status = PROCESS_STATUS.COMPLETED_WITH_ERRORS;
    } else if (isComplete) {
      status = PROCESS_STATUS.COMPLETED;
    }

    return {
      ...state,
      status,
      docsWritten: action.docsWritten,
      docsTotal: action.docsTotal,
      source: undefined,
      dest: undefined,
    };
  }

  if (action.type === CANCELED) {
    return {
      ...state,
      status: PROCESS_STATUS.CANCELED,
      source: undefined,
      dest: undefined
    };
  }

  /**
   * Open the `<AddDataModal />`
   */
  if (action.type === OPEN) {
    return {
      ...INITIAL_STATE,
      isOpen: true
    };
  }

  if (action.type === CLOSE) {
    return {
      ...state,
      isOpen: false
    };
  }
  return state;
};
export default reducer;
