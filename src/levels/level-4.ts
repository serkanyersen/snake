import Level, {LevelMap} from "../level";

export default new Level((rows, cols): LevelMap => {
    let [halfRows, halfCols] = [rows / 2, cols / 2];
    return [
        [[3, 3], [rows - 3, cols - 3]],
        [[rows - 3, 3], [3, cols - 3]]
    ];
});
