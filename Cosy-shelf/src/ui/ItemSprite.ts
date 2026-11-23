import Phaser from "phaser";

export interface ItemData {
  id: string;
  tag: string;
  sprite?: string;
}

export class ItemSprite extends Phaser.GameObjects.Container {
  static readonly WIDTH = 100;
  static readonly HEIGHT = 100;

  readonly id: string;
  readonly tag: string;

  private homeX: number;
  private homeY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, data: ItemData) {
    super(scene, x - ItemSprite.WIDTH / 2, y - ItemSprite.HEIGHT / 2);

    this.id = data.id;
    this.tag = data.tag;
    this.homeX = this.x;
    this.homeY = this.y;

    const bg = scene.add.graphics();
    bg.fillStyle(0xe8dcc0, 0.9);
    bg.lineStyle(3, 0x5a4632, 1);
    bg.fillCircle(50, 50, 46);
    bg.strokeCircle(50, 50, 46);
    this.add(bg);

    const label = scene.add
      .text(50, 50, data.tag.toUpperCase(), {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#5A4632",
        align: "center",
        wordWrap: { width: 80 },
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

  setHome(x: number, y: number): void {
    this.homeX = x;
    this.homeY = y;
  }

  playPickup(): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scale: 1.1,
      duration: 100,
      ease: "Sine.easeOut",
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
