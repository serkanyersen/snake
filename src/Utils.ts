import {SIZE} from './constants';

namespace Utils {
  export function rand(min: number, max: number, reduce: number = SIZE): number {
    let num = Math.floor(Math.random() * (max - min)) + min;
    return num - (num % reduce);
  }

  export function snap(number, point = SIZE) {
    let bottom = number - number % point;
    let top = bottom + point;

    return number - bottom <= top - number ? bottom : top;
  }

  export function removeNode(el: Element) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  export function bound(num: number, min: number, max: number): number {
    return Math.max(Math.min(num, max), min);
  }
}

export default Utils;
