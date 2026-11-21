import Phaser from "phaser";
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  BOARD_SIZE,
  COLORS,
  GAME_WIDTH,
} from "../config.js";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("gameover");
  }

  init(data) {
    this.finalScore = data?.score ?? 0;
  }

  create() {
    this.cameras.main.setBackgroundColor("#9fd8c8");

    this.add
      .text(GAME_WIDTH / 2, 110, "Игра окончена", {
        fontFamily: '"Fredoka", sans-serif',
        fontSize: "48px",
        color: COLORS.ink,
      })
      .setOrigin(0.5);

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.9);
    panel.fillRoundedRect(BOARD_OFFSET_X, BOARD_OFFSET_Y + 40, BOARD_SIZE, 220, 24);
    panel.lineStyle(4, COLORS.boardEdge, 0.35);
    panel.strokeRoundedRect(BOARD_OFFSET_X, BOARD_OFFSET_Y + 40, BOARD_SIZE, 220, 24);

    this.add
      .text(GAME_WIDTH / 2, BOARD_OFFSET_Y + 110, `Счёт: ${this.finalScore}`, {
        fontFamily: '"Fredoka", sans-serif',
        fontSize: "42px",
        color: "#147a3f",
      })
      .setOrigin(0.5);

    const again = this.add
      .text(GAME_WIDTH / 2, BOARD_OFFSET_Y + 180, "Пробел — ещё раз", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "24px",
        color: COLORS.ink,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: again,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(GAME_WIDTH / 2, BOARD_OFFSET_Y + 300, "Esc — в меню", {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "18px",
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const restart = () => {
      if (!this.scene.isActive("gameover")) return;
      this.scene.start("game");
    };
    const toMenu = () => {
      if (!this.scene.isActive("gameover")) return;
      this.scene.start("menu");
    };

    this.input.keyboard.once("keydown-SPACE", restart);
    this.input.keyboard.once("keydown-ESC", toMenu);
    this.input.once("pointerdown", restart);
  }
}
