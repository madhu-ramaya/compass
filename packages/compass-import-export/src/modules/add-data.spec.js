import reducer, {
  // STARTED,
  // CANCELED,
  // PROGRESS,
  // FINISHED,
  // FAILED,
  FILE_TYPE_SELECTED,
  selectImportFileType,
  // FILE_SELECTED,
  selectImportFileName,
  // OPEN,
  // CLOSE,
  // SET_PREVIEW,
  // SET_DELIMITER,
  // SET_GUESSTIMATED_TOTAL,
  // SET_STOP_ON_ERRORS,
  // SET_IGNORE_BLANKS,
  // TOGGLE_INCLUDE_FIELD,
  // SET_FIELD_TYPE,
  INITIAL_STATE
} from './add-data';

// import PROCESS_STATUS from '../constants/process-status';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

/**
 * Sets up a fresh store using 'redux-mock-store'
 * providing a shortcut that does not use block scoped variables.
 *
 * @param {Object} test `this` inside an `it()` block.
 */
function setupMockStore(test) {
  const state = {
    addData: {
      ...INITIAL_STATE
    }
  };
  const store = mockStore(state);
  test.store = store;
  test.state = test.state;
}

/**
 * Boiler plate that I can set file types.
 *
 * @param {Object} test `this` inside an `it()` block.
 * @param {String} fileType json or csv.
 * @returns {Promise}
 */
function testSetFileType(test, fileType) {
  return new Promise(function(resolve) {
    // See https://github.com/dmitry-zaets/redux-mock-store/issues/71#issuecomment-369546064
    // redux-mock-store does not update state automatically.
    test.store.subscribe(() => {
      const expected = {
        fileType: fileType,
        type: FILE_TYPE_SELECTED
      };

      expect(reducer(test.state, expected).fileType).to.be.deep.equal(fileType);
    });
    test.store.dispatch(selectImportFileType(fileType));

    expect(test.store.getActions()).to.deep.equal([
      {
        fileType: fileType,
        type: FILE_TYPE_SELECTED
      }
    ]);
    resolve(test);
  });
}

describe('import [module]', () => {
  describe('selectImportFileType', () => {
    beforeEach(function() {
      setupMockStore(this);
    });

    it('dispatch a FILE_TYPE_SELECTED action and the reducer should update fileType to csv', function() {
      return testSetFileType(this, 'csv');
    });
    it('dispatch a FILE_TYPE_SELECTED action and the reducer should update fileType to json', function() {
      return testSetFileType(this, 'JSON');
    });

    afterEach(function() {
      this.store.clearActions();
    });
  });

  describe('#selectImportFileName', () => {
    beforeEach(function() {
      setupMockStore(this);
    });

    it('dispatch a FILE_SELECTED action', function() {
      const test = this;
      const fileName = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'test',
        'docs.json'
      );
      return new Promise(function(resolve) {
        // See https://github.com/dmitry-zaets/redux-mock-store/issues/71#issuecomment-369546064
        // redux-mock-store does not update state automatically.
        test.store.subscribe(() => {
          // const expected = {
          //   fileName: fileName,
          //   fileIsMultilineJSON: false,
          //   fileType: 'json',
          //   status: PROCESS_STATUS.UNSPECIFIED,
          //   progress: 0,
          //   docsWritten: 0,
          //   source: undefined,
          //   dest: undefined
          // };
          // console.log('subscribe touched', { args: arguments, actions: test.store.getActions()});
          const expected = {
            isOpen: false,
            progress: 0,
            error: null,
            fileName: '',
            fileIsMultilineJSON: false,
            useHeaderLines: true,
            status: 'UNSPECIFIED',
            fileStats: null,
            docsWritten: 0,
            guesstimatedDocsTotal: 0,
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

          const result = reducer(test.state, expected);

          expect(result).to.be.deep.equal({
            isOpen: false,
            errors: [],
            fileName: '',
            fileIsMultilineJSON: false,
            useHeaderLines: true,
            status: 'UNSPECIFIED',
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
          });

          resolve(test);
        });

        test.store.dispatch(selectImportFileName(fileName));

        expect(test.store.getActions()).to.deep.equal([
          // {
          //   fileName: fileName,
          //   fileType: 'json',
          //   fileStats: {},
          //   fileIsMultilineJSON: false,
          //   type: FILE_SELECTED
          // }
        ]);
      });
    });

    afterEach(function() {
      this.store.clearActions();
    });
  });

});
