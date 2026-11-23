import Phaser from "phaser";
import { LevelManager } from "../systems/LevelManager";

const RULE_LABEL: Record<string, string> = {
  color: "цвет",
  type: "тип",
};

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "Menu" });
  }

  create(): void {
    const { width, height } = this.scale;
    const manager = new LevelManager();
    const total = manager.getTotalLevels();

    this.add
      .text(width / 2, 220, "Уютная Полка", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 300, "Выберите уровень", {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#d4c4a8",
      })
      .setOrigin(0.5);

    const startY = 420;
    const gap = 110;

    for (let index = 0; index < total; index += 1) {
      const level = manager.getLevel(index);
      if (!level) {
        continue;
      }

      const rule = RULE_LABEL[level.rule] ?? level.rule;
      const button = this.add
        .text(width / 2, startY + index * gap, `Уровень ${level.id}  ·  ${rule}`, {
          fontFamily: "Georgia, serif",
          fontSize: "32px",
          color: "#2b241c",
          backgroundColor: "#e7d3b0",
          padding: { x: 36, y: 14 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      button.on("pointerup", () => {
        this.scene.start("Game", { levelIndex: index });
      });
    }
  }
}
