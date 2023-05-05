import { AsyncIterator, Iterable } from './async-iterator.js';
import SmartRouter from './smart-router.js';

class ServiceRegistry {
  instance;
  #entries = {};

  constructor() {
  
  }

  /**
   * 
   * @param {String} uri - colon-separated string in the following format (`namespace:entryName`)
   * @param {Object} entry
   */
  addEntry({ uri, entry }) {
    const [ namespace, entryName ] = uri.split(':');
    if (this.#entries[namespace]) {
      this.#entries[namespace][entryName] = entry;
      return;
    }

    this.#entries[namespace] = {};
    this.#entries[namespace][entryName] = entry;
  }

  /**
   * @returns {Array}
   */
  getEntries() {
    return Object.values(this.#entries.hypertoast);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ServiceRegistry();
    }
    return this.instance;
  }
}

/**
 * Iterates over a series of Service Registry entries describing metadata about 
 * HyperToast application instances
 */
class HTIterable extends Iterable {
  #entries;
  #MAX_RETRIES = 3;
  #currentIdx = 0;
  #retries = 0;


  /**
   * @param {Array} entries - entries from the Service Registry on HyperToast instances
   */
  constructor(entries) {
    super();
    this.#entries = entries;
  }

  /**
   * Allows a client to iterate over the entries in a `for...await`
   * @returns {IteratorResult}
   */
  async next() {
    if (this.#currentIdx === this.#entries.length) {
      this.#currentIdx = 0;
      this.#retries++; 
    }

    const done = this.#retries === this.#MAX_RETRIES;
    const value = done ? undefined : (this.#entries[this.#currentIdx]);

    this.#currentIdx++;
    
    return Promise.resolve({ value, done });
  }

}


/**
 * Routes requests to HyperToast instances. Queries the status of instances to find an
 * available instance (i.e. an instance not currently cooking) before 
 * routing a new request for toast
 */
class HTSmartRouter extends SmartRouter {
  #serviceRegistry;

  /**
   * 
   * @param {ServiceRegistry} serviceRegistry
   */
  constructor(serviceRegistry) {
    super();
    this.#serviceRegistry = serviceRegistry;
  }

  /**
   * 
   *
   */
  async getRoute() {
    console.log(this.#serviceRegistry.getEntries());

    const iterableHTInstances = new HTIterable(
      this.#serviceRegistry.getEntries()
    );
    const htInstanceList = new AsyncIterator(iterableHTInstances);

    for await (const instance of htInstanceList) {
      const { name, href } = instance;

      console.log(`querying instance status... (${name})`);

      const statusQuery = await fetch(href);
      const statusQueryResponse = await statusQuery.json();
      const instanceIsAvailable = (statusQuery.status === 200 && statusQueryResponse.name === 'off');

      if (instanceIsAvailable) {
        console.log(`available instance located... (${name})`);
        return instance;
      }
    }
  }
}

export { HTSmartRouter, ServiceRegistry };