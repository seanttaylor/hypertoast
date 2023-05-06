import figlet from 'figlet';
import EventSource from 'eventsource';
import { promisify } from 'util';

const figletize = promisify(figlet);

/**
 * Adds better semantics around interacting with 
 * the HyperToast client
 */
export default class HyperToastClientWrapper {
    #client;
  
    /**
     * 
     * @param {HyperToastClient} client - an instance of HyperToastClient
     */
    constructor(client) {
      this.#client = client;
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
      console.info('Info: Requesting push notifications...');
      const links = this.#client.getLinkIdentifiers();
      const htRootURL = this.#client.getApplicationRootURL();
      const sseEndpoint = `${htRootURL}${links['rt-updates']['href']}`;
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
     * @param {Object} preferences - a configuration object containing preferences for the toaster
     * @return {Object}
     */
    async setCookPreferences(preferences) {
      return this.#client.request('settings')(preferences);
    }
}
  
  