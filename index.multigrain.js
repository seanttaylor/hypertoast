import figlet from 'figlet';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import { promisify } from 'util';
import crypto from 'crypto';

import { HTReuben } from './src/ht-client/index.js';
import HyperToastClientWrapper from './src/ht-client/wrapper.js';
import KafkaDataPipe from './src/pipes/kafka.js';
import { Message, MessageBody, MessageHeader } from './src/message/index.js';

const APP_NAME = 'multigrain';
const APP_VERSION = process.env.APP_VERSION || '0.0.2';
const HYPERTOAST_ENTRYPOINT_URL = process.env.HYPERTOAST_ENTRYPOINT_URL || 'http://hypertoast:3010/hypertoast';
const HYPERTOAST_ROOT_URL = process.env.HYPERTOAST_ROOT_URL || 'http://hypertoast:3010';

const PORT = 3010;
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'pumpernickel_group';
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'pumpernickel';

const kafkaDP = new KafkaDataPipe({ 
  BOOTSTRAP_SERVER: KAFKA_BOOTSTRAP_SERVER, 
  CLIENT_ID, 
  GROUP_ID 
});
const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

kafkaDP.open();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

/**
 * 
 */
const SERVICE_REGISTRY = {};

/******** MAIN ********/
try {
    const htReuben = new HTReuben(HYPERTOAST_ROOT_URL, async function onReady(htClient) {
      // 2). Executes when the link and relations processing is *completed* 
      
      const cuizzineArt = new HyperToastClientWrapper(htClient);
      const status = await cuizzineArt.getStatus();
      const notificationHook = cuizzineArt.enablePushNotifications();

      kafkaDP.onPull({ topic: "ingress", onMessage: async ({ message }) => {
        const { payload } = JSON.parse(message.value.toString());
        const { id, ...preferences } = payload;
        
        await cuizzineArt.setCookPreferences({ ...preferences, _open: { toastId: id } });
        await cuizzineArt.makeToast();
        }
      });
      
      /******** ********/
      typeof status.applicationVersion === 'string' ? console.log('HyperToast client bootstrapped OK') : console.error('HyperToast client bootstrap error')
      /******** ********/
  
      console.log(status);
  
      notificationHook.addEventListener('toaster-off', (event)=> {
        // 3). The client listens for the 'toaster-off' event from the HyperToast service to
        // learn when the toast is ready via Server-Sent Event
        console.log('Received HyperToast message...');
        const { header, payload } = JSON.parse(event.data);
        
        // Check for in progress toast with `userId in `payload._open.userId`
        console.log({
          userId: payload.settings._open,
        });
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



/******** ROUTES ********/
app.get('/multigrain/status', (req, res) => {
  res.json({
      status: 'OK',
      timestamp: new Date().toISOString()
  });
});

app.post('/multigrain/v1/services/register', (req, res) => {
  console.log(`Registering service... (${req.body.serviceURI})`);
  if (SERVICE_REGISTRY[req.body.serviceName]) {
    SERVICE_REGISTRY[req.body.serviceName][req.body.serviceURI] = req.body;
    res.json({
      serviceName: req.body.serviceName,
      serviceURI: req.body.serviceURI,
      timestamp: new Date().toISOString()
    });
    return;
  }

  SERVICE_REGISTRY[req.body.serviceName] = {};
  SERVICE_REGISTRY[req.body.serviceName][req.body.serviceURI] = req.body;
  
  res.json({
    serviceName: req.body.serviceName,
    serviceURI: req.body.serviceURI,
    timestamp: new Date().toISOString()
  });
});

app.post('/multigrain/v1/toast', (req, res) => {
  const id = crypto.randomUUID();
  const myMessage = new Message(
    new MessageHeader({
      id: `/multigrain/v1/toast/${id}`,
      eventType: 'create',
      eventName: 'make.toast',
  }),
    new MessageBody({ id, ...req.body })
  );

  try { 
    kafkaDP.put({ 
      topic: 'ingress', 
      message: JSON.stringify(myMessage.value())
    });

    res.json({ id, ...req.body });
  } catch(e) {
    console.error(e);

    res.status(500);
    res.json({
      status: 500,
      error: 'There was an error'
    });
  }
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
