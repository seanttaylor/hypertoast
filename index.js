import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import figlet from 'figlet';

import { promisify } from 'util';
import { HyperToast } from './src/hypertoast/index.js';
import {
  HyperToastWriter,
  HTStatusStrategy,
  HTOnStrategy,
  HTOffStrategy,
  HTHomeStrategy
} from './src/ht-writer/index.js';

const APP_NAME = 'hypertoast';
const APP_VERSION = '0.0.1';
const PORT = 3010;

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

app.get('/hypertoast', (req, res) => {
  res.set('content-type', 'application/json');
  
  HyperToastWriter.setStrategy(new HTHomeStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.get('/hypertoast/v1/status', (req, res) => {
  res.set('content-type', 'application/json');

  HyperToastWriter.setStrategy(new HTStatusStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.put('/hypertoast/v1/state/on', (req, res) => {
  res.set('content-type', 'application/json');
  ht = ht.on();

  HyperToastWriter.setStrategy(new HTOnStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
});

app.put('/hypertoast/v1/state/off', (req, res) => {
  res.set('content-type', 'application/json');
  ht = ht.off();

  HyperToastWriter.setStrategy(new HTOffStrategy());
  res.json(HyperToastWriter.write(ht.getStatus()));
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
