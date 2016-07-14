import Piece from "./Piece";
import {SIZE} from "./constants";

type coord = [number, number];
type line = [coord];
export type LevelMap = [line];

export default class Level {

    private pieces: Piece[] = [];

    constructor(private generatorFunction: (rows: number, cols: number) => LevelMap) { }

    private translate(x: number, y: number): coord {
        return [Math.floor(x) * SIZE, Math.floor(y) * SIZE];
    }

    remove(): void {
        this.pieces.forEach((piece) => {
            piece.remove();
        });
    }

    line(x0: number, y0: number, x1: number, y1: number): void {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            // Waiting for proposal
            // https://github.com/Microsoft/TypeScript/issues/5296
            // this.pieces.push(new Piece(...this.translate(x0, y0), "wall"));
            let [tx0, ty0] = this.translate(x0, y0);
            this.pieces.push(new Piece(tx0, ty0, "wall"));

            // break when line is done
            if (Math.abs(x0 - x1) <= 0.5 && Math.abs(y0 - y1) <= 0.5) break;

            let e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }

            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    render(): void {
        let cols = Math.floor(document.body.clientHeight / SIZE);
        let rows = Math.floor(document.body.clientWidth / SIZE);
        let level = this.generatorFunction(rows, cols);

        level.forEach((line) => {
            let [x0, y0]: coord = line[0];
            let [x1, y1]: coord = line[1];

            this.line(x0, y0, x1, y1);
        });
    }
}
