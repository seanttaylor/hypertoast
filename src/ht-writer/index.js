import halson from 'halson';
import { HyperToast } from '../hypertoast/index.js';

/**
 * Prints a HyperToast instance
 */
class HyperToastWriter {
    static #context;
  
    /**
     * @param {HyperToast} ht - an instance of HyperToast
     * @return {Object}
     */
    static write(ht) {
      return HyperToastWriter.#context.write(ht);
    }
  
    /**
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
     * @param {HyperToast} - an instance of HyperToast
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
 * Prints a representation of the 'on' state in the HAL hypermedia format
 */
class HTOnStrategy extends HyperToastWriterStrategy {

/**
 * @param {HyperToast} - an instance of HyperToast
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
 * Prints a representation of the 'off' state in the HAL hypermedia format
 */
class HTOffStrategy extends HyperToastWriterStrategy {
  
    /**
     * @param {HyperToast} - an instance of HyperToast
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
  
export { HyperToastWriter, HTStatusStrategy, HTOnStrategy, HTOffStrategy };