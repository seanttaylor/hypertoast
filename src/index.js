import { ToasterOffState } from './states.js';
import halson from 'halson';

class HyperToast {
  state;
  settings;
  deviceName;
  applicationVersion = "0.0.1";

  constructor(name, settings = {}) {
    this.deviceName = name;
    this.settings = settings;
    this.state = new ToasterOffState(this);
  }

  on() {
    return this.state.on();
  }

  off() {
    return this.state.off();
  }

  setState(state) { 
    this.state = state;
  }

  getStatus() {
    return {
      applicationVersion: this.applicationVersion,
      deviceName: this.deviceName,
      settings: this.settings,
      ...this.state
    };
  }
}

class HyperToastWriter {
  static #context;

  /**
   * @param {HyperToast} ht
   * @return {Object}
   */
  static write(ht) {
    return HyperToastWriter.#context.write(ht);
  }

  /**
   * 
   */
  static setStrategy(htWriterStrategy) {
    HyperToastWriter.#context = htWriterStrategy;
  }
}

class HyperToastWriterStrategy {
  /**
   * 
   */
  write() {

  }
}

/**
 * 
 */
class HTStatusStrategy extends HyperToastWriterStrategy {

  /**
   * @param {Object}
   */
  write(ht) {
    return halson(ht)
      .addLink('self', '/hypertoast/v1/status')
      .addLink('off', {
        href: '/hypertoast/v1/state/off',
        title: 'Turn off the toaster',
      })
      .addLink('on', {
        href: '/hypertoast/v1/state/on',
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

/**
 * 
 */
class HTOnStrategy extends HyperToastWriterStrategy {

  /**
   * @param {Object}
   */
  write(ht) {
    return halson(ht)
      .addLink('self', '/hypertoast/v1/state/on')
      .addLink('off', {
        href: '/hypertoast/v1/state/off',
        title: 'Turn off the toaster',
      })
      .addLink('status', {
        href: '/hypertoast/v1/status',
        title: 'Access device info',
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

/**
 * 
 */
class HTOffStrategy extends HyperToastWriterStrategy {

  /**
   * @param {Object}
   */
  write(ht) {
    return halson(ht)
      .addLink('self', '/hypertoast/v1/state/off')
      .addLink('on', {
        href: '/hypertoast/v1/state/on',
        title: 'Turn on the toaster',
      })
      .addLink('status', {
        href: '/hypertoast/v1/status',
        title: 'Access device info',
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

export { HyperToast, HyperToastWriter, HTStatusStrategy, HTOnStrategy, HTOffStrategy };
