import Phaser from "phaser";

export interface ItemData {
  id: string;
  tag: string;
  label: string;
  color: number;
}

export class ItemSprite extends Phaser.GameObjects.Container {
  readonly id: string;
  readonly tag: string;

  private readonly homeX: number;
  private readonly homeY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, data: ItemData) {
    super(scene, x, y);

    this.id = data.id;
    this.tag = data.tag;
    this.homeX = x;
    this.homeY = y;

    const bg = scene.add.graphics();
    bg.fillStyle(data.color, 1);
    bg.fillRoundedRect(-40, -50, 80, 100, 14);
    this.add(bg);

    const label = scene.add
      .text(0, 0, data.label, {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: "#000000",
      })
      .setOrigin(0.5);
    this.add(label);

    this.setSize(80, 100);
    this.setOrigin(0.5);
    this.setInteractive({ draggable: true, useHandCursor: true });
    scene.add.existing(this);
  }

  resetToHome(x: number = this.homeX, y: number = this.homeY): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      x,
      y,
      scale: 1,
      duration: 250,
      ease: "Back.easeOut",
    });
  }
}
