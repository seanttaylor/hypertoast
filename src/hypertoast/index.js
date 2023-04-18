import { ToasterOffState } from '../states.js';

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
    //console.log(state);
    console.log(state.statusMessage);
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

export { HyperToast };
