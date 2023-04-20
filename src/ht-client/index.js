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
    #links = {};
    #linkRelations = {}
  
    /**
     * @param {Object}
     */
    parseAdvertisedLinks(links) {
      console.log("Parsing advertised links...");
  
      Object.entries(links).forEach(([advertisedLink, linkDescription])=> {
        this.#links[advertisedLink] = linkDescription;
        //console.log(linkDescription.rel);
        /*
          follow each link at `relationDescription.rel`
          cache the response in #linkRelations with the key `relationDescription.rel` 
        */
      });
  
    }
  
    /**
     * @return {Object}
     */
    getLinkIdentifiers() {
      return this.#links;
    }
    
    /**
     * @param {String} rel
     * @return {Object}
     */
    async request(rel) {
      const URL = this.#links[rel];
      const method = this.#linkRelations[rel].method;
      let response;
  
      if (!URL) {
        // do something if the link relation doesn't exist
        return;
      }
  
      if (method !== 'GET') {
        response = await fetch(URL, {
          method,
          body: {}
        });
        // after a request we should always parse new advertised links
        // this.parseAdvertisedLinks(response);
        return response.json();
      }
  
      return fetch(URL);
    }
}

export { HTReuben };