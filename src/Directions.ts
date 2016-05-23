import {keys} from './constants';

namespace Directions {
  let queue: number[] = [];
  let current: number = keys.RIGHT;

  export function set(key: number) {
    queue.push(key);
  }

  export function get() {
    return current;
  }

  export function pop() {
    if (queue.length > 0) {
      current = queue.shift();
    }
    return get();
  }

  export function flush() {
    queue = [];
    current = keys.RIGHT;
  }

  export function peek() {
    return queue.length > 0 ? queue[queue.length - 1] : current;
  }
}

export default Directions;