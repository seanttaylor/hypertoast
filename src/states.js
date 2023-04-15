class ToasterState {
  #currentState;

  constructor() {

  }

  on() {

  }

  off() {

  }

  getStatus() {

  }
}

class ToasterOnState extends ToasterState {
  name = "on";
  #timestamp = new Date().toISOString();
  #cookStartTimeMillis = new Date().getTime();
  #cookSettings = {
    1: 10000
  };
  #cookEndTimeMillis;
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();
    const cookSettingId = ht.settings.cookLevel[0];
    this.#toaster = ht;
    this.#cookEndTimeMillis = (this.#cookStartTimeMillis + this.#cookSettings[cookSettingId]);
  }

  on() {
    console.log("Toaster is already on.");

  }

  off() {
    console.log("Toaster is turning off...");
    this.#toaster.setState(new ToasterOffState(this.#toaster));
  }

  getStatus() {
    return {
      state: this.name,
      timestamp: this.#timestamp,
      settings: this.#toaster.settings,
      cookStartTimeMillis: this.#cookStartTimeMillis,
      cookEndTimeMillis: this.#cookEndTimeMillis,
      cookTimeRemainingMillis: this.#cookEndTimeMillis - new Date(this.#timestamp).getTime(),
      applicationVersion: this.#toaster.applicationVersion
    }
  }

}

class ToasterWarmingState extends ToasterState {
  name = "warming";
  #timestamp = new Date().toISOString();
  #toaster;


  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();
    this.#toaster = ht;
    console.log("Toaster is warming...");
  }

  on() {
    console.log("Toaster is already on.");
  }

  off() {
    console.log("Toaster is turning off...");
    this.#toaster.setState(new ToasterOffState(this.#toaster));
  }

  getStatus() {
    return {
      state: this.name,
      timestamp: this.#timestamp,
      settings: this.#toaster.settings,
      cookStartTimeMillis: this.#toaster.cookStartTimeMillis,
      cookEndTimeMillis: this.#toaster.cookEndTimeMillis,
      cookTimeRemainingMillis: this.#toaster.cookEndTimeMillis - new Date(this.#timestamp).getTime(),
      applicationVersion: this.#toaster.applicationVersion
    }
  }


}

class ToasterOffState extends ToasterState { 
  name = "off";
  #timestamp = new Date().toISOString();
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();
    this.#toaster = ht;
  }

  on() {
    this.#toaster.setState(new ToasterOnState(this.#toaster));
    console.log("Toaster is turning on...");
    setTimeout(()=> {
      this.#toaster.setState(new ToasterWarmingState(this.#toaster));
    }, 5000)
  }

  off() {
    console.log("Toaster is already off.");
    return this.#toaster;
  }

  getStatus() {
    return {
      state: this.name,
      timestamp: this.#timestamp,
      settings: this.#toaster.settings,
      cookStartTimeMillis: null,
      cookTimeRemainingMillis: 0,
      applicationVersion: this.#toaster.applicationVersion
    }
  }

}

export {
  ToasterOffState,
  ToasterOnState,
  ToasterWarmingState
}