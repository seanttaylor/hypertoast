import figlet from 'figlet';
import EventSource from 'eventsource';
import TOAST_PREFERENCES from './src/ht-client/preferences.js';
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
    return this.#client.request('status')();
  }

  /**
   * Sends a request to the device to begin making toast
   * @return {Object}
   */
  async makeToast() {
    return this.#client.request('on')();
  }

  /**
   * Options the client into receiving real-time updates from the device
   * @return {EventSource}
   */
  enablePushNotifications() {
    // console.log('enabling push notifications...');
    const links = this.#client.getLinkIdentifiers();
    const sseEndpoint = `${HYPERTOAST_ROOT_URL}${links['rt-updates']['href']}`;
    const sseHook = new EventSource(sseEndpoint);
    
    return sseHook;
  }

  /**
   * Establishes the cooking preferences for a specified toast request
   * @param {Object} preferences - a configuration object containing preferences for the toaster
   * @return {Object}
   */
  async setCookPreferences({ version, ...preferences}) {
    return this.#client.request('settings')(preferences, version);
  }
}

console.log(banner);

/******** MAIN ********/
try {
  const htReuben = new HTReuben(HYPERTOAST_ROOT_URL, async function onReady(htClient) {
    // 2). Executes when the link and relations processing is *completed* 
    const cuizzineArt = new HyperToastClientWrapper(htClient);
    const currentSettings = await cuizzineArt.setCookPreferences(TOAST_PREFERENCES.latest);
    const status = await cuizzineArt.getStatus();

    await cuizzineArt.makeToast();

    const notificationHook = cuizzineArt.enablePushNotifications();

    /******** ********/
    typeof status.applicationVersion === 'string' ? console.log('HyperToast client bootstrapped OK') : console.error('HyperToast client bootstrap error')
    /******** ********/

    console.log(status);

    notificationHook.addEventListener('toaster-off', (event)=> {
      // 3). The client listens for the 'toaster-off' event from the HyperToast service to
      // learn when the toast is ready via Server-Sent Event
      
      console.log('Received HyperToast message...');
      console.log(JSON.parse(event.data));
    });    
  });
  
  // 1). Launches processing of links and relations *before* the client application boots above
  const initRequest = await fetch(HYPERTOAST_ENTRYPOINT_URL);  
  const response = await initRequest.json();

  htReuben.parseAdvertisedLinks(response._links);
  await htReuben.cacheAdvertisedLinkRelations();
  
} catch(e) {
  console.error(e);
}
