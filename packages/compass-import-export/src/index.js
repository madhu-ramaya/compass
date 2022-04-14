import Plugin from './plugin';
import ImportPlugin from './import-plugin';
import ExportPlugin from './export-plugin';
import AddDataPlugin from './add-data-plugin';
import configureExportStore from './stores/export-store';
import configureImportStore from './stores/import-store';
import configureAddDataStore from './stores/add-data-store';
import { configureActions } from '../../compass-crud/src';
import configureStore from './stores/export-store';

import {   
  StandardEditor,
  DateEditor,
  StringEditor,
  Int32Editor,
  DoubleEditor,
  NullEditor,
  UndefinedEditor,
  ObjectIdEditor } from '../../compass-crud/src/components/editor';


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
  hasQueryHistory: true,
  order: 1,
  configureStore: configureStore,
  storeName: 'CRUD.Store',
  configureActions: configureActions,
  actionName: 'CRUD.Actions'
};

const DOCUMENT_ROLE = {
  name: 'AddData',
  component: AddDataPlugin,
  hasQueryHistory: true,
  order: 1,
  configureStore: configureStore,
  storeName: 'CRUD.Store',
  configureActions: configureActions,
  actionName: 'CRUD.Actions'
};

const STANDARD_EDITOR_ROLE = {
  component: StandardEditor
};

const DATE_EDITOR_ROLE = {
  component: DateEditor
};

const DOUBLE_EDITOR_ROLE = {
  component: DoubleEditor
};

const STRING_EDITOR_ROLE = {
  component: StringEditor
};

const INT32_EDITOR_ROLE = {
  component: Int32Editor
};

const NULL_EDITOR_ROLE = {
  component: NullEditor
};

const UNDEFINED_EDITOR_ROLE = {
  component: UndefinedEditor
};

const OBJECT_ID_EDITOR_ROLE = {
  component: ObjectIdEditor
};

/**
 * Activate all the components in the Import Export package.
 * @param {Object} appRegistry - The Hadron appRegisrty to activate this plugin with.
 **/
function activate(appRegistry) {
  // appRegistry.registerRole('Collection.ScopedModal', IMPORT_ROLE);
  // appRegistry.registerRole('Collection.ScopedModal', EXPORT_ROLE);
  // appRegistry.registerRole('Collection.ScopedModal', ADDDATA_ROLE);
  appRegistry.registerRole('CRUD.Document', DOCUMENT_ROLE);
  appRegistry.registerRole('CRUD.Editor.Standard', STANDARD_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.Date', DATE_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.Double', DOUBLE_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.String', STRING_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.Int32', INT32_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.Null', NULL_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.Undefined', UNDEFINED_EDITOR_ROLE);
  appRegistry.registerRole('CRUD.Editor.ObjectID', OBJECT_ID_EDITOR_ROLE);
}

/**
 * Deactivate all the components in the Import Export package.
 * @param {Object} appRegistry - The Hadron appRegisrty to deactivate this plugin with.
 **/
function deactivate(appRegistry) {
  // appRegistry.deregisterRole('Collection.ScopedModal', IMPORT_ROLE);
  // appRegistry.deregisterRole('Collection.ScopedModal', EXPORT_ROLE);
  // appRegistry.deregisterRole('Collection.ScopedModal', ADDDATA_ROLE);
  appRegistry.deregisterRole('CRUD.Document', DOCUMENT_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.Standard', STANDARD_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.Date', DATE_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.Double', DOUBLE_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.String', STRING_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.Int32', INT32_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.Null', NULL_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.Undefined', UNDEFINED_EDITOR_ROLE);
  appRegistry.deregisterRole('CRUD.Editor.ObjectID', OBJECT_ID_EDITOR_ROLE);

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
