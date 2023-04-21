import figlet from 'figlet';
import { promisify } from 'util';
import { HTReuben } from './src/ht-client/index.js';

const APP_NAME = 'reuben';
const APP_VERSION = '0.0.1';
const HYPERTOAST_ENTRYPOINT_URL = process.env.HYPERTOAST_ENTRYPOINT_URL;
const HYPERTOAST_ROOT_URL = process.env.HYPERTOAST_ROOT_URL || 'http://hypertoast:3010';

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);

/**
 * Adds better some semantics around interacting with the HyperToast client; not expressly necessary
 */
class HyperToastClientWrapper {
  #client;

  /**
   * 
   * @param {HyperToastClient} client - an instance of HyperToastClient
   */
  constructor(client) {
    this.#client = client
  }

  /**
   * Queries the status of the device
   * @return {Object}
   */
  async getStatus() {
    return this.#client.request("status")();
  }

  /**
   * Sends a request to the device to begin making toast
   * @return {Object}
   */
  makeToast() {
    return this.#client.request("on")();
  }
}

(async function() {
  console.log(banner);

  try {
    const htReuben = new HTReuben(HYPERTOAST_ROOT_URL, async(htClient) => {
      const cuizzineArt = new HyperToastClientWrapper(htClient);
      const onResponse = await cuizzineArt.getStatus();
      const statusResponse = await cuizzineArt.makeToast();

      console.log(htClient.getCachedLinkRelations());

      //const onResponse = await htClient.request("on")();
      //const statusResponse = await htClient.request("status")();
      console.log({ onResponse, statusResponse });
    });

    const initRequest = await fetch(HYPERTOAST_ENTRYPOINT_URL);  
    const response = await initRequest.json();
  
    htReuben.parseAdvertisedLinks(response._links);
    await htReuben.cacheAdvertisedLinkRelations();
    
  } catch(e) {
    console.error(e);
  }
}());