import Phaser from "phaser";
import type { Ads } from "../systems/Ads";
import { LevelManager } from "../systems/LevelManager";
import type { Progression } from "../systems/Progression";
import { Button } from "../ui/Button";

function formatClock(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export class GameOverScene extends Phaser.Scene {
  private levelIndex = 0;
  private stars = 1;
  private prevStars = 0;
  private timeSeconds = 0;
  private reward = 0;
  private displayedReward = 0;
  private doubled = false;

  constructor() {
    super({ key: "GameOver" });
  }

  init(data?: {
    levelIndex?: number;
    stars?: number;
    prevStars?: number;
    timeSeconds?: number;
    reward?: number;
  }): void {
    this.levelIndex = data?.levelIndex ?? 0;
    this.stars = data?.stars ?? 1;
    this.prevStars = data?.prevStars ?? 0;
    this.timeSeconds = data?.timeSeconds ?? 0;
    this.reward = data?.reward ?? 0;
    this.displayedReward = this.reward;
    this.doubled = false;
  }

  create(): void {
    const total = new LevelManager().getTotalLevels();
    const nextIndex = this.levelIndex + 1;
    const hasNext = nextIndex < total;

    const bg = this.add.graphics();
    bg.fillStyle(0xf5ebda, 1);
    bg.fillRect(0, 0, 720, 1280);

    this.add
      .text(360, 200, "Уровень пройден!", {
        fontFamily: "Georgia, serif",
        fontSize: "40px",
        fontStyle: "bold",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    this.add
      .text(360, 280, `Время: ${formatClock(this.timeSeconds)}`, {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#8FA876",
      })
      .setOrigin(0.5);

    const starXs = [240, 360, 480];
    starXs.forEach((x, index) => {
      this.drawStar(x, 400, index < this.stars);
    });

    if (this.stars > this.prevStars) {
      this.add
        .text(360, 500, "Новый рекорд!", {
          fontFamily: "Georgia, serif",
          fontSize: "28px",
          fontStyle: "bold",
          color: "#E07856",
        })
        .setOrigin(0.5);
    }

    const rewardLabel = this.add
      .text(360, 560, this.rewardText(), {
        fontFamily: "Georgia, serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    const doubleBtn = new Button(
      this,
      360,
      630,
      360,
      64,
      "Удвоить награду",
      0xe07856,
      0xf5ebda,
      () => {
        void this.tryDoubleReward(rewardLabel, doubleBtn);
      },
    );

    if (hasNext) {
      new Button(this, 360, 740, 360, 72, "Дальше", 0xa67c52, 0xf5ebda, () => {
        void this.goNext(nextIndex);
      });
    }

    new Button(this, 360, 840, 360, 72, "Ещё раз", 0xe8dcc0, 0x5a4632, () => {
      this.scene.start("Game", { levelIndex: this.levelIndex });
    });

    new Button(this, 360, 940, 360, 72, "В меню", 0xd9c7a8, 0x5a4632, () => {
      this.scene.start("Menu");
    });
  }

  private rewardText(): string {
    return `Награда: ${this.displayedReward} \u{1FAB6}`;
  }

  private async tryDoubleReward(
    rewardLabel: Phaser.GameObjects.Text,
    doubleBtn: Button,
  ): Promise<void> {
    if (this.doubled) {
      return;
    }
    const ads = this.registry.get("ads") as Ads | undefined;
    const success = (await ads?.showRewarded("double_reward")) ?? false;
    if (!success) {
      return;
    }
    const progression = this.registry.get("progression") as Progression | undefined;
    progression?.addFeathers(this.reward);
    this.doubled = true;
    this.displayedReward = this.reward * 2;
    rewardLabel.setText(this.rewardText());
    doubleBtn.disableInteractive();
    doubleBtn.setVisible(false);
  }

  private async goNext(nextIndex: number): Promise<void> {
    const ads = this.registry.get("ads") as Ads | undefined;
    await ads?.showInterstitial(this.levelIndex);
    this.scene.start("Game", { levelIndex: nextIndex });
  }

  private drawStar(cx: number, cy: number, filled: boolean): void {
    const g = this.add.graphics();
    const color = filled ? 0xd9b85c : 0xd9c7a8;
    const outer = 50;
    const inner = 22;
    g.fillStyle(color, 1);
    g.lineStyle(3, 0x5a4632, 1);
    g.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
  }
}
