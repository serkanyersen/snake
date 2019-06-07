import Level, { LevelMap } from '../Level';

export default new Level((rows, cols): LevelMap => {
  const [halfRows, halfCols] = [rows / 2, cols / 2];
  return [
    [[halfRows - 2, halfCols], [halfRows + 2, halfCols]],
    [[halfRows, halfCols - 2], [halfRows, halfCols + 2]],

    [[halfRows - 8, halfCols - 8], [halfRows - 3, halfCols - 3]],
    [[halfRows + 3, halfCols + 3], [halfRows + 8, halfCols + 8]],

    [[halfRows + 8, halfCols - 8], [halfRows + 3, halfCols - 3]],
    [[halfRows - 3, halfCols + 3], [halfRows - 8, halfCols + 8]],
  ];
});
