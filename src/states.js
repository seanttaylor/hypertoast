import { HyperToast } from "../src/hypertoast/index.js";

/**
 * Configures a discrete state change during the cooking process
 */
class ToasterState {
  name;
  timestamp;
  cookEndTimeMillis;
  cookStartTimeMillis;
  cookTimeRemainingMillis;
  cookInProgress = false;

  /**
   * Calcutaes the remaining time to cook the toast
   * @returns {Number}
   */
  getCookTimeRemaining(timestamp) {
    //return (this.cookEndTimeMillis - new Date(this.timestamp).getTime());
    return (this.cookEndTimeMillis - new Date(timestamp).getTime());
  }

  /**
   * Turns the toaster on
   * @returns {HyperToast}
   */
  on() {

  }

  /**
   * Turns the toaster off
   * @returns {HyperToast}
   */
  off() {

  }
}

class ToasterOnState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    const cookSettingId = ht.settings.cookConfig.level[0];
    const cookTime = ht.settings.cookConfig.timer[cookSettingId];    

    this.name = "on";
    this.timestamp = new Date().toISOString();
    this.cookStartTimeMillis = new Date().getTime();
    this.cookEndTimeMillis = this.cookStartTimeMillis + cookTime;
    this.cookTimeRemainingMillis = this.cookEndTimeMillis;

    this.#toaster = ht;
  }

  on() {
    console.log('Toaster is already on.');
  }

  off() {
    console.log('Toaster is turning off...');
    this.#toaster.setState(new ToasterOffState(this.#toaster));
    return this.#toaster;
  }
}

class ToasterWarmingState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();
    console.log('Toaster is warming...');

    const WARMING_INTERVAL_MILLIS = 10000;

    this.name = "warming";
    this.timestamp = new Date().toISOString();
    this.cookEndTimeMillis = ht.state.cookEndTimeMillis;
    this.cookStartTimeMillis = ht.state.cookStartTimeMillis;
    this.cookTimeRemainingMillis = this.getCookTimeRemaining(this.timestamp);

    setTimeout(() => {
      ht.setState(new ToasterCookingState(ht));
    }, WARMING_INTERVAL_MILLIS);

    this.#toaster = ht;
  }

  on() {
    console.log('Toaster is already on.');
  }

  off() {
    console.log('Toaster is turning off...');
    this.#toaster.setState(new ToasterOffState(this.#toaster));
    return this.#toaster;
  }
}

class ToasterCookingState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    const COOK_INTERVAL_MILLIS = 1000;
    let cookIntervalHook;

    this.name = "cooking";
    this.timestamp = new Date().toISOString();
    this.cookInProgress = true;

    this.cookEndTimeMillis = ht.state.cookEndTimeMillis;
    this.cookStartTimeMillis = ht.state.cookStartTimeMillis;
    this.cookTimeRemainingMillis = this.getCookTimeRemaining(this.timestamp);
    
    if (!ht.state.cookInProgress) {
      console.log('Toaster is cooking...');

      cookIntervalHook = setInterval(() => {
        // We use a new `Date` instance because using `this.timestamp` would bind the value of `this.timestamp` 
        // to the context of the `setInterval` function causing the `getCookTimeRemaining` method to 
        // return the same value resulting in an infinite loop and BURNT TOAST!
        
        if (this.getCookTimeRemaining(new Date().toISOString()) <= 0) {
          clearInterval(cookIntervalHook);
          this.off();
          return;
        }

        ht.setState(new ToasterCookingState(ht));
      }, COOK_INTERVAL_MILLIS);
    }

    this.#toaster = ht;    
  }

  on() {
    console.log('Toaster is already on.');
  }

  off() {
    console.log('Toaster is turning off...');
    this.#toaster.setState(new ToasterOffState(this.#toaster));
    return this.#toaster;
  }
}

class ToasterOffState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    this.name = "off";
    this.timestamp = new Date().toISOString();
    this.cookEndTimeMillis = null;
    this.cookStartTimeMillis = null;
    this.cookTimeRemainingMillis = null;

    this.#toaster = ht;
  }

  on() {
    console.log("Toaster is turning on...");    
    this.#toaster.setState(new ToasterOnState(this.#toaster));
    setTimeout(() => {
      this.#toaster.setState(new ToasterWarmingState(this.#toaster));
    }, 5000);
    return this.#toaster;
  }

  off() {
    console.log('Toaster is already off.');
    return this.#toaster;
  }
}

export { ToasterOffState, ToasterOnState, ToasterWarmingState, ToasterCookingState };
