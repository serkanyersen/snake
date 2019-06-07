import Level, { LevelMap } from '../Level';

export default new Level((rows, cols): LevelMap => {
  // const [halfRows, halfCols] = [rows / 2, cols / 2];
  return [
    [[3, 3], [rows - 3, cols - 3]],
    [[rows - 3, 3], [3, cols - 3]],
  ];
});
