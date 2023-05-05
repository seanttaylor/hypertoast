import { promisify } from 'util';
import crypto from 'crypto';

import figlet from 'figlet';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import randomPetName from 'node-petname';

import { HTReuben } from './src/ht-client/index.js';
import HyperToastClientWrapper from './src/ht-client/wrapper.js';
import KafkaDataPipe from './src/pipes/kafka.js';
import { Message, MessageBody, MessageHeader } from './src/message/index.js';

import { HTSmartRouter, ServiceRegistry } from './src/multigrain/index.js';

const APP_NAME = 'multigrain';
const APP_VERSION = process.env.APP_VERSION || '0.0.2';
const HYPERTOAST_ENTRYPOINT_URL = process.env.HYPERTOAST_ENTRYPOINT_URL || 'http://hypertoast:3010/hypertoast';
const HYPERTOAST_ROOT_URL = process.env.HYPERTOAST_ROOT_URL || 'http://hypertoast:3010';

const PORT = 3010;
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'pumpernickel_group';
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'pumpernickel';

const serviceRegistry = ServiceRegistry.getInstance();
const smartRouter = new HTSmartRouter(serviceRegistry);
const kafkaDP = new KafkaDataPipe({ 
  BOOTSTRAP_SERVER: KAFKA_BOOTSTRAP_SERVER, 
  CLIENT_ID, 
  GROUP_ID 
});

/**
 * 
 */
const HTClientSmartRoutingPlugin = {
  async findAvailableToaster() {
    const route = await smartRouter.getRoute();
    console.log(route);
    this.setApplicationRootURL(`${route.host}:${route.port}`);
  }
};

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

kafkaDP.open();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

/******** MAIN ********/
try {
    const htReuben = new HTReuben(HYPERTOAST_ROOT_URL, async function onReady(htClient) {
      // 2). Executes when the link and relations processing is *completed* 

      let cuizzineArt = new HyperToastClientWrapper(htClient);
      cuizzineArt = Object.assign(cuizzineArt, HTClientSmartRoutingPlugin);
      
      // For more info about pausing/resuming Kafka topics see (https://kafka.js.org/docs/consuming#pause-amp-resume);
      kafkaDP.onPull({ topic: 'ingress', onMessage: async ({ message, pause }) => {
        const { payload } = JSON.parse(message.value.toString());
        const { id, ...preferences } = payload;        

        try {
          //const resumeMessageProcessing = pause();

          await cuizzineArt.findAvailableToaster.call(htClient);
          await cuizzineArt.setCookPreferences({ ...preferences, _open: { toastId: id } });
          await cuizzineArt.makeToast();
          
          //resumeMessageProcessing();

        } catch(e) {
          console.error(e);
        }
      
      }
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
  console.log(`Registering service... (${req.body.name})`);
  serviceRegistry.addEntry({
    uri: `${req.body.uri}`,
    entry: req.body
  });
  
  res.json({
    serviceName: req.body.name,
    serviceURI: req.body.uri,
    timestamp: new Date().toISOString()
  });
});

app.post('/multigrain/v1/toast', (req, res) => {
  const id = `toast:${randomPetName(2, '-')}:${crypto.randomUUID()}`;
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
