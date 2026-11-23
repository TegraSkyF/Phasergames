import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "Preload" });
  }

  create(): void {
    this.time.delayedCall(200, () => {
      this.scene.start("Menu");
    });
  }
}
