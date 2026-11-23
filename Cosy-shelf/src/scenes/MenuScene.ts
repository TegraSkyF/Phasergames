import Phaser from "phaser";
import { LevelManager } from "../systems/LevelManager";
import type { Progression } from "../systems/Progression";

function starText(count: number): string {
  if (count <= 0) {
    return "";
  }
  return " " + "★".repeat(count) + "☆".repeat(3 - count);
}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "Menu" });
  }

  create(): void {
    const { width } = this.scale;
    const manager = new LevelManager();
    const total = manager.getTotalLevels();
    const progression = this.registry.get("progression") as Progression | undefined;

    this.add
      .text(width / 2, 90, "Уютная Полка", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 150, "Выберите уровень", {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#d4c4a8",
      })
      .setOrigin(0.5);

    const cols = 5;
    const btnW = 112;
    const btnH = 88;
    const gapX = 18;
    const gapY = 18;
    const gridW = cols * btnW + (cols - 1) * gapX;
    const startX = (width - gridW) / 2 + btnW / 2;
    const startY = 230;

    for (let index = 0; index < total; index += 1) {
      const level = manager.getLevel(index);
      if (!level) {
        continue;
      }
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (btnW + gapX);
      const y = startY + row * (btnH + gapY);
      const unlocked = progression?.isUnlocked(index) ?? index === 0;
      const stars = progression?.getStars(level.id) ?? 0;
      const label = unlocked ? `${level.id}${starText(stars)}` : `${level.id} 🔒`;

      const button = this.add
        .text(x, y, label, {
          fontFamily: "Georgia, serif",
          fontSize: "22px",
          color: unlocked ? "#2b241c" : "#7a6a5a",
          backgroundColor: unlocked ? "#e7d3b0" : "#c4b49a",
          padding: { x: 12, y: 16 },
          align: "center",
        })
        .setOrigin(0.5);

      if (unlocked) {
        button.setInteractive({ useHandCursor: true });
        button.on("pointerup", () => {
          this.scene.start("Game", { levelIndex: index });
        });
      }
    }
  }
}
