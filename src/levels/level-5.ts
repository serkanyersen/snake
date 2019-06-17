import Level, { LevelMap } from '../Level';

export default new Level((cols, rows): LevelMap => {
  return [
    // top walls
    [[0, 0], [cols, 0]],
    [[0, rows], [cols, rows]],

    [[0, 1], [0, rows - 1]],
    [[cols, 1], [cols, rows - 1]],
  ];
});
