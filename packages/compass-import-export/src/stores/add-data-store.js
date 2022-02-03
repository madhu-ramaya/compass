import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { ipcRenderer } from 'electron';

import reducer from '../modules';
import {
  dataServiceConnected,
  appRegistryActivated,
  globalAppRegistryActivated,
  nsChanged
} from '../modules/compass';
import { statsReceived } from '../modules/stats';
import { createDebug } from '../utils/logger';
import { openAddData } from '../modules/add-data';

const debug = createDebug('add-data-store');

/**
 * Set the data provider.
 *
 * @param {Store} store - The store.
 * @param {Error} error - The error (if any) while connecting.
 * @param {Object} provider - The data provider.
 */
export const setDataProvider = (store, error, provider) => {
  store.dispatch(dataServiceConnected(error, provider));
};



const configureStore = (options = {}) => {
  // const store = Reflux.createStore({
  //   listenables: options.actions,
  //   openAddDataDialog() {
  //     console.log('add-data-store.js openAddDataDialog', openAddDataDialog)
  //     this.localAppRegistry.emit('open-add-data');
  //   },
  // })
  /**
   * The store has a combined reducer.
   */
  const store = createStore(reducer, applyMiddleware(thunk));
  /**
   * Called when the app registry is activated.
   *
   * @param {AppRegistry} appRegistry - The app registry.
   */
  if (options.localAppRegistry) {
    const appRegistry = options.localAppRegistry;
    store.dispatch(appRegistryActivated(appRegistry));

    appRegistry.on('open-add-data', () => {
      console.log('import-export add-data-store appRegistry.on')
      store.dispatch(openAddData())
    }
    );
    appRegistry.getStore('CollectionStats.Store').listen(stats => {
      debug('dispatching statsReceived', stats);
      store.dispatch(statsReceived(stats));
    });
  }

  if (options.globalAppRegistry) {
    const appRegistry = options.globalAppRegistry;
    store.dispatch(globalAppRegistryActivated(appRegistry));
  }

  if (options.dataProvider) {
    setDataProvider(
      store,
      options.dataProvider.error,
      options.dataProvider.dataProvider
    );
  }

  if (options.namespace) {
    store.dispatch(nsChanged(options.namespace));
  }

  /**
   * TODO: Make this use `hadron-ipc`/"unified compass API".
   */
  if (ipcRenderer) {
    ipcRenderer.on('compass:open-add-data', () => {
      store.dispatch(openAddData());
    });
  }

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers.
    // https://github.com/reactjs/react-redux/releases/tag/v2.0.0
    module.hot.accept('../modules', () => {
      const nextRootReducer = require('../modules');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};

export default configureStore;
