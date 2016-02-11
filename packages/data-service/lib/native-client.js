var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

/**
 * Instantiate a new NativeClient object.
 *
 * @constructor
 * @param {Connection} connection - The Connection model.
 */
function NativeClient(connection) {
  var client = this;
  this.connection = connection;
  MongoClient.connect(this.connection.driver_url, function(error, database) {
    assert.equal(null, error);
    client.setDatabase(database);
  });
}

/**
 * The NativeClient API.
 */
NativeClient.prototype = (function() {
  /**
   * Get the collection name from a namespace.
   *
   * @param {string} ns - The namespace in database.collection format.
   * @returns {string} The collection name.
   */
  var collectionName = function(ns) {
    return ns.split('.')[1];
  };

  /**
   * Get the database name from a namespace.
   *
   * @param {string} ns - The namespace in database.collection format.
   * @returns {string} The database name.
   */
  var databaseName = function(ns) {
    return ns.split('.')[0];
  };

  /**
   * Get the collection to operate on.
   *
   * @param {string} ns - The namespace.
   * @returns {Collection} The collection.
   */
  var collection = function(ns) {
    return this.database.db(databaseName(ns)).collection(collectionName(ns));
  };

  return {
    constructor: NativeClient,

    /**
     * Count the number of documents in the collection for the provided filter
     * and options.
     *
     * @param {string} ns - The namespace to search on.
     * @param {object} filter - The filter.
     * @param {object} options - The query options.
     * @returns {Promise} The count.
     */
    count: function(ns, filter, options) {
      return collection.call(this, ns).count(filter, options);
    },

    /**
     * Get a list of databases for the server.
     *
     * @returns {Promise} The list of databases.
     */
    databases: function() {
      return this.database.admin().listDatabases();
    },

    /**
     * Find documents for the provided filter and options on the collection.
     *
     * @param {string} ns - The namespace to search on.
     * @param {object} filter - The filter.
     * @param {object} options - The query options.
     * @returns {Cursor} The cursor.
     */
    find: function(ns, filter, options) {
      return collection.call(this, ns).find(filter, options);
    },

    /**
     * Set the database on the client once the connection is made.
     *
     * @param {DB} database - The database object.
     */
    setDatabase: function(database) {
      this.database = database;
    }
  };
})();

module.exports = NativeClient;
