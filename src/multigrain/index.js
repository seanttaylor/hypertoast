import { AsyncIterator, Iterable } from './async-iterator.js';
import { setTimeout} from 'timers/promises';
import SmartRouter from './smart-router.js';

/**
 * Contains all registered service instances and the 
 * metadata required to connect to those instances
 */
class ServiceRegistry {
  instance;
  #entries = {};

  constructor() {
  
  }

  /**
   * Adds an entry to the registry
   * @param {String} urn - colon-separated string in the following format (`namespace:entryName`)
   * @param {Object} entry
   */
  addEntry({ urn, entry }) {
    const [ namespace ] = urn.split(':');
    
    if (!this.#entries[namespace]) {
      this.#entries[namespace] = {};
    }

    this.#entries[namespace][entry.host] = entry;
  }

  /**
   * Fetches all registered services
   * @returns {Array}
   */
  getEntries() {
    try {
      // We may eventually have namespaces other than `hypertoast`
      return Object.values(this.#entries.hypertoast);
      // The only reason this fails is if there are no services registered
    } catch(e) {
      return [];
    }
  }

  /**
   * Deregisters a service
   * @param {String} urn
   */
  removeEntry(urn) {
    const [ namespace, entryName ] = urn.split(':');
    // We may eventually have namespaces other than `hypertoast`
    const serviceEntry = Object.values(this.#entries.hypertoast).find((entry) => entry.name === entryName);
    delete this.#entries.hypertoast[serviceEntry.host];
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ServiceRegistry();
    }
    return this.instance;
  }
}

/**
 * Iterates over a series of Service Registry entries containing metadata about 
 * HyperToast application instances
 */
class HTIterable extends Iterable {
  #entries;
  #currentIdx = 0;
  #retries = 0;
  #MAX_RETRIES = 5;
  #RETY_TIMEOUT = 10000;

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
      console.info(`Info: No available instances found. Retrying in (${(this.#RETY_TIMEOUT * this.#retries) / 1000}) seconds`);
      await setTimeout(this.#RETY_TIMEOUT * this.#retries);
    }
    
    const done = this.#retries === this.#MAX_RETRIES;
    const value = done ? undefined : (this.#entries[this.#currentIdx]);

    this.#currentIdx++;
    
    return Promise.resolve({ value, done });
  }

}


class HTSmartRouter extends SmartRouter {
  #serviceRegistry;

  /**
   * @param {ServiceRegistry} serviceRegistry 
   */
  constructor(serviceRegistry) {
    super();
    this.#serviceRegistry = serviceRegistry;
  }

  /**
   * Asynchronously iterates over all application instances; stops
   * iterating when an available instance is identified
   * @returns {Object} 
   */
  async getAppInstanceMetadata() {
    const iterableHTInstances = new HTIterable(
      this.#serviceRegistry.getEntries()
    );
    const htInstanceList = new AsyncIterator(iterableHTInstances);

    for await (const instance of htInstanceList) {
      const { name, host, port } = instance;

      // console.info(`Info: Querying instance status... (${name})`);

      const statusQuery = await fetch(`${host}:${port}/hypertoast/v1/status`);
      const statusQueryResponse = await statusQuery.json();
      const instanceIsAvailable = (statusQuery.status === 200 && statusQueryResponse.name === 'off');

      if (instanceIsAvailable) {
        console.info(`Info: Available instance located... (${name})`);
        return instance;
      }
      //return this.getAppInstanceMetadata();
    }
  }
}

export { HTSmartRouter, ServiceRegistry };