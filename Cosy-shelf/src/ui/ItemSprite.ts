import Phaser from "phaser";

export interface ItemData {
  id: string;
  tag: string;
  label: string;
  color: number;
}

export class ItemSprite extends Phaser.GameObjects.Container {
  static readonly WIDTH = 80;
  static readonly HEIGHT = 100;

  readonly id: string;
  readonly tag: string;

  private readonly homeX: number;
  private readonly homeY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, data: ItemData) {
    super(scene, x - ItemSprite.WIDTH / 2, y - ItemSprite.HEIGHT / 2);

    this.id = data.id;
    this.tag = data.tag;
    this.homeX = this.x;
    this.homeY = this.y;

    const bg = scene.add.graphics();
    bg.fillStyle(data.color, 1);
    bg.fillRoundedRect(0, 0, ItemSprite.WIDTH, ItemSprite.HEIGHT, 14);
    this.add(bg);

    const label = scene.add
      .text(ItemSprite.WIDTH / 2, ItemSprite.HEIGHT / 2, data.label, {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        color: "#000000",
      })
      .setOrigin(0.5);
    this.add(label);

    this.setSize(ItemSprite.WIDTH, ItemSprite.HEIGHT);
    this.enableGrab();
    scene.add.existing(this);
  }

  enableGrab(): void {
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, ItemSprite.WIDTH, ItemSprite.HEIGHT),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      draggable: true,
      useHandCursor: true,
    });
  }

  getDropBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, ItemSprite.WIDTH, ItemSprite.HEIGHT);
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
