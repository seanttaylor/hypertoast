import figlet from 'figlet';
import EventSource from 'eventsource';
import { promisify } from 'util';

import { HTReuben } from './src/ht-client/index.js';
import DomainMapping from './src/ht-client/mapping.js';
import DOMAINS from './src/ht-client/domains.js';
import TOAST_PREFERENCES from './src/ht-client/preferences.js';

const APP_NAME = 'reuben';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
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
   * Opts the client into receiving real-time updates from the device
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
   * Shows the current cooking mode on the device marquee
   * @param {DeviceSettings} settings
   */
  async displayCookingMode(settings) {
    const marquee = await figletize(`hmm... ${settings.getSettings().mode}`);
    console.log(marquee);
  }

  /**
   * Establishes the cooking preferences for a specified toast request
   * @param {String} version - application version
   * @param {Object} preferences - a configuration object containing preferences for the toaster
   * @return {Object}
   */
  async setCookPreferences({ version, preferences }) {
    return this.#client.request('settings')(preferences, version);
  }
}


/**
 * 
 */
class DeviceSettings {
  #settings;

  /**
   * @param {DomainMapping} settings - mapping of device settings from the Service domain to the Client domain
   */
  constructor(settings) {
    this.#settings = settings;
  }

  /**
   * 
   */
  getSettings() {
    return this.#settings;
  }
}


/******** MAIN ********/
try {
  const htReuben = new HTReuben(HYPERTOAST_ROOT_URL, async function onReady(htClient) {
    // 2). Executes when the link and relations processing is *completed* 
    const cuizzineArt = new HyperToastClientWrapper(htClient);
    await cuizzineArt.setCookPreferences({
      version: APP_VERSION,
      preferences: TOAST_PREFERENCES[APP_VERSION]
    });
    const status = await cuizzineArt.getStatus();
    await cuizzineArt.makeToast();
    
    const notificationHook = cuizzineArt.enablePushNotifications();
    const { settings: settingsLinkId } = htClient.getLinkIdentifiers();
    const settingsTag = await htClient.getServiceObjectTags(settingsLinkId.rel);

    const deviceSettings = new DeviceSettings(
      new DomainMapping({
        props: DOMAINS.settings, 
        source: status.settings, 
        tags: settingsTag,
      })
    );

    cuizzineArt.displayCookingMode(deviceSettings);
    
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
  
  console.log(banner);
  htReuben.parseAdvertisedLinks(response._links);
  await htReuben.cacheAdvertisedLinkRelations();
  
} catch(e) {
  console.error(e);
}
