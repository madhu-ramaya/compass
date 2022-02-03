import { combineReducers } from 'redux';

import { ns, dataService, appRegistry, globalAppRegistry } from './compass';

import stats from './stats';
import exportData from './export';
import importData from './import';
import addData from './add-data';

const rootReducer = combineReducers({
  appRegistry,
  globalAppRegistry,
  dataService,
  ns,
  stats,
  exportData,
  importData,
  addData,
});

export default rootReducer;
