import Phaser from "phaser";
import type { PlatformGateway } from "../platform/PlatformGateway";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "Game" });
  }

  create(): void {
    const gateway = this.registry.get("gateway") as PlatformGateway;
    gateway.gameplayStart();

    const { width, height } = this.scale;

    this.add
      .text(width / 2, 160, "Уровень", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#f4efe6",
      })
      .setOrigin(0.5);

    const finish = this.add
      .text(width / 2, height / 2 - 20, "Finish", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#2b241c",
        backgroundColor: "#e7d3b0",
        padding: { x: 36, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    finish.on("pointerup", () => {
      this.scene.start("GameOver");
    });

    const exit = this.add
      .text(width / 2, height / 2 + 80, "Exit", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#2b241c",
        backgroundColor: "#d4c4a8",
        padding: { x: 36, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    exit.on("pointerup", () => {
      this.scene.start("Menu");
    });

    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  private handleShutdown(): void {
    const gateway = this.registry.get("gateway") as PlatformGateway | undefined;
    gateway?.gameplayStop();
    this.scene.stop("HUDScene");
  }
}
