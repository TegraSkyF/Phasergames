import Phaser from "phaser";
import { LevelManager } from "../systems/LevelManager";

export class GameOverScene extends Phaser.Scene {
  private levelIndex = 0;

  constructor() {
    super({ key: "GameOver" });
  }

  init(data?: { levelIndex?: number }): void {
    this.levelIndex = data?.levelIndex ?? 0;
  }

  create(): void {
    const { width, height } = this.scale;
    const total = new LevelManager().getTotalLevels();
    const nextIndex = this.levelIndex + 1;
    const hasNext = nextIndex < total;

    this.add
      .text(width / 2, height / 2 - 200, "Уровень пройден!", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    let y = height / 2 - 40;

    if (hasNext) {
      const next = this.add
        .text(width / 2, y, "Следующий уровень", {
          fontFamily: "Georgia, serif",
          fontSize: "32px",
          color: "#2b241c",
          backgroundColor: "#e7d3b0",
          padding: { x: 36, y: 14 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      next.on("pointerup", () => {
        this.scene.start("Game", { levelIndex: nextIndex });
      });
      y += 100;
    }

    const retry = this.add
      .text(width / 2, y, "Retry", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#2b241c",
        backgroundColor: "#d4c4a8",
        padding: { x: 36, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retry.on("pointerup", () => {
      this.scene.start("Game", { levelIndex: this.levelIndex ?? 0 });
    });

    const menu = this.add
      .text(width / 2, y + 100, "Menu", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#2b241c",
        backgroundColor: "#cbbba0",
        padding: { x: 36, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menu.on("pointerup", () => {
      this.scene.start("Menu");
    });
  }
}
