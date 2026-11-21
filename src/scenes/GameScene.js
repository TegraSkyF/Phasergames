import Phaser from "phaser";
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_SIZE,
  CELL,
  COLORS,
  COLS,
  GAME_HEIGHT,
  GAME_WIDTH,
  MIN_INTERVAL_MS,
  ROWS,
  SPEED_STEP_MS,
  START_DELAY_MS,
  START_INTERVAL_MS,
} from "../config.js";

const DIRS = {
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    this.cameras.main.setBackgroundColor("#9fd8c8");
    this.score = 0;
    this.alive = true;
    this.canMove = false;
    this.moveInterval = START_INTERVAL_MS;
    this.direction = { ...DIRS.RIGHT };
    this.nextDirection = { ...DIRS.RIGHT };
    this.snake = [
      { x: 5, y: 9 },
      { x: 6, y: 9 },
      { x: 7, y: 9 },
    ];
    this.food = { x: 12, y: 9 };

    this.drawBoard();
    this.boardGfx = this.add.graphics();
    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 48, "Счёт: 0", {
        fontFamily: '"Fredoka", sans-serif',
        fontSize: "40px",
        color: COLORS.ink,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 86, "стрелки / WASD / кнопки", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "18px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    this.drawSnakeAndFood();
    this.createPad();
    this.bindControls();

    this.startDelay = this.time.delayedCall(START_DELAY_MS, () => {
      if (!this.alive) return;
      this.canMove = true;
      this.scheduleMoveLoop();
    });

    this.events.once("shutdown", () => {
      this.unbindControls();
      this.clearTimers();
    });
  }

  clearTimers() {
    if (this.startDelay) {
      this.startDelay.remove(false);
      this.startDelay = null;
    }
    if (this.moveEvent) {
      this.moveEvent.remove(false);
      this.moveEvent = null;
    }
    if (this.gameOverTimer) {
      this.gameOverTimer.remove(false);
      this.gameOverTimer = null;
    }
  }

  scheduleMoveLoop() {
    if (this.moveEvent) this.moveEvent.remove(false);
    this.moveEvent = this.time.addEvent({
      delay: this.moveInterval,
      loop: true,
      callback: () => this.tick(),
    });
  }

  drawBoard() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.board, 1);
    g.fillRoundedRect(BOARD_OFFSET_X - 8, BOARD_OFFSET_Y - 8, BOARD_SIZE + 16, BOARD_SIZE + 16, 18);
    g.lineStyle(5, COLORS.boardEdge, 1);
    g.strokeRoundedRect(BOARD_OFFSET_X - 8, BOARD_OFFSET_Y - 8, BOARD_SIZE + 16, BOARD_SIZE + 16, 18);

    g.lineStyle(1, COLORS.grid, 1);
    for (let c = 1; c < COLS; c += 1) {
      const x = BOARD_OFFSET_X + c * CELL;
      g.lineBetween(x, BOARD_OFFSET_Y, x, BOARD_OFFSET_Y + BOARD_SIZE);
    }
    for (let r = 1; r < ROWS; r += 1) {
      const y = BOARD_OFFSET_Y + r * CELL;
      g.lineBetween(BOARD_OFFSET_X, y, BOARD_OFFSET_X + BOARD_SIZE, y);
    }
  }

  createPad() {
    const padY = GAME_HEIGHT - 78;
    const size = 52;
    const gap = 10;
    const cx = GAME_WIDTH / 2;

    const makeBtn = (x, y, label, dir) => {
      const bg = this.add
        .rectangle(x, y, size, size, 0xffffff, 0.92)
        .setStrokeStyle(3, COLORS.boardEdge, 0.55)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(x, y, label, {
          fontFamily: '"Fredoka", sans-serif',
          fontSize: "26px",
          color: COLORS.ink,
        })
        .setOrigin(0.5);

      const press = () => {
        bg.setFillStyle(0xd2f3e1, 1);
        this.queueDirection(dir);
      };
      const release = () => bg.setFillStyle(0xffffff, 0.92);

      bg.on("pointerdown", press);
      bg.on("pointerup", release);
      bg.on("pointerout", release);
    };

    makeBtn(cx, padY - size - gap, "▲", DIRS.UP);
    makeBtn(cx - size - gap, padY, "◀", DIRS.LEFT);
    makeBtn(cx, padY, "▼", DIRS.DOWN);
    makeBtn(cx + size + gap, padY, "▶", DIRS.RIGHT);
  }

  bindControls() {
    this.onKeyDown = (event) => {
      if (!this.alive) return;
      const code = event.code;
      if (code === "ArrowLeft" || code === "KeyA") this.queueDirection(DIRS.LEFT);
      if (code === "ArrowRight" || code === "KeyD") this.queueDirection(DIRS.RIGHT);
      if (code === "ArrowUp" || code === "KeyW") this.queueDirection(DIRS.UP);
      if (code === "ArrowDown" || code === "KeyS") this.queueDirection(DIRS.DOWN);
      // Prevent page scroll when using arrows
      if (code.startsWith("Arrow")) event.preventDefault();
    };
    this.input.keyboard.on("keydown", this.onKeyDown);
  }

  unbindControls() {
    if (this.onKeyDown) {
      this.input.keyboard.off("keydown", this.onKeyDown);
      this.onKeyDown = null;
    }
  }

  queueDirection(dir) {
    if (dir.x === -this.direction.x && dir.y === -this.direction.y) return;
    this.nextDirection = { ...dir };
  }

  tick() {
    if (!this.alive || !this.canMove) return;

    this.direction = { ...this.nextDirection };
    const head = this.snake[this.snake.length - 1];
    const next = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    if (
      next.x < 0 ||
      next.y < 0 ||
      next.x >= COLS ||
      next.y >= ROWS ||
      this.snake.some((part) => part.x === next.x && part.y === next.y)
    ) {
      this.gameOver();
      return;
    }

    this.snake.push(next);

    const ate = this.food && next.x === this.food.x && next.y === this.food.y;
    if (ate) {
      this.score += 1;
      this.scoreText.setText(`Счёт: ${this.score}`);
      this.spawnFood();
      this.speedUp();
      this.cameras.main.shake(60, 0.004);
    } else {
      this.snake.shift();
    }

    this.drawSnakeAndFood();
  }

  speedUp() {
    this.moveInterval = Math.max(MIN_INTERVAL_MS, this.moveInterval - SPEED_STEP_MS);
    // Update delay in-place to avoid stacking timers mid-callback
    if (this.moveEvent) {
      this.moveEvent.delay = this.moveInterval;
      this.moveEvent.elapsed = 0;
    }
  }

  spawnFood() {
    const free = [];
    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        if (!this.snake.some((part) => part.x === x && part.y === y)) {
          free.push({ x, y });
        }
      }
    }
    this.food = Phaser.Utils.Array.GetRandom(free);
  }

  drawSnakeAndFood() {
    this.boardGfx.clear();

    this.snake.forEach((part, index) => {
      const isHead = index === this.snake.length - 1;
      this.boardGfx.fillStyle(isHead ? COLORS.snakeHead : COLORS.snake, 1);
      this.boardGfx.fillRoundedRect(
        BOARD_OFFSET_X + part.x * CELL + 3,
        BOARD_OFFSET_Y + part.y * CELL + 3,
        CELL - 6,
        CELL - 6,
        isHead ? 10 : 8,
      );

      if (isHead) {
        this.boardGfx.fillStyle(0xffffff, 1);
        const eyeOffsetX = this.direction.x !== 0 ? this.direction.x * 4 : 0;
        const eyeOffsetY = this.direction.y !== 0 ? this.direction.y * 4 : 0;
        const cx = BOARD_OFFSET_X + part.x * CELL + CELL / 2 + eyeOffsetX;
        const cy = BOARD_OFFSET_Y + part.y * CELL + CELL / 2 + eyeOffsetY;
        if (this.direction.x !== 0) {
          this.boardGfx.fillCircle(cx, cy - 5, 2.5);
          this.boardGfx.fillCircle(cx, cy + 5, 2.5);
        } else {
          this.boardGfx.fillCircle(cx - 5, cy, 2.5);
          this.boardGfx.fillCircle(cx + 5, cy, 2.5);
        }
      }
    });

    if (this.food) {
      const fx = BOARD_OFFSET_X + this.food.x * CELL + CELL / 2;
      const fy = BOARD_OFFSET_Y + this.food.y * CELL + CELL / 2;
      this.boardGfx.fillStyle(COLORS.food, 1);
      this.boardGfx.fillCircle(fx, fy, 11);
      this.boardGfx.fillStyle(COLORS.foodStem, 1);
      this.boardGfx.fillRect(fx - 2, fy - 15, 4, 7);
    }
  }

  gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this.canMove = false;
    if (this.moveEvent) {
      this.moveEvent.remove(false);
      this.moveEvent = null;
    }
    this.cameras.main.flash(180, 255, 77, 61);
    this.gameOverTimer = this.time.delayedCall(220, () => {
      this.gameOverTimer = null;
      if (this.scene.isActive("game")) {
        this.scene.start("gameover", { score: this.score });
      }
    });
  }
}
