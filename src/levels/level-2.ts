import Level, {LevelMap} from "../level";

export default new Level((rows, cols): LevelMap => {
    let [halfRows, halfCols] = [rows / 2, cols / 2];
    return [
        [[halfRows - 2, halfCols], [halfRows + 2, halfCols]],
        [[halfRows, halfCols - 2], [halfRows, halfCols + 2]],

        [[halfRows - 8, halfCols - 8], [halfRows - 3, halfCols - 3]],
        [[halfRows + 3, halfCols + 3], [halfRows + 8, halfCols + 8]],

        [[halfRows + 8, halfCols - 8], [halfRows + 3, halfCols - 3]],
        [[halfRows - 3, halfCols + 3], [halfRows - 8, halfCols + 8]],
    ];
});
