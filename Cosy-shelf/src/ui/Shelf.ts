import Phaser from "phaser";
import { ItemSprite } from "./ItemSprite";

export interface ShelfData {
  id: string;
  accepts: string;
  slots: number;
}

const DROP_PADDING = 72;

export class Shelf extends Phaser.GameObjects.Container {
  readonly accepts: string;
  readonly slots: number;
  items: ItemSprite[] = [];

  private readonly shelfWidth: number;
  private readonly shelfHeight: number;
  private readonly slotPositions: Array<{ x: number; y: number }> = [];

  constructor(scene: Phaser.Scene, x: number, y: number, data: ShelfData) {
    super(scene, x, y);

    this.accepts = data.accepts;
    this.slots = data.slots;
    this.shelfWidth = data.slots * 90 + 20;
    this.shelfHeight = 150;
    this.setPosition(x - this.shelfWidth / 2, y - this.shelfHeight / 2);

    const bg = scene.add.graphics();
    bg.fillStyle(0xd9c7a8, 1);
    bg.lineStyle(3, 0xb89b72, 1);
    bg.fillRoundedRect(0, 0, this.shelfWidth, this.shelfHeight, 18);
    bg.strokeRoundedRect(0, 0, this.shelfWidth, this.shelfHeight, 18);
    this.add(bg);

    const caption = scene.add
      .text(this.shelfWidth / 2, 18, data.accepts, {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#5a4632",
      })
      .setOrigin(0.5)
      .setAlpha(0.55);
    this.add(caption);

    for (let i = 0; i < data.slots; i += 1) {
      this.slotPositions.push({
        x: 10 + 45 + i * 90,
        y: this.shelfHeight / 2 + 8,
      });
    }

    this.setSize(this.shelfWidth, this.shelfHeight);
    this.setInteractive({ dropZone: true });
    scene.add.existing(this);
  }

  getDropBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.x - DROP_PADDING,
      this.y - DROP_PADDING,
      this.shelfWidth + DROP_PADDING * 2,
      this.shelfHeight + DROP_PADDING * 2,
    );
  }

  addItem(item: ItemSprite): boolean {
    if (item.tag !== this.accepts) {
      return false;
    }
    if (this.items.length >= this.slots) {
      return false;
    }

    this.items.push(item);
    const slot = this.slotPositions[this.items.length - 1];
    this.scene.tweens.add({
      targets: item,
      x: this.x + slot.x - ItemSprite.WIDTH / 2,
      y: this.y + slot.y - ItemSprite.HEIGHT / 2,
      duration: 150,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          targets: item,
          scale: 0.95,
          duration: 75,
          yoyo: true,
          ease: "Sine.easeInOut",
        });
      },
    });
    return true;
  }

  removeItem(item: ItemSprite): void {
    this.items = this.items.filter((placed) => placed !== item);
  }

  isFull(): boolean {
    return this.items.length === this.slots;
  }
}
