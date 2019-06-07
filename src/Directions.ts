import { keys } from './constants';

namespace Directions {
  let queue: number[] = [];
  let current: number = keys.RIGHT;

  export const set = (key: number): void => {
    queue.push(key);
  };

  export const get = (): number => {
    return current;
  };

  export const pop = (): number => {
    if (queue.length > 0) {
      current = queue.shift() as number;
    }
    return get();
  };

  export const flush = (): void => {
    queue = [];
    current = keys.RIGHT;
  };

  export const peek = (): number => {
    return queue.length > 0 ? queue[queue.length - 1] : current;
  };
}

export default Directions;
