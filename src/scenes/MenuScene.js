import Phaser from "phaser";
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_SIZE,
  CELL,
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../config.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    this.cameras.main.setBackgroundColor("#9fd8c8");
    this.drawDecor();

    this.add
      .text(GAME_WIDTH / 2, 88, "ЗМЕЙКА", {
        fontFamily: '"Fredoka", sans-serif',
        fontSize: "64px",
        color: COLORS.ink,
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 150, "простая 2D-игра на Phaser 3", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "20px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.88);
    panel.fillRoundedRect(BOARD_OFFSET_X, BOARD_OFFSET_Y + 40, BOARD_SIZE, 280, 24);
    panel.lineStyle(4, COLORS.boardEdge, 0.35);
    panel.strokeRoundedRect(BOARD_OFFSET_X, BOARD_OFFSET_Y + 40, BOARD_SIZE, 280, 24);

    const help = [
      "Стрелки или WASD — управление",
      "Съешь яблоко — вырастешь",
      "Не врезайся в стены и себя",
    ];

    help.forEach((line, index) => {
      this.add
        .text(GAME_WIDTH / 2, BOARD_OFFSET_Y + 100 + index * 42, line, {
          fontFamily: '"Nunito", sans-serif',
          fontSize: "22px",
          color: COLORS.ink,
        })
        .setOrigin(0.5);
    });

    const start = this.add
      .text(GAME_WIDTH / 2, BOARD_OFFSET_Y + 260, "Нажми пробел или кликни", {
        fontFamily: '"Fredoka", sans-serif',
        fontSize: "26px",
        color: "#147a3f",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: start,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.once("keydown-SPACE", () => this.startGame());
    this.input.once("pointerdown", () => this.startGame());
  }

  startGame() {
    this.scene.start("game");
  }

  drawDecor() {
    const g = this.add.graphics();
    for (let i = 0; i < 10; i += 1) {
      const x = 40 + ((i * 97) % (GAME_WIDTH - 80));
      const y = 40 + ((i * 61) % (GAME_HEIGHT - 80));
      g.fillStyle(0xffffff, 0.18);
      g.fillCircle(x, y, 10 + (i % 3) * 6);
    }

    // Mini preview snake
    const previewY = GAME_HEIGHT - 90;
    const body = [
      [7, 0],
      [8, 0],
      [9, 0],
      [10, 0],
      [11, 0],
    ];
    body.forEach(([cx], index) => {
      g.fillStyle(index === body.length - 1 ? COLORS.snakeHead : COLORS.snake, 1);
      g.fillRoundedRect(
        BOARD_OFFSET_X + cx * CELL + 3,
        previewY + 3,
        CELL - 6,
        CELL - 6,
        8,
      );
    });
    g.fillStyle(COLORS.food, 1);
    g.fillCircle(BOARD_OFFSET_X + 13 * CELL + CELL / 2, previewY + CELL / 2, 11);
  }
}
