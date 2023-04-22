import { HyperToast } from "../src/hypertoast/index.js";

/***
 *
 */
class ToasterStateFactoryAbs {
  /**
   * Creates a new instance of ToasterState
   * @return {ToasterState}
   */
  static create() {}
}

/**
 *
 */
class ToasterPreheatingStateFactory extends ToasterStateFactoryAbs {
  static instance;
  versionMap = {
    '0.0.1': ToasterPreheatingStateDefault,
    '0.0.2': ToasterPreheatingStateEnhanced,
  };

  /**
   * @param {HyperToast}
   */
  create(ht) {
    const PreheatingProgram = this.versionMap[ht.applicationVersion];
    return new PreheatingProgram(ht);
  }

  static getInstance() {
    if (ToasterPreheatingStateFactory.instance) {
      return ToasterPreheatingStateFactory.instance;
    }

    ToasterPreheatingStateFactory.instance = new ToasterPreheatingStateFactory();
    return ToasterPreheatingStateFactory.instance;
  }
}

/**
 * Describes a discrete state in the toaster cook cycle
 */
class ToasterState {
  statusMessage;
  name;
  timestamp;
  cookEndTimeMillis;
  cookStartTimeMillis;
  cookTimeRemainingMillis;
  cookInProgress = false;
  // `versionMap` allows to provide version aware capabilities to clients
  // Below we are able to support multiple versions of the device settings schema
  #versionMap = {
    'http://localhost:3010/hypertoast/schemas/settings-1': (settings) => {
      const cookSettingId = settings.cookConfig.level[0];
      return settings.cookConfig.timer[cookSettingId];
    }, 
    'http://localhost:3010/hypertoast/schemas/settings': (settings) => {
      const cookSettingId = settings.cookConfig.level;
      return settings.cookConfig.timer[cookSettingId];
    }
  };

  /**
   * Calculates the cooking time left in milliseconds
   * @param {String} timestamp - an ISO Date String (e.g.
   * new Date().toISOString())
   * @returns {Number}
   */
  getCookTimeRemaining(timestamp) {
    return this.cookEndTimeMillis - new Date(timestamp).getTime();
  }

   /**
   * Returns the total duration of the cook cycle in milliseconds based on client-defined setings
   * @param {Object} settings
   * @returns {Number}
   */
   getCookTime(settings) {
    console.log(settings.version)
    const cookTime = this.#versionMap[settings.version](settings);
    return cookTime;
  }

  /**
   * Runs the specified logic when `off` method is called in this state
   * @returns {HyperToast}
   */
  on() {}

  /**
   * Runs the specified logic when `off` method is called in this state
   * @returns {HyperToast}
   */
  off() {}
}

/**
 *
 */
class ToasterOnState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    //const cookSettingId = ht.settings.cookConfig.level[0];
    //const cookTime = ht.settings.cookConfig.timer[cookSettingId];
    const cookTime = this.getCookTime(ht.settings);
    
    this.statusMessage = 'Toaster is turning on...';
    this.name = 'on';
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

/**
 *
 */
class ToasterPreheatingStateDefault extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    const WARMING_INTERVAL_MILLIS = 10000;

    this.statusMessage = 'Toaster is preheating...';
    this.name = 'preheating';
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

/**
 *
 */
class ToasterPreheatingStateEnhanced extends ToasterPreheatingStateDefault {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super(ht);
    this.statusMessage = 'Toaster preheating in enhanced mode...';
  }

  off() {
    this.#toaster.setState(new ToasterOffState(this.#toaster));
    return this.#toaster;
  }
}

/**
 *
 */
class ToasterCookingState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    const COOK_INTERVAL_MILLIS = 1000;
    let cookIntervalHook;

    this.statusMessage = 'Toaster is cooking...';
    this.name = 'cooking';
    this.timestamp = new Date().toISOString();
    this.cookInProgress = true;

    this.cookEndTimeMillis = ht.state.cookEndTimeMillis;
    this.cookStartTimeMillis = ht.state.cookStartTimeMillis;
    this.cookTimeRemainingMillis = this.getCookTimeRemaining(this.timestamp);

    if (!ht.state.cookInProgress) {
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
    this.#toaster.setState(new ToasterOffState(this.#toaster));
    return this.#toaster;
  }
}

/**
 *
 */
class ToasterOffState extends ToasterState {
  #toaster;

  /**
   * @param {HyperToast} ht
   */
  constructor(ht) {
    super();

    this.statusMessage = 'Toaster is off';
    this.name = 'off';
    this.timestamp = new Date().toISOString();
    this.cookEndTimeMillis = null;
    this.cookStartTimeMillis = null;
    this.cookTimeRemainingMillis = null;

    this.#toaster = ht;
  }

  on() {
    this.#toaster.setState(new ToasterOnState(this.#toaster));
    setTimeout(() => {
      const myTPSFactory = ToasterPreheatingStateFactory.getInstance();
      this.#toaster.setState(myTPSFactory.create(this.#toaster));
    }, 5000);
    return this.#toaster;
  }

  off() {
    console.log('Toaster is already off.');
    return this.#toaster;
  }
}

export {
  ToasterOffState,
  ToasterOnState,
  ToasterPreheatingStateDefault,
  ToasterCookingState,
};
