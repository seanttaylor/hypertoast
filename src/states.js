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
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();
    this.#toaster = ht;
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
      settings: this.#toaster.settings
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
  }

  getStatus() {
    return {
      state: this.name,
      timestamp: this.#timestamp,
      settings: this.#toaster.settings
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
    } ,5000)
  }

  off() {
    console.log("Toaster is already off.");
  }

  getStatus() {
    return {
      state: this.name,
      timestamp: this.#timestamp,
      settings: this.#toaster.settings
    }
  }

}

export {
  ToasterOffState,
  ToasterOnState,
  ToasterWarmingState
}