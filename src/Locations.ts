namespace Locations {
  const data = new Map(); // { [location: string]: boolean } = {};

  export const set = (x: number, y: number, value: any = true): void => {
    data.set(`${x}:${y}`, value);
  };

  export const remove = (x: number, y: number): void => {
    data.delete(`${x}:${y}`);
  };

  export const has = (x: number, y: number): boolean => {
    return data.has(`${x}:${y}`);
  };

  export const get = (x: number, y: number) => {
    return data.get(`${x}:${y}`);
  };

  export const getAll = () => data;
}

export default Locations;
