import Level, { LevelMap } from '../Level';

export default new Level((rows, cols): LevelMap => {
  const [halfRows, halfCols] = [rows / 2, cols / 2];
  return [
    // top walls
    [[3, 3], [halfRows - 3, 3]],
    [[halfRows + 3, 3], [rows - 3, 3]],

    // right walls
    [[rows - 3, 3], [rows - 3, halfCols - 3]],
    [[rows - 3, halfCols + 3], [rows - 3, cols - 3]],

    // bottom walls
    [[rows - 3, cols - 3], [halfRows + 3, cols - 3]],
    [[halfRows - 3, cols - 3], [3, cols - 3]],

    // Left walls
    [[3, cols - 3], [3, halfCols + 3]],
    [[3, halfCols - 3], [3, 3]],

    // inner walls
    // top walls
    [[9, 9], [halfRows - 6, 9]],
    [[halfRows + 6, 9], [rows - 9, 9]],

    // right walls
    [[rows - 9, 9], [rows - 9, halfCols - 6]],
    [[rows - 9, halfCols + 6], [rows - 9, cols - 9]],

    // bottom walls
    [[rows - 9, cols - 9], [halfRows + 6, cols - 9]],
    [[halfRows - 6, cols - 9], [9, cols - 9]],

    // Left walls
    [[9, cols - 9], [9, halfCols + 6]],
    [[9, halfCols - 6], [9, 9]],
  ];
});
