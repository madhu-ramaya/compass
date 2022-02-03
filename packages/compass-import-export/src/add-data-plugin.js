import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import AddDataModal from './components/add-data-modal';

class AddDataPlugin extends Component {
  static displayName = 'AddDataPlugin';
  static propTypes = {
    store: PropTypes.object.isRequired
  }

  /**
   * Connect the Plugin to the store and render.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      <Provider store={this.props.store}>
        <AddDataModal />
      </Provider>
    );
  }
}

export default AddDataPlugin;
