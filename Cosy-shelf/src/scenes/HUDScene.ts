import Phaser from "phaser";
import { Button } from "../ui/Button";

function formatClock(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export class HUDScene extends Phaser.Scene {
  private levelLabel!: Phaser.GameObjects.Text;
  private timerLabel!: Phaser.GameObjects.Text;
  private levelId = 1;

  constructor() {
    super({ key: "HUDScene", active: false });
  }

  init(data?: { levelId?: number }): void {
    this.levelId = data?.levelId ?? 1;
  }

  create(): void {
    const bar = this.add.graphics();
    bar.fillStyle(0xa67c52, 1);
    bar.fillRect(0, 0, 720, 100);
    bar.lineStyle(3, 0x5a4632, 1);
    bar.beginPath();
    bar.moveTo(0, 100);
    bar.lineTo(720, 100);
    bar.strokePath();

    this.levelLabel = this.add
      .text(100, 50, `Уровень ${this.levelId}`, {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    this.timerLabel = this.add
      .text(360, 50, "00:00", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    new Button(this, 640, 50, 60, 60, "II", 0xe8dcc0, 0x5a4632, () => {
      this.openPause();
    });

    this.game.events.on("hud-timer", this.onHudTimer, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  updateTimer(seconds: number): void {
    this.timerLabel.setText(formatClock(seconds));
  }

  setLevel(levelId: number): void {
    this.levelId = levelId;
    this.levelLabel.setText(`Уровень ${levelId}`);
  }

  private onHudTimer(seconds: number): void {
    this.updateTimer(seconds);
  }

  private openPause(): void {
    if (this.scene.isActive("PauseScene")) {
      return;
    }
    this.scene.pause("Game");
    this.scene.launch("PauseScene");
    this.scene.bringToTop("PauseScene");
  }

  private handleShutdown(): void {
    this.game.events.off("hud-timer", this.onHudTimer, this);
  }
}
