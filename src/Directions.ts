import {keys} from "./constants";

namespace Directions {
    let queue: number[] = [];
    let current: number = keys.RIGHT;

    export function set(key: number): void {
        queue.push(key);
    }

    export function get(): number {
        return current;
    }

    export function pop(): number {
        if (queue.length > 0) {
            current = queue.shift();
        }
        return get();
    }

    export function flush(): void {
        queue = [];
        current = keys.RIGHT;
    }

    export function peek(): number {
        return queue.length > 0 ? queue[queue.length - 1] : current;
    }
}

export default Directions;
