/* eslint react/no-multi-comp:0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusRow, ZeroState } from 'hadron-react-components';
import { TextButton } from 'hadron-react-buttons';
import { CancelLoader } from '@mongodb-js/compass-components';
import Field from '../field';
import AnalysisCompleteMessage from '../analysis-complete-message';
import ZeroGraphic from '../zero-graphic';
import get from 'lodash.get';
import classnames from 'classnames';
import CustomDocumentList from '../../../../compass-crud/src/components/custom-document-list';
import { StoreConnector } from 'hadron-react-components';
import styles from './compass-add-data.module.less';
import {
  ANALYSIS_STATE_INITIAL,
  ANALYSIS_STATE_ANALYZING,
  ANALYSIS_STATE_ERROR,
  ANALYSIS_STATE_COMPLETE,
  ANALYSIS_STATE_TIMEOUT
} from '../../constants/analysis-states';

const ERROR_WARNING = 'An error occurred during adding data';
const OUTDATED_WARNING = 'The add data content is outdated and no longer in sync'
  + ' with the documents view. Press "Add Data" again to add data';

const INCREASE_MAX_TIME_MS_HINT = 'Operation exceeded time limit. Please try increasing the maxTimeMS for the query in the filter options.';

const HEADER = 'Add Data';

const SUBTEXT = 'Add sample test data';

const DOCUMENTATION_LINK = 'https://docs.mongodb.com/compass/master/schema/';


/**
 * Component for the entire schema view component.
 */
class AddData extends Component {
  static displayName = 'AddDataComponent';

  static propTypes = {
    actions: PropTypes.object,
    store: PropTypes.object.isRequired,
    analysisState: PropTypes.oneOf([
      ANALYSIS_STATE_INITIAL,
      ANALYSIS_STATE_ANALYZING,
      ANALYSIS_STATE_ERROR,
      ANALYSIS_STATE_COMPLETE,
      ANALYSIS_STATE_TIMEOUT
    ]),
    outdated: PropTypes.bool,
    isActiveTab: PropTypes.bool,
    errorMessage: PropTypes.string,
    maxTimeMS: PropTypes.number,
    schema: PropTypes.any,
    count: PropTypes.number,
    resultId: PropTypes.number
  }

  constructor(props) {
    super(props);
    const appRegistry = props.store.localAppRegistry;
    this.queryBarRole = appRegistry.getRole('Query.QueryBar')[0];
    this.queryBar = this.queryBarRole.component;
    this.queryBarStore = appRegistry.getStore(this.queryBarRole.storeName);
    this.queryBarActions = appRegistry.getAction(this.queryBarRole.actionName);
  }

  componentDidUpdate(prevProps) {
    // when the namespace changes and the schema tab is not active, the
    // tab is "display:none" and its width 0. That also means the the minichart
    // auto-sizes to 0. Therefore, when the user switches back to the tab,
    // making it "display:block" again and giving it a proper non-zero size,
    // the minicharts have to be re-rendered.
    //
    if (
      prevProps.isActiveTab !== this.props.isActiveTab &&
      this.props.isActiveTab
    ) {
      this.props.actions.resizeMiniCharts();
    }
  }

  onApplyClicked() {
    //this.props.actions.startAddData();
    this.props.actions.openAddDataDialog();
  }

  onCancelClicked() {
    this.props.actions.stopAddData();
  }

  onResetClicked() {
    this.props.actions.startAddData();
  }

  onOpenLink(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const { shell } = require('electron');
    shell.openExternal(DOCUMENTATION_LINK);
  }

  renderBanner() {
    const analysisState = this.props.analysisState;

    if (analysisState === ANALYSIS_STATE_ERROR) {
      return <StatusRow style="error">{ERROR_WARNING}: {this.props.errorMessage}</StatusRow>;
    }

    if (analysisState === ANALYSIS_STATE_TIMEOUT) {
      return <StatusRow style="warning">{INCREASE_MAX_TIME_MS_HINT}</StatusRow>;
    }

    if (analysisState === ANALYSIS_STATE_COMPLETE) {
      return (
        this.props.outdated ?
          <StatusRow style="warning">{OUTDATED_WARNING}</StatusRow> :
          <AnalysisCompleteMessage
            sampleSize={this.props.schema ? this.props.schema.count : 0}
          />
      );
    }

    return null;
  }

  renderFieldList() {
    if (this.props.analysisState !== ANALYSIS_STATE_COMPLETE) {
      return;
    }

    return get(this.props.schema, 'fields', []).map((field) => {
      return (
        <Field
          key={field.name}
          actions={this.props.actions}
          localAppRegistry={this.props.store.localAppRegistry}
          {...field} />
      );
    });
  }

  renderDocument(){
    return(
      <StoreConnector store={this.props.store}>
      <CustomDocumentList
        {...this.props.actions}
        {...this.props}
        pageLoadedListenable={this.props.store}
        isExportable />
    </StoreConnector>
    );
  }

  renderInitialScreen() {
    return ( 
      <div className={classnames(styles['schema-zero-state'])}>
      <ZeroGraphic />
      <ZeroState
        header={HEADER}
        subtext={SUBTEXT}>
        <div className={classnames(styles['schema-zero-state-action'])}>
          <div>
            <TextButton
              dataTestId="add-data-button"
              className="btn btn-primary btn-lg"
              text="Add Data"
              clickHandler={this.onApplyClicked.bind(this)} 
              />
          </div>
        </div>
        <a className={classnames(styles['schema-zero-state-link'])} onClick={this.onOpenLink.bind(this)}>
        Learn more about adding test data in Compass
        </a>
      </ZeroState>
    </div>
    );
  }

  renderAnalyzing() {
    return (<CancelLoader
      dataTestId="analyzing-documents"
      progressText="Analyzing Documents"
      cancelText="Stop"
      onCancel={this.onCancelClicked.bind(this)}
    />);
  }

  /**
   * Renders the zero state during the initial state; renders the schema if not.
   * @returns {React.Component} Zero state or fields.
   */
  renderContent() {
    console.log(this.props.analysisState)
    console.log(this.props.AddData);
    if (this.props.analysisState === ANALYSIS_STATE_INITIAL) {
      return (
        //this.renderInitialScreen()
        this.renderDocument()
      );
    }

    if (this.props.analysisState === ANALYSIS_STATE_ANALYZING) {
      return (
        this.renderAnalyzing()
      );
    }

    return (
      <div className="column-container">
        <div className="column main">
          <div className="schema-field-list">
            {this.renderFieldList()}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render the schema
   *
   * @returns {React.Component} The schema view.
   */
  render() {
    return (
      <div className={classnames(styles.root)}>
        <div className="controls-container">
          {/* <this.queryBar
            store={this.queryBarStore}
            actions={this.queryBarActions}
            buttonLabel="Analyze"
            resultId={this.props.resultId}
            onApply={this.onApplyClicked.bind(this)}
            onReset={this.onResetClicked.bind(this)}
          /> */}
          {this.renderBanner()}
        </div>
        {this.renderContent()}
      </div>
    );
  }
}

export default AddData;



