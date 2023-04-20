class HyperToastClient {
    #links = {};
    #linkRelations = {}

    /**
     * 
     */
    parseAdvertisedLinks() {

    }

    /**
     * 
     */
    getLinkIdentifiers() {

    }

    /**
     * 
     */
    getLinkRelations() {

    }

    /**
     * 
     */
    request() {

    }
}

/**
 * 
 */
class HTReuben extends HyperToastClient {
  #rootURL = 'http://hypertoast:3010';
  #links = {};
  #linkRelations = {}

  /**
   * @param {Object}
   */
  parseAdvertisedLinks(links) {
    console.log("Parsing advertised links...");

    Object.entries(links).forEach(([advertisedLink, linkDescription])=> {
      this.#links[advertisedLink] = linkDescription;
      this.#linkRelations[linkDescription.rel] = {};
      //console.log(linkDescription.rel);
      /*
        follow each link at `linkDescription.rel`
        cache the response in #linkRelations with the key `relationDescription.rel` 
      */
    });

  }

  /**
   * 
   */
  async cacheAdvertisedLinkRelations() {
    console.log("Caching link relations...");
    
    Object.keys(this.#linkRelations).map(async (rel)=> {
      const response = await fetch(`${this.#rootURL}${rel}`);
      const relationDoc = await response.json();

      this.#linkRelations[rel] = {
        ETag: response.headers.get('etag'),
        ...relationDoc
      };
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
   * @return {Object}
   */
  async request(rel) {
    const URL = `${this.#rootURL}${this.#links[rel].href}`;
    const relId = this.#links[rel].rel;
    const method = this.#linkRelations[relId].method || "GET";
    const ETag = this.#linkRelations[relId].ETag;

    // after a request we should always parse new advertised links
    // this.parseAdvertisedLinks(response);
    //console.log({ URL, method, ETag });

    let response;

    if (!URL) {
      // do something if the link relation doesn't exist
      return;
    }

    if (method !== 'GET') {
      response = await fetch(URL, {
        method,
        body: {},
        headers: {
          "Content-Type": "application/json",
        }
      });

      return response.json();      
    }

    response = await fetch(URL);
    return response.json(); 
  }
}

export { HTReuben };