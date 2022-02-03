import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { FileInput } from '@mongodb-js/compass-components';

import styles from './add-data-options.module.less';
import createStyler from '../../utils/styler.js';
const style = createStyler(styles, 'add-data-options');

class AddDataOptions extends PureComponent {
  constructor() {
    super();
    this.state = {
      fieldsPerRecordCount: {}
    };
  }

  static propTypes = {
    delimiter: PropTypes.string,
    setDelimiter: PropTypes.func.isRequired,
    fileType: PropTypes.string,
    selectImportFileType: PropTypes.func.isRequired,
    fileName: PropTypes.string,
    selectImportFileName: PropTypes.func.isRequired,
    stopOnErrors: PropTypes.bool,
    setStopOnErrors: PropTypes.func,
    ignoreBlanks: PropTypes.bool,
    setIgnoreBlanks: PropTypes.func,
    fileOpenDialog: PropTypes.func,
    addDataRecordsCount: PropTypes.number,
    setAddDataRecordsCount: PropTypes.func.isRequired,
    fieldsPerRecordCount: PropTypes.object,
    setFieldsPerRecordCount: PropTypes.func.isRequired,
  };

  /**
   * Handle choosing a file from the file dialog.
   */
  handleChooseFile = (files) => {
    this.props.selectImportFileName(files[0]);
  };

  handleOnSubmit = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  onDataCountChange(evt) {
    this.props.setAddDataRecordsCount(parseInt(evt.currentTarget.value, 10));
  }

  onFieldsCountChange(evt) {
    const fieldsObj = this.state ? this.state.fieldsPerRecordCount : {}
    fieldsObj[evt.currentTarget.id]=parseInt(evt.currentTarget.value, 10)
    this.props.setFieldsPerRecordCount(fieldsObj);
  }

  render() {
    const values = this.props.fileName ? [this.props.fileName] : undefined;

    return (
      <form onSubmit={this.handleOnSubmit} className={style('form')}>
        <FileInput
          label="Select Sample Schema"
          id="import-file"
          onChange={this.handleChooseFile.bind(this)}
          values={values}
          variant="VERTICAL"
        />
        <fieldset>
          <legend className={style('legend')}>Number of Documents to be added</legend>
           <input
              type="number"
              min="0"
              className={style('input')}
              placeholder="No of documents to be inserted"
              value={this.props.addDataRecordsCount}
              onChange={this.onDataCountChange.bind(this)} />
        </fieldset>
        <legend className={style('legend')}>Options</legend>
           <input
              type="number"
              min="0"
              id="string"
              className={style('input')}
              placeholder="Strings per document, default 1"
              value={this.props.fieldsPerRecordCount?.string}
              onChange={this.onFieldsCountChange.bind(this)} />
              &nbsp;&nbsp;
           <input
              type="number"
              min="0"
              id="number"
              className={style('input')}
              placeholder="Numbers per document, default 1"
              value={this.props.fieldsPerRecordCount?.number}
              onChange={this.onFieldsCountChange.bind(this)} />
              &nbsp;&nbsp;
           <input
              type="number"
              min="0"
              id="array"
              className={style('input')}
              placeholder="Arrays per document, default 1"
              value={this.props.fieldsPerRecordCount?.array}
              onChange={this.onFieldsCountChange.bind(this)} />
              &nbsp;&nbsp;
           <input
              type="number"
              min="0"
              id="document"
              className={style('input')}
              placeholder="Objects per document, default 1"
              value={this.props.fieldsPerRecordCount?.object}
              onChange={this.onFieldsCountChange.bind(this)} />
        <fieldset>
          <legend className={style('legend')}>Options</legend>
          <div className={style('option')}>
            <label className={style('option-checkbox-label')}>
              <input
                type="checkbox"
                checked={this.props.stopOnErrors}
                onChange={() => {
                  this.props.setStopOnErrors(!this.props.stopOnErrors);
                }}
                className={style('option-checkbox')}
              />
              Stop on errors
            </label>
          </div>
        </fieldset>
      </form>
    );
  }
}

export default AddDataOptions;
