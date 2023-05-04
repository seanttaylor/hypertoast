import { AsyncIterator, Iterable, IteratorResult } from './async-iterator.js';
import SmartRouter from './smart-router.js';

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
   * @param {Object} entries - entries from the Service Registry on HyperToast instances
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

    const value = done ? undefined : ({ 
      href: this.#entries[this.#currentIdx]['href'],
      instanceName: this.#entries[this.#currentIdx]['name'] 
    });

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
   * @param {Object} serviceRegistry
   */
  constructor(serviceRegistry) {
    super();
    this.#serviceRegistry = serviceRegistry;
  }

  /**
   * Routes requests for toast to the next available HyperToast instance
   * @param {Object} request - HyperToast message requesting new toast
   */
  async route(request) {
    const iterableHTInstances = new HTIterable(
      Object.values(this.#serviceRegistry.hypertoast)
    );
    const htInstanceList = new AsyncIterator(iterableHTInstances);

    for await (const instance of htInstanceList) {
      const { instanceName, href } = instance;

      console.log(`checking instance... (${instanceName})`);

      const statusCheckResponse = await fetch(href);

      if (statusCheckResponse.status === 200) {
        console.log(`available instance located... (${instanceName})`);
        
        const messageResponse = await fetch('https://httpbin.org/anything', {
          method: 'POST',
          body: JSON.stringify(request),
          headers: {
            'content-type': 'application/json'
          }
        });

        const responseData = await messageResponse.json();
        console.log(responseData.json);
        break;
      }
    }
  }
}

export { HTSmartRouter };