import express from 'express';
import figlet from 'figlet';
import { promisify } from 'util';
import {
  HyperToast,
  HyperToastWriter,
  HTStatusStrategy,
  HTOnStrategy,
  HTOffStrategy
} from './src/index.js';

const APP_NAME = 'hypertoast';
const APP_VERSION = '0.0.1';
const PORT = 3010;

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
const app = express();

let ht = new HyperToast('HyperToast', {
  mode: ['bagel'],
  cookConfig: {
    level: [1],
    timer: {
      1: 50000,
    }
  }
});

app.get('/', (req, res) => {
  res.json({
    application: APP_NAME,
    version: APP_VERSION,
  });
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

app.listen(PORT, () => {
  console.log(banner + '\n');
  console.log(` App listening at http://localhost:${PORT}`);
});
