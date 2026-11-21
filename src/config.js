export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 720;

export const CELL = 32;
export const COLS = 18;
export const ROWS = 18;
export const BOARD_SIZE = COLS * CELL;
export const BOARD_OFFSET_X = (GAME_WIDTH - BOARD_SIZE) / 2;
export const BOARD_OFFSET_Y = 120;

export const START_INTERVAL_MS = 190;
export const MIN_INTERVAL_MS = 80;
export const SPEED_STEP_MS = 5;
export const START_DELAY_MS = 450;

export const COLORS = {
  board: 0xdff8ea,
  boardEdge: 0x1f6b4a,
  grid: 0xb6e3c8,
  snake: 0x18a957,
  snakeHead: 0x0d7a3d,
  food: 0xff4d3d,
  foodStem: 0x2f8f45,
  ink: "#143828",
  muted: "#3a6b55",
  panel: 0xffffff,
};
