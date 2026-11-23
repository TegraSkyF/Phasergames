import Phaser from "phaser";

export class HUDScene extends Phaser.Scene {
  private levelLabel!: Phaser.GameObjects.Text;
  private timerLabel!: Phaser.GameObjects.Text;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;
  private startedAt = 0;
  private pausedMs = 0;
  private pauseStartedAt = 0;
  private isPaused = false;

  constructor() {
    super({ key: "HUDScene", active: false });
  }

  init(data?: { levelId?: number; startedAt?: number }): void {
    this.startedAt = data?.startedAt ?? Date.now();
    this.pausedMs = 0;
    this.isPaused = false;
    this.pauseOverlay = null;
    this.registry.set("hudLevelId", data?.levelId ?? 1);
  }

  create(): void {
    const levelId = (this.registry.get("hudLevelId") as number | undefined) ?? 1;

    const bar = this.add.graphics();
    bar.fillStyle(0xa67c52, 1);
    bar.lineStyle(3, 0x5a4632, 1);
    bar.fillRoundedRect(16, 16, 688, 88, 18);
    bar.strokeRoundedRect(16, 16, 688, 88, 18);

    this.levelLabel = this.add
      .text(40, 60, `Уровень ${levelId}`, {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        color: "#f5ebda",
      })
      .setOrigin(0, 0.5);

    this.timerLabel = this.add
      .text(360, 60, "00:00", {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        color: "#f5ebda",
      })
      .setOrigin(0.5);

    const pause = this.add
      .text(680, 60, "Пауза", {
        fontFamily: "Georgia, serif",
        fontSize: "22px",
        color: "#5A4632",
        backgroundColor: "#e8dcc0",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true });

    pause.on("pointerup", () => this.togglePause());

    this.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => this.refreshTimer(),
    });
  }

  private refreshTimer(): void {
    const extra = this.isPaused ? Date.now() - this.pauseStartedAt : 0;
    const elapsed = Math.max(0, Date.now() - this.startedAt - this.pausedMs - extra);
    const seconds = Math.floor(elapsed / 1000);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    this.timerLabel.setText(`${mm}:${ss}`);
  }

  private togglePause(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.pausedMs += Date.now() - this.pauseStartedAt;
      this.scene.resume("Game");
      this.pauseOverlay?.destroy(true);
      this.pauseOverlay = null;
      return;
    }

    this.isPaused = true;
    this.pauseStartedAt = Date.now();
    this.scene.pause("Game");

    const overlay = this.add.container(0, 0);
    const dim = this.add.rectangle(360, 640, 720, 1280, 0x2b241c, 0.55);
    const panel = this.add
      .text(360, 560, "Пауза", {
        fontFamily: "Georgia, serif",
        fontSize: "48px",
        color: "#f5ebda",
      })
      .setOrigin(0.5);
    const resume = this.add
      .text(360, 660, "Продолжить", {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#2b241c",
        backgroundColor: "#e7d3b0",
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const menu = this.add
      .text(360, 760, "В меню", {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#2b241c",
        backgroundColor: "#d4c4a8",
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    resume.on("pointerup", () => this.togglePause());
    menu.on("pointerup", () => {
      this.scene.stop("HUDScene");
      this.scene.stop("Game");
      this.scene.start("Menu");
    });

    overlay.add([dim, panel, resume, menu]);
    this.pauseOverlay = overlay;
  }
}
