import Phaser from "phaser";
import { Button } from "../ui/Button";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: "PauseScene", active: false });
  }

  create(): void {
    const dim = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.5);
    dim.setInteractive();

    const panel = this.add.graphics();
    panel.fillStyle(0xe8dcc0, 1);
    panel.lineStyle(4, 0xa67c52, 1);
    panel.fillRoundedRect(110, 440, 500, 400, 24);
    panel.strokeRoundedRect(110, 440, 500, 400, 24);

    this.add
      .text(360, 520, "Пауза", {
        fontFamily: "Georgia, serif",
        fontSize: "40px",
        fontStyle: "bold",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    new Button(this, 360, 640, 320, 72, "Продолжить", 0xa67c52, 0xf5ebda, () => {
      this.resumeGame();
    });

    new Button(this, 360, 740, 320, 72, "В меню", 0xe8dcc0, 0x5a4632, () => {
      this.leaveToMenu();
    });
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume("Game");
  }

  private leaveToMenu(): void {
    this.scene.stop();
    this.scene.stop("HUDScene");
    this.scene.stop("Game");
    this.scene.start("Menu");
  }
}
