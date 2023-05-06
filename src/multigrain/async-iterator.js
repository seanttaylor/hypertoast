/**
 * Interface for objects returned by an Iterator or AsyncIterator; this interface allows the interpreter to
 * use for/of or for/await loops on an iterator to produce values.
 * See Mozilla docs on Iterators and Generators https://tinyurl.com/36zuesss
 *
 * @typedef {Object} IteratorResult
 * @property {Boolean} done - indicates whether there are remaining values to iterate over
 * @property {Any|Null} value - a value produced by the iterator
 */

class AsyncIterator {
    /**
     * @param {Iterable} iterable
     * @return {Object}
     */
    constructor(iterable) {
      // This pattern allows us to asynchronously iterate over the object returned by this constructor with `for..await`
      // See Mozilla docs on Async Iterators (https://tinyurl.com/3y4mduvc)
      
      return {
        [Symbol.asyncIterator]() {
          return iterable;
        },
      };
    }
  }
 
/**
 * Factory function for returning JavaScript Iterator objects. See Mozilla docs on 
 * Iterators and Generators https://tinyurl.com/36zuesss
 */  
class Iterable {
  /**
   * Method containing the logic that drives the iterator
   * @returns {IteratorResult}
   */
  next() {}

  /**
   * This method is executed if the consumer calls 'break' or 'return' early in 
   * the iteration
   * @returns {IteratorResult}
   */
  return() {
    return { done: true };
  }
}
  
export { AsyncIterator, Iterable };
  