import { ToasterOffState } from './states.js';
import halson from 'halson';

class HyperToast {
  #currentState;
  settings;
  deviceName;

  constructor(name, settings = {}) {
    this.deviceName = name;
    this.settings = settings;
    this.#currentState = new ToasterOffState(this);
  }

  on() {
    this.#currentState.on();
    return this.#currentState;
  }

  off() {
    this.#currentState.off();
  }

  setState(state) {
    this.#currentState = state;
  }

  getStatus() {
    return {
      deviceName: this.deviceName,
      settings: this.settings,
      ...this.#currentState,
    };
  }
}

class HyperToastWriter {
  /**
   * @param {HyperToast} ht
   * @return {Object}
   */
  static write(ht) {
    return halson(ht)
      .addLink('self', '/hypertoast/v1/status')
      .addLink('off', {
        href: '/hypertoast/v1/state/off',
        title: 'Turn off the toaster',
      })
      .addLink('on', {
        href: '/hypertoast/v1/state/off',
        title: 'Turn on the toaster',
      })
      .addLink('settings', {
        href: '/hypertoast/v1/settings',
        title: 'Configure device settings',
      })
      .addLink('home', {
        href: '/hypertoast',
        title: 'Initialize the device',
      });
  }
}

export { HyperToast, HyperToastWriter };
