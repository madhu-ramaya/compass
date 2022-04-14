import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { FileInput } from '@mongodb-js/compass-components';

import FILE_TYPES from '../../constants/file-types';

import styles from './upload-modal.module.less';
import createStyler from '../../utils/styler.js';
const style = createStyler(styles, 'upload-modal');

class UploadModal extends PureComponent {
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
    fileOpenDialog: PropTypes.func
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

  render() {
    const isCSV = this.props.fileType === FILE_TYPES.CSV;

    const values = this.props.fileName ? [this.props.fileName] : undefined;

    return (
      <form onSubmit={this.handleOnSubmit} className={style('form')}>
        <FileInput
          label="Select File"
          id="import-file"
          onChange={this.handleChooseFile.bind(this)}
          values={values}
          variant="VERTICAL"
        />
      </form>
    );
  }
}

export default UploadModal;
