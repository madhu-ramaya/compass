import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StoreConnector } from 'hadron-react-components';
import CompassAddData from './components/compass-add-data';

class Plugin extends Component {
  static displayName = 'CompassAddDataPlugin';

  static propTypes = {
    store: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }

  /**
   * Connect the Plugin to the store and render.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <StoreConnector store={this.props.store}>
        <CompassAddData {...this.props} />
      </StoreConnector>
    );
  }
}

export default Plugin;
