import Plugin from './plugin';
import ImportPlugin from './import-plugin';
import ExportPlugin from './export-plugin';
import AddDataPlugin from './add-data-plugin';
import configureExportStore from './stores/export-store';
import configureImportStore from './stores/import-store';
import configureAddDataStore from './stores/add-data-store';

/**
 * The import plugin.
 */
const IMPORT_ROLE = {
  name: 'Import',
  component: ImportPlugin,
  configureStore: configureImportStore,
  configureActions: () => {},
  storeName: 'Import.Store'
};

/**
 * The export plugin.
 */
const EXPORT_ROLE = {
  name: 'Export',
  component: ExportPlugin,
  configureStore: configureExportStore,
  configureActions: () => {},
  storeName: 'Export.Store'
};


/**
 * The add data plugin.
 */
 const ADDDATA_ROLE = {
  name: 'AddData',
  component: AddDataPlugin,
  configureStore: configureAddDataStore,
  configureActions: () => {},
  storeName: 'AddData.Store'
};

/**
 * Activate all the components in the Import Export package.
 * @param {Object} appRegistry - The Hadron appRegisrty to activate this plugin with.
 **/
function activate(appRegistry) {
  appRegistry.registerRole('Collection.ScopedModal', IMPORT_ROLE);
  appRegistry.registerRole('Collection.ScopedModal', EXPORT_ROLE);
  appRegistry.registerRole('Collection.ScopedModal', ADDDATA_ROLE);
}

/**
 * Deactivate all the components in the Import Export package.
 * @param {Object} appRegistry - The Hadron appRegisrty to deactivate this plugin with.
 **/
function deactivate(appRegistry) {
  appRegistry.deregisterRole('Collection.ScopedModal', IMPORT_ROLE);
  appRegistry.deregisterRole('Collection.ScopedModal', EXPORT_ROLE);
  appRegistry.deregisterRole('Collection.ScopedModal', ADDDATA_ROLE);
}

export default Plugin;
export {
  activate,
  deactivate,
  ImportPlugin,
  ExportPlugin,
  AddDataPlugin,
  configureExportStore,
  configureImportStore,
  configureAddDataStore
};
export { default as metadata } from '../package.json';
