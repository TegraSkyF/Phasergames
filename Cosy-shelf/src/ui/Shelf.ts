import Phaser from "phaser";
import { ItemSprite } from "./ItemSprite";

export interface ShelfData {
  id: string;
  accepts: string;
  slots: number;
}

export class Shelf extends Phaser.GameObjects.Container {
  static readonly WIDTH = 680;
  static readonly HEIGHT = 120;
  static readonly SLOT_LEFT = 50;
  static readonly SLOT_RIGHT = 630;

  readonly accepts: string;
  readonly slots: number;
  items: ItemSprite[] = [];

  private readonly slotOccupant: Array<ItemSprite | null> = [];
  private readonly slotPositions: Array<{ x: number; y: number }> = [];
  private readonly board: Phaser.GameObjects.Graphics;
  private readonly caption: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, data: ShelfData) {
    super(scene, x - Shelf.WIDTH / 2, y - Shelf.HEIGHT / 2);

    this.accepts = data.accepts;
    this.slots = data.slots;

    this.board = scene.add.graphics();
    this.drawBoard(0xa67c52);
    this.add(this.board);

    this.caption = scene.add
      .text(24, 16, data.accepts, {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#f5ebda",
      })
      .setAlpha(0.85);
    this.add(this.caption);

    const span = Shelf.SLOT_RIGHT - Shelf.SLOT_LEFT;
    const step = this.slots <= 1 ? 0 : span / (this.slots - 1);
    for (let i = 0; i < this.slots; i += 1) {
      this.slotPositions.push({
        x: Shelf.SLOT_LEFT + i * step,
        y: Shelf.HEIGHT / 2 + 8,
      });
      this.slotOccupant.push(null);
    }

    this.setSize(Shelf.WIDTH, Shelf.HEIGHT);
    this.setInteractive({ dropZone: true });
    scene.add.existing(this);
  }

  private drawBoard(fill: number): void {
    this.board.clear();
    this.board.fillStyle(fill, 1);
    this.board.lineStyle(3, 0x5a4632, 1);
    this.board.fillRoundedRect(0, 0, Shelf.WIDTH, Shelf.HEIGHT, 12);
    this.board.strokeRoundedRect(0, 0, Shelf.WIDTH, Shelf.HEIGHT, 12);
  }

  getDropBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, Shelf.WIDTH, Shelf.HEIGHT);
  }

  addItem(item: ItemSprite): boolean {
    const slotIndex = this.slotOccupant.findIndex((occupant) => occupant === null);
    if (slotIndex < 0) {
      return false;
    }

    this.slotOccupant[slotIndex] = item;
    this.items.push(item);
    const slot = this.slotPositions[slotIndex];
    this.scene.tweens.add({
      targets: item,
      x: this.x + slot.x - ItemSprite.WIDTH / 2,
      y: this.y + slot.y - ItemSprite.HEIGHT / 2,
      scale: 1,
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
    const index = this.slotOccupant.indexOf(item);
    if (index >= 0) {
      this.slotOccupant[index] = null;
    }
  }

  isFull(): boolean {
    return this.items.length === this.slots;
  }

  hasWrongItems(): boolean {
    return this.items.some((item) => item.tag !== this.accepts);
  }

  setError(active: boolean): void {
    this.drawBoard(active ? 0xc45c4a : 0xa67c52);
  }
}
