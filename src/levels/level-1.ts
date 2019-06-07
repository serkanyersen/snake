import Level, { LevelMap } from '../Level';

export default new Level((rows, cols): LevelMap => {
  const [halfCols, halfRows] = [cols / 2, rows / 2];
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
  ];
});
