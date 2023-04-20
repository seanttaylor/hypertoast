import figlet from 'figlet';
import { promisify } from 'util';
import { HTReuben } from './src/ht-client/index.js';

const APP_NAME = 'reuben';
const APP_VERSION = '0.0.1';
const HYPERTOAST_ENTRYPOINT_URL = process.env.HYPERTOAST_ENTRYPOINT_URL;

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);

(async function HyperToastClient() {
    console.log(banner);

    try {
      const htReuben = new HTReuben();
      const initRequest = await fetch(HYPERTOAST_ENTRYPOINT_URL);  
      
      const response = await initRequest.json();
    
      htReuben.parseAdvertisedLinks(response._links);
      await htReuben.cacheAdvertisedLinkRelations();
      setTimeout(async () => {
        const statusRequest = await htReuben.request('status');
        console.log({statusRequest});
      }, 10000);
    
      //const hyperToastRequest = await htReuben.request("settings")();
  
    } catch(e) {
      console.error(e);
    }

    return {}
}());