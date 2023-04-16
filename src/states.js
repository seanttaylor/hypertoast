class ToasterState {
  name;
  timestamp;
  cookEndTimeMillis;
  cookStartTimeMillis;
  cookTimeRemainingMillis;

  on() {

  }

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
    //this.cookTimeRemainingMillis = this.cookEndTimeMillis - new Date(this.timestamp).getTime();
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

    this.name = "warming";
    this.timestamp = new Date().toISOString();
    this.cookEndTimeMillis = ht.state.cookEndTimeMillis;
    this.cookStartTimeMillis = ht.state.cookStartTimeMillis;
    this.cookTimeRemainingMillis = (this.cookEndTimeMillis - new Date(this.timestamp).getTime());

    this.#toaster = ht;

    console.log('Toaster is warming...');
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

export { ToasterOffState, ToasterOnState, ToasterWarmingState };
