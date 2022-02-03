const Reflux = require('reflux');

/**
 * Need to create an instance of actions for each store.
 *
 * @returns {Actions} - The actions.
 */
const configureActions = () => {
  return Reflux.createActions({
    /**
     * starts schema analysis with the current query
     */
    startAddData: {sync: false},
    /**
     * stops schema analysis
     */
    stopAddData: {sync: true},
    /**
     * Reset store
     */
    reset: {sync: false},
    /**
     * set new maxTimeMS value
     */
    setMaxTimeMS: {sync: true},
    /**
     * reset maxTimeMS value to default
     */
    resetMaxTimeMS: {sync: true},
    /**
     * Resize the minicharts.
     */
    resizeMiniCharts: {sync: true},
    geoLayerAdded: {sync: true},
    geoLayersEdited: {sync: true},
    geoLayersDeleted: {sync: true},
    openAddDataDialog: {sync: false},
  });
};

export default configureActions;
