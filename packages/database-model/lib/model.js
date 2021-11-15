const AmpersandModel = require('ampersand-model');
const AmpersandCollection = require('ampersand-collection');
const {
  Collection: MongoDbCollectionCollection,
} = require('mongodb-collection-model');

function mergeInit(...init) {
  return {
    initialize(...args) {
      init.forEach(({ initialize }) => {
        initialize.call(this, ...args);
      });
    },
  };
}

const Inflight = new Map();

function debounceInflight(fn) {
  return function (...args) {
    const callId = this.isCollection
      ? `${this.parent.cid}$$coll$$${fn.name}`
      : `${this.cid}$$${fn.name}`;
    if (Inflight.has(callId)) {
      return Inflight.get(callId);
    }
    const promise = fn.call(this, ...args).finally(() => {
      Inflight.delete(callId);
    });
    Inflight.set(callId, promise);
    return promise;
  };
}

function debounceActions(actions) {
  return {
    initialize() {
      actions.forEach((key) => {
        if (key in this && typeof this[key] === 'function') {
          const origFn = this[key];
          this[key] = debounceInflight(origFn);
        }
      });
    },
  };
}

function getParent(model) {
  return model.parent ?? model.collection ?? null;
}

function propagate(evtName, ...args) {
  let parent = getParent(this);
  while (parent) {
    parent.emit(evtName, ...args);
    parent = getParent(parent);
  }
}

function propagateCollectionEvents(namespace) {
  return {
    initialize() {
      if (this.isCollection) {
        this.on('add', propagate.bind(this, `add:${namespace}`));
        this.on('remove', propagate.bind(this, `remove:${namespace}`));
        this.on('change', propagate.bind(this, `change:${namespace}`));
        for (const key of Object.keys(this.model.prototype._definition)) {
          this.on(
            `change:${key}`,
            propagate.bind(this, `change:${namespace}.${key}`)
          );
        }
      }
    },
  };
}

const DatabaseModel = AmpersandModel.extend(
  debounceActions(['fetch', 'fetchCollections']),
  {
    modelType: 'Database',
    idAttribute: '_id',
    props: {
      _id: 'string',
      name: 'string',
      status: { type: 'string', default: 'initial' },
      statusError: { type: 'string', default: null },
      collectionsStatus: { type: 'string', default: 'initial' },
      collectionsStatusError: { type: 'string', default: null },

      collection_count: 'number',
      document_count: 'number',
      storage_size: 'number',
      index_count: 'number',
      index_size: 'number',
    },
    derived: {
      // Either returns a collection count from database stats or from real
      // collections length. We want to fallback to collection_count from stats
      // if possible if we haven't fetched collections yet, but use the real
      // number if real collections info is available
      collectionsLength: {
        deps: ['collection_count', 'collectionsStatus'],
        fn() {
          return ['ready', 'refreshing'].includes(this.collectionsStatus)
            ? this.collections.length
            : this.collection_count ?? 0;
        },
      },
    },
    collections: {
      collections: MongoDbCollectionCollection,
    },
    /**
     * @param {{ dataService: import('mongodb-data-service').DataService }} dataService
     * @returns {Promise<void>}
     */
    async fetch({ dataService }) {
      try {
        const newStatus = this.status === 'initial' ? 'fetching' : 'refreshing';
        this.set({ status: newStatus });
        const stats = await dataService.databaseStats(this.getId());
        this.set({ status: 'ready', statusError: null, ...stats });
      } catch (err) {
        this.set({ status: 'error', statusError: err.message });
        throw err;
      }
    },

    /**
     * @param {{ dataService: import('mongodb-data-service').DataService }} dataService
     * @returns {Promise<void>}
     */
    async fetchCollections({ dataService, fetchInfo = false }) {
      try {
        const newStatus = this.collectionsStatus === 'initial' ? 'fetching' : 'refreshing';
        this.set({ collectionsStatus: newStatus });
        await this.collections.fetch({ dataService, fetchInfo });
        this.set({ collectionsStatus: 'ready', collectionsStatusError: null });
      } catch (err) {
        this.set({
          collectionsStatus: 'error',
          collectionsStatusError: err.message,
        });
        throw err;
      }
    },

    toJSON(opts = { derived: true }) {
      return {
        ...this.serialize(opts),
        collections: this.collections.map((coll) => coll.toJSON(opts)),
      };
    },
  }
);

const DatabaseCollection = AmpersandCollection.extend(
  mergeInit(debounceActions(['fetch']), propagateCollectionEvents('databases')),
  {
    modelType: 'DatabaseCollection',
    mainIndex: '_id',
    indexes: ['name'],
    comparator: '_id',
    model: DatabaseModel,

    /**
     * @param {{ dataService: import('mongodb-data-service').DataService }} dataService
     * @returns {Promise<void>}
     */
    async fetch({ dataService }) {
      const dbs = await dataService.listDatabases({ nameOnly: true });
      this.set(dbs.map(({ _id, name }) => ({ _id, name })));
    },

    toJSON(opts = { derived: true }) {
      return this.map((item) => item.toJSON(opts));
    },
  }
);

module.exports = DatabaseModel;
module.exports.Collection = DatabaseCollection;
