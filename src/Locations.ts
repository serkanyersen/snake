namespace Locations {
  const data: { [location: string]: boolean } = {};

  export const set = (x: number, y: number): void => {
    data[`${x}:${y}`] = true;
  };

  export const remove = (x: number, y: number): void => {
    delete data[`${x}:${y}`];
  };

  export const has = (x: number, y: number): boolean => {
    return data[`${x}:${y}`] === true;
  };

  export const get = () => {
    return data;
  };
}

export default Locations;
