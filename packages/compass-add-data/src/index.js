import CompassAddDataPlugin from './plugin';
import configureStore from './stores';
import configureActions from './actions';
import { TAB_NAME } from './constants/plugin';

/**
 * A sample role for the component.
 */
const ROLE = {
  component: CompassAddDataPlugin,
  name: TAB_NAME,
  hasQueryHistory: true,
  order: 3,
  configureStore: configureStore,
  configureActions: configureActions,
  storeName: 'AddData.Store',
  actionName: 'AddData.Actions'
};

/**
 * Activate all the components in the Compass Schema package.
 * @param {Object} appRegistry - The Hadron appRegisrty to activate this plugin with.
 **/
function activate(appRegistry) {
  appRegistry.registerRole('Collection.Tab', ROLE);
}

/**
 * Deactivate all the components in the Compass Schema package.
 * @param {Object} appRegistry - The Hadron appRegisrty to deactivate this plugin with.
 **/
function deactivate(appRegistry) {
  appRegistry.deregisterRole('Collection.Tab', ROLE);
}

export default CompassAddDataPlugin;
export { activate, deactivate, configureStore };
export { default as metadata } from '../package.json';
