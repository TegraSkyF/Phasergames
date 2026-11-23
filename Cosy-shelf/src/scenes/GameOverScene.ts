import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOver" });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 140, "Game Over", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    const retry = this.add
      .text(width / 2, height / 2, "Retry", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#2b241c",
        backgroundColor: "#e7d3b0",
        padding: { x: 36, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retry.on("pointerup", () => {
      this.scene.start("Game");
    });

    const menu = this.add
      .text(width / 2, height / 2 + 100, "Menu", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#2b241c",
        backgroundColor: "#d4c4a8",
        padding: { x: 36, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menu.on("pointerup", () => {
      this.scene.start("Menu");
    });
  }
}
