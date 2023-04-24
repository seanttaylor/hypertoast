import halson from 'halson';
import { HyperToast } from '../hypertoast/index.js';

const linkRelations = {
  home: {
    href: '/hypertoast',
    title: 'Initialize the device',
  },
  on: {
    href: '/hypertoast/v1/state/on',
    title: 'Turn on the toaster',
    rel: '/hypertoast/relations/on'
  },
  off: {
    href: '/hypertoast/v1/state/off',
    title: 'Turn off the toaster',
    rel: '/hypertoast/relations/off'
  },
  status: {
    href: '/hypertoast/v1/status',
    title: 'Access device info',
    rel: '/hypertoast/relations/status'
  },
  settings: {
    href: '/hypertoast/v1/settings',
    title: 'Configure device settings',
    rel: '/hypertoast/relations/settings'
  },
  'rt-updates': {
    href: '/hypertoast/rt-updates/subscribe',
    title: 'Subscribe to push notifications from the toaster',
    rel: '/hypertoast/relations/rt-updates'
  },
};

/**
 * 
 */
class HyperToastWriter {
    static #context;
  
    /**
     * Prints a HyperToast instance
     * @param {HyperToast} ht - an instance of HyperToast
     * @return {Object}
     */
    static write(ht) {
      return HyperToastWriter.#context.write(ht);
    }
  
    /**
     * Specifies the current strategy for printing a HyperToast instance
     * @param {HyperToastWriterStrategy}
     */
    static setStrategy(htWriterStrategy) {
      HyperToastWriter.#context = htWriterStrategy;
    }
}

/**
 * Abstract class exposing a method for printing a HyperToast instance
 */
class HyperToastWriterStrategy {
    /**
     * Prints a HyperToast instance
     */
    write() {
  
    }
}

/**
 * Prints a representation of the status resource in the HAL hypermedia format
 */
class HTStatusStrategy extends HyperToastWriterStrategy {
    /**
     * @param {HyperToast}
     * @return {Object}
     */
    write(ht) {
      const response = halson(ht)
        .addLink('self', {
          href: '/hypertoast/v1/status',
          rel: '/hypertoast/relations/self'
        })
        .addLink('settings', linkRelations.settings)
        .addLink('rt-updates', linkRelations['rt-updates'])
        .addLink('home', linkRelations.home);

        if (['cooking', 'preheating', 'on'].includes(ht.name)) {
          response.addLink('off', linkRelations.off); 
        }

        if (ht.name === 'off') {
          response.addLink('on', linkRelations.on);
        }

      return response;
    }
}
  
/**
 * Prints a representation of the 'on' state in the HAL hypermedia format
 */
class HTOnStrategy extends HyperToastWriterStrategy {

  /**
   * @param {HyperToast}
   */
  write(ht) {
      return halson(ht)
      .addLink('self', {
        href: '/hypertoast/v1/state/on',
        rel: '/hypertoast/relations/self'
      })

      .addLink('off', linkRelations.off)
      .addLink('status', linkRelations.status)
      .addLink('settings', linkRelations.settings)
      .addLink('rt-updates', linkRelations['rt-updates'])
      .addLink('home', linkRelations.home);
  }
}
  
/**
 * Prints a representation of the 'off' state in the HAL hypermedia format
 */
class HTOffStrategy extends HyperToastWriterStrategy {
  
  /**
   * @param {HyperToast}
   */
  write(ht) {
    return halson(ht)
      .addLink('self', {
        href: '/hypertoast/v1/state/off',
        rel: '/hypertoast/relations/self'
      })
      .addLink('on', linkRelations.on)
      .addLink('off', linkRelations.off)
      .addLink('status', linkRelations.status)
      .addLink('settings', linkRelations.settings)
      .addLink('rt-updates', linkRelations['rt-updates'])
      .addLink('home', linkRelations.home);
  }
}

/**
 * Prints a representation of the 'home' state in the HAL hypermedia format
 */
class HTHomeStrategy extends HyperToastWriterStrategy {
  
  /**
   * @param {HyperToast}
   */
  write(ht) {
    return halson(ht)
      .addLink('self', {
        href: '/hypertoast',
        rel: '/hypertoast/relations/self'
      })
      .addLink('off', linkRelations.off)
      .addLink('on', linkRelations.on)
      .addLink('status', linkRelations.status)
      .addLink('rt-updates', linkRelations['rt-updates'])
      .addLink('settings', linkRelations.settings);
  }
}

/**
 * Prints a representation of the 'home' state in the HAL hypermedia format
 */
class HTSettingsStrategy extends HyperToastWriterStrategy {
  
  /**
   * @param {HyperToast}
   */
  write(ht) {
    return halson(ht)
      .addLink('self', {
        href: '/hypertoast/v1/settings',
        rel: '/hypertoast/relations/self'
      })
      .addLink('off', linkRelations.off)
      .addLink('on', linkRelations.on)
      .addLink('status', linkRelations.status)
      .addLink('settings', linkRelations.settings)
      .addLink('rt-updates', linkRelations['rt-updates'])
      .addLink('home', linkRelations.home);
  }
}
  
export { 
  HyperToastWriter, 
  HTStatusStrategy, 
  HTOnStrategy, 
  HTOffStrategy,
  HTSettingsStrategy,
  HTHomeStrategy 
};