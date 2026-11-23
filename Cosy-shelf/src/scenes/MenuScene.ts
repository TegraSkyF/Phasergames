import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "Menu" });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 120, "Уютная Полка", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    const play = this.add
      .text(width / 2, height / 2 + 40, "Play", {
        fontFamily: "Georgia, serif",
        fontSize: "36px",
        color: "#2b241c",
        backgroundColor: "#e7d3b0",
        padding: { x: 40, y: 16 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    play.on("pointerup", () => {
      this.scene.start("Game", { levelIndex: 0 });
    });
  }
}
