import { ToasterOffState } from '../states.js';

const DEFAULT_SETTINGS_VERSION = '0.0.1';

class HyperToast {
  state;
  settings;
  deviceName;
  applicationVersion = '0.0.2';

  constructor(name, settings = {}) {
    this.deviceName = name;
    this.settings = settings;
    this.settings.version = DEFAULT_SETTINGS_VERSION;
    this.state = new ToasterOffState(this);
  }
  /**
   * Turns on the toaster
   * @returns {ToasterState}
   */
  on() {
    return this.state.on();
  }

  /**
   * Turns off the toaster
   * @returns {ToasterState}
   */
  off() {
    return this.state.off();
  }

  /**
   * Sets the current program state
   * @param {ToasterState} state
   */
  setState(state) { 
    // console.log(state);
    console.log(state.statusMessage);
    this.state = state;
  }

  /**
   * Gets current progam state and device information
   * @returns {Object} 
   */
  getStatus() {
    return {
      applicationVersion: this.applicationVersion,
      deviceName: this.deviceName,
      settings: this.settings,
      ...this.state
    };
  }
}


export { HyperToast };
