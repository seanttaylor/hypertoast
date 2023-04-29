import figlet from 'figlet';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';

import { promisify } from 'util';
import { HTReuben } from './src/ht-client/index.js';
import HyperToastClientWrapper from './src/ht-client/wrapper.js';
import DomainMapping from './src/ht-client/mapping.js';
import DOMAINS from './src/ht-client/domains.js'

const APP_NAME = 'multigrain';
const APP_VERSION = process.env.APP_VERSION || '0.0.1';
const HYPERTOAST_ENTRYPOINT_URL = process.env.HYPERTOAST_ENTRYPOINT_URL || 'http://hypertoast:3010/hypertoast';
const HYPERTOAST_ROOT_URL = process.env.HYPERTOAST_ROOT_URL || 'http://hypertoast:3010';
const PORT = 3010;

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

/******** MAIN ********/
try {
    const htReuben = new HTReuben(HYPERTOAST_ROOT_URL, async function onReady(htClient) {
      // 2). Executes when the link and relations processing is *completed* 
      const cuizzineArt = new HyperToastClientWrapper(htClient);
      /* 
      await cuizzineArt.setCookPreferences({
        version: APP_VERSION,
        preferences: TOAST_PREFERENCES[APP_VERSION]
      });
      */
      const status = await cuizzineArt.getStatus();
      // await cuizzineArt.makeToast();
      
      const notificationHook = cuizzineArt.enablePushNotifications();
      // const { settings: settingsLinkId } = htClient.getLinkIdentifiers();
      // const settingsTag = await htClient.getServiceObjectTags(settingsLinkId.rel);
  
      /* const deviceSettings = new DeviceSettings(
        new DomainMapping({
          props: DOMAINS.settings, 
          source: status.settings, 
          tags: settingsTag,
        })
      );*/
  
      // cuizzineArt.displayCookingMode(deviceSettings);
      
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


/**
 * 
 */
const deviceRegistry = {
    toaster: {}
};



/******** ROUTES ********/
app.get('/multigrain/status', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.post('/multigrain/v1/devices/register', (req, res) => {
    res.json({});
});

app.post('/multigrain/v1/toast', (req, res) => {
    res.json({});
});
  
app.use((req, res) => {
    res.status(404).send({ status: 404, error: 'Not Found' });
});
  
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(err);
    res.status(status).send({ status, error: 'There was an error.' });
});

app.listen(PORT, () => {
    console.log(banner);
    console.log(` App listening at http://localhost:${PORT}`);
});
