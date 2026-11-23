import Phaser from "phaser";

export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: "HUDScene", active: false });
  }

  create(): void {
    this.add
      .text(24, 24, "HUD", {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#f4efe6",
        backgroundColor: "#4a3f35",
        padding: { x: 12, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }
}
