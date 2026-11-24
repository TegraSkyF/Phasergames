import Phaser from "phaser";
import { LevelManager } from "../systems/LevelManager";
import type { Progression } from "../systems/Progression";

export class GameOverScene extends Phaser.Scene {
  private levelIndex = 0;
  private stars = 1;

  constructor() {
    super({ key: "GameOver" });
  }

  init(data?: { levelIndex?: number; stars?: number }): void {
    this.levelIndex = data?.levelIndex ?? 0;
    this.stars = data?.stars ?? 1;
  }

  create(): void {
    const { width, height } = this.scale;
    const total = new LevelManager().getTotalLevels();
    const progression = this.registry.get("progression") as Progression | undefined;
    const nextIndex = this.levelIndex + 1;
    const hasNext =
      nextIndex < total && (progression?.isUnlocked(nextIndex) ?? true);

    this.add
      .text(width / 2, height / 2 - 220, "Уровень пройден!", {
        fontFamily: "Georgia, serif",
        fontSize: "44px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 140, "★".repeat(this.stars) + "☆".repeat(3 - this.stars), {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#d9b85c",
      })
      .setOrigin(0.5);

    let y = height / 2 - 20;

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
