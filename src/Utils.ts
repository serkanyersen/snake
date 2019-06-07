import { SIZE } from './constants';

namespace Utils {
  export const rand = (min: number, max: number, reduce: number = SIZE): number => {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num - (num % reduce);
  };

  export const snap = (num: number, point = SIZE): number => {
    const bottom = num - (num % point);
    const top = bottom + point;

    return num - bottom <= top - num ? bottom : top;
  };

  export const removeNode = (el: Element): void => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  };

  export const bound = (num: number, min: number, max: number): number => {
    return Math.max(Math.min(num, max), min);
  };

  export const debounce = <T extends Function>(fun: T, wait: number) => {
    let id: number;
    return (...args: any[]) => {
      clearTimeout(id);
      id = setTimeout(() => fun(...args), wait);
    };
  };
}

export default Utils;
