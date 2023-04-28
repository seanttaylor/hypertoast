class HyperToastClient {
    #links = {};
    #linkRelations = {}

    /**
     * Collects the top level _links object from an API response for use in making subsequent API requests
     */
    parseAdvertisedLinks() {

    }

    /**
     * Returns the stored link indentifiers collected from `parseAdvertisedLinks`
     */
    getLinkIdentifiers() {

    }

    /**
     * Returns the cached link relations collected from `cacheAdvertisedLinkRelations`
     */
    getCachedLinkRelations() {

    }
    
    /**
     * Stores the link relation information for specified links
     */
    cacheAdvertisedLinkRelations() {

    }

    /**
     * The API client used to interact with the HyperToast API
     */
    request() {

    }
}

/**
 * 
 */
class HTReuben extends HyperToastClient {
  #links = {};
  #linkRelations = {};
  #objectTags = {};
  #onReady;
  #rootURL; 

  /**
   * 
   * @param {String} rootURL 
   * @param {Function} onReady
   */
  constructor(rootURL, onReady) {
    super();
    this.#rootURL = rootURL;
    this.#onReady = onReady;

  }
  /**
   * 
   * @param {Object} links - the `_links` object on an application/vnd.hypertoast API response
   */
  parseAdvertisedLinks(links) {
    console.log('Parsing advertised links...');

    Object.entries(links).forEach(([advertisedLink, linkDescription])=> {
      this.#links[advertisedLink] = linkDescription;
      this.#linkRelations[linkDescription.rel] = {};
    });
  }

  /**
   * Stores the link relation information for specified links
   */
  async cacheAdvertisedLinkRelations() {
    console.log('Caching link relations...');
    const linkRelations = Object.keys(this.#linkRelations);
    
    linkRelations.map(async (rel, idx,)=> {
      const response = await fetch(`${this.#rootURL}${rel}`);
      const relationDoc = await response.json();

      this.#linkRelations[rel] = {
        ETag: response.headers.get('etag'),
        ...relationDoc
      };

      // Hacky way to determine when the asnyc processing is complete
      // We fire off the client-defined `onReady` method when all link relations are known providing 
      // a hook into the current context with `this`

      if (idx === linkRelations.length - 1) {
        console.log('Caching complete...');
        // Need to find a solution to ensure the `onReady` function is only called once
        this.#onReady(this);
      }
    });
  }

  /**
   * @return {Object}
   */
  getLinkIdentifiers() {
    return this.#links;
  }

  /**
   * @return {Object}
   */
  getCachedLinkRelations() {
    return this.#linkRelations;
  }

  /**
   * @param {String} rel
   */
  async getServiceObjectTags(rel) {
    const linkRelation = this.#linkRelations[rel];
    
    if (this.#objectTags[linkRelation]) {
      return this.#objectTags[linkRelation];
    }

    console.log(`${this.#rootURL}${linkRelation.tags.href}`);

    const response = await fetch(`${this.#rootURL}${linkRelation.tags.href}`);
    const objectTag = await response.json();

    this.#objectTags[linkRelation] = objectTag;

    return objectTag;
  } 
  
  /**
   * 
   * @param {String} rel
   * @return {Object}
   */
  request(rel) {
    const URL = `${this.#rootURL}${this.#links[rel].href}`;
    const relId = this.#links[rel].rel;
    const method = this.#linkRelations[relId].method || "GET";

    const ETag = this.#linkRelations[relId].ETag;
    const acceptHeaders = this.#linkRelations[relId]?.headers?.accept.join(';');
    const contentTypeHeader = this.#linkRelations[relId]?.headers['content-type'] || 'application/json';

    // after a request we should always parse new advertised links
    // this.parseAdvertisedLinks(response);
    //console.log({ URL, method, ETag });

    if (!URL) {
      // do something if the link relation doesn't exist
      return;
    }

    /**
     * @param {Object} body - request body 
     */
    return async function(body={}) { 
      
      const options = {
        method,
        headers: {
          //'accept': `application/vnd.hypertoast;schema=${schemaVersion}`,
          'accept': acceptHeaders,
          'content-type': contentTypeHeader,
        }
      };

      // We only want to attach a body to *non* GET requests
      if (options.method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(URL, options);
      return response.json();      
    }
  }
}

export { HTReuben };