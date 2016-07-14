namespace Locations {
    let data: { [location: string]: boolean } = {};

    export function set(x: number, y: number): void {
        data[`${x}:${y}`] = true;
    }

    export function remove(x: number, y: number): void {
        delete data[`${x}:${y}`];
    }

    export function has(x: number, y: number): boolean {
        return data[`${x}:${y}`] === true;
    }
}

export default Locations;
