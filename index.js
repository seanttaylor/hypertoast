import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import figlet from 'figlet';
import path from 'path';

import { promisify } from 'util';
import { HyperToast } from './src/hypertoast/index.js';
import validateRequest from './src/middleware/validate.js';
import settingsSchemav1 from './schemas/settings-1.js';
import settingsSchemav2 from './schemas/settings.js';

import {
  HyperToastWriter,
  HTStatusStrategy,
  HTOnStrategy,
  HTOffStrategy,
  HTSettingsStrategy,
  HTHomeStrategy
} from './src/ht-writer/index.js';

import ServerSentEvent from './src/sse/index.js';

const APP_NAME = 'hypertoast';
const APP_VERSION = '0.0.1';
const PORT = 3010;
const settingsSchema = {
  'http://localhost:3010/hypertoast/schemas/settings-1': settingsSchemav1,
  'http://localhost:3010/hypertoast/schemas/settings': settingsSchemav2
};

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));

let ht = new HyperToast('HyperToast', {
  mode: ['bagel'],
  cookConfig: {
    level: [1],
    timer: {
      1: 50000,
    }
  }
});

/**
 * 
 */
const HTSubscriberPlugin = {
  subscriptions: {},
  /***
   * Publishes a message via a client-defined method `publishFn`
   * @param {String}
   * @param {Object}
   */
  publish(eventName, eventData) {
    this.publishFn(eventName, eventData);
  },
  /**
   * Augmented `setState` method executes any subscribers listening for the current state
   * @param {ToasterState} state 
   */
  setState(state) {
    console.log(state);
    this.state = state;
    if(this.subscriptions[state.name]) {
      this.subscriptions[state.name].forEach((fn) => fn.call(this, state));
    };
  },
  /**
   * Subscribes to a specified state change with a client defined handler function
   * @param {String} stateName - the name of a valid state to alert for changes to
   * @param {Function} fn - handler function to execute when the specified state change occurs
   *  
   */
  subscribe(stateName, fn) {
    if (this.subscriptions[stateName]) {
      this.subscriptions[stateName].push(fn);
      return;
    }
    this.subscriptions[stateName] = [];
    this.subscriptions[stateName].push(fn);
  },
  /**
   * Registers a client-defined publish capability
   * @param {Function} publishFn - a function to execute when a message is ready for publishing
   */
  addPublisher(publishFn) {
    this.publishFn = publishFn;
  }
};

ht = Object.assign(ht, HTSubscriberPlugin);
ht.subscribe('off', onToasterOff);

/******** SUBSCRIPTIONS ********/ 
/**
 * A handler function to execute when the 'toaster-off' state is triggered
 * @param {ToasterState} state - an object describing the current toater state
 */
function onToasterOff(state) {
  console.log('publishing (toaster-off) event...');
  this.publish('toaster-off', state);
}

/******** ROUTES ********/
app.get('/hypertoast/relations/:rel', (req, res) => {
  res.sendFile(path.resolve(`relations/${req.params.rel}.json`));
});

app.get('/hypertoast/schemas/:rel', (req, res) => {
  res.sendFile(path.resolve(`schemas/${req.params.rel}.json`));
});

app.get('/hypertoast', (req, res) => {
  //res.set('content-type', 'application/json');
  res.set('content-type', 'application/vnd.hypertoast');

  HyperToastWriter.setStrategy(new HTHomeStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.get('/hypertoast/v1/status', (req, res) => {
  //res.set('content-type', 'application/json');
  res.set('content-type', 'application/vnd.hypertoast');

  HyperToastWriter.setStrategy(new HTStatusStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.put('/hypertoast/v1/state/on', (req, res) => {
  //res.set('content-type', 'application/json');
  res.set('content-type', 'application/vnd.hypertoast');

  ht = ht.on();

  HyperToastWriter.setStrategy(new HTOnStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.put('/hypertoast/v1/state/off', (req, res) => {
  //res.set('content-type', 'application/json');
  res.set('content-type', 'application/vnd.hypertoast');

  ht = ht.off();

  HyperToastWriter.setStrategy(new HTOffStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.put('/hypertoast/v1/settings', validateRequest(settingsSchema), (req, res) => {
  //res.set('content-type', 'application/json');
  res.set('content-type', 'application/vnd.hypertoast');
   
  ht.settings = req.body;

  HyperToastWriter.setStrategy(new HTSettingsStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.get('/hypertoast/rt-updates/subscribe', async (req, res) => {
  res.status(200).set({
    connection: 'keep-alive',
    'cache-control': 'no-cache',
    'content-type': 'text/event-stream',
  });

  // An initial OK response MUST be sent clients to establish a connection
  res.write('data: CONNECTION_OK \n\n');

  // A classic function declaration is used in the call to `ht.addPublisher` because arrow functions
  // do not have their own binding to `this`
  // See (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) for more info
  ht.addPublisher(function(eventName, eventData) {
    // the hypertoast instance must opt-in to notifications *and* specify 
    // notifications of type 'sse' to use this publisher 

    if ((this.settings.notifications?.shouldNotify) && (this.settings.notifications.shouldNotify.type[0] === 'sse')) {
      const [sseEventName, sseEventData] = new ServerSentEvent(eventName, eventData);

      res.write(sseEventData);
      res.write(sseEventName);
    }
    
  });
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
