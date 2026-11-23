import Phaser from "phaser";
import type { PlatformGateway } from "../platform/PlatformGateway";
import { LevelManager, type LevelConfig } from "../systems/LevelManager";
import { ItemSprite, Shelf } from "../ui";

export class GameScene extends Phaser.Scene {
  private items: ItemSprite[] = [];
  private shelves: Shelf[] = [];
  private draggedItem: ItemSprite | null = null;
  private dragOffset = { x: 0, y: 0 };
  private levelComplete = false;
  private levelIndex = 0;
  private level: LevelConfig | null = null;

  constructor() {
    super({ key: "Game" });
  }

  init(data?: { levelIndex?: number }): void {
    this.levelIndex = data?.levelIndex ?? 0;
  }

  create(): void {
    this.items = [];
    this.shelves = [];
    this.draggedItem = null;
    this.levelComplete = false;
    this.input.enabled = true;

    console.log(this.levelIndex);

    const gateway = this.registry.get("gateway") as PlatformGateway;
    gateway.gameplayStart();

    this.level = new LevelManager().getLevel(this.levelIndex);
    if (!this.level) {
      console.error(`Level not found: ${this.levelIndex}`);
      gateway.gameplayStop();
      this.scene.start("Menu");
      return;
    }

    const bg = this.add.graphics();
    bg.fillStyle(0xf5ebda, 1);
    bg.fillRect(0, 0, 720, 1280);

    this.add
      .text(360, 72, `Уровень ${this.level.id}`, {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    const shelfCount = this.level.shelves.length;
    const shelfY = 1000;
    this.shelves = this.level.shelves.map((shelfData, index) => {
      const shelfX = (720 * (index + 0.5)) / shelfCount;
      return new Shelf(this, shelfX, shelfY, shelfData);
    });

    const cols = 3;
    const startY = 350;
    const rowGap = 140;
    const colGap = 180;
    this.items = this.level.items.map((itemData, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 720 / 2 + (col - (cols - 1) / 2) * colGap;
      const y = startY + row * rowGap;
      const item = new ItemSprite(this, x, y, itemData);
      this.input.setDraggable(item);
      item.enableGrab();
      return item;
    });

    this.input.on("dragstart", this.onDragStart, this);
    this.input.on("drag", this.onDrag, this);
    this.input.on("dragend", this.onDragEnd, this);

    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  private onDragStart(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ): void {
    if (!(gameObject instanceof ItemSprite)) {
      return;
    }

    const parent = gameObject.parentContainer;
    const nestedParent = parent?.parentContainer;
    if (parent instanceof Shelf) {
      parent.removeItem(gameObject);
    } else if (nestedParent instanceof Shelf) {
      nestedParent.removeItem(gameObject);
    } else {
      for (const shelf of this.shelves) {
        if (shelf.items.includes(gameObject)) {
          shelf.removeItem(gameObject);
        }
      }
    }

    gameObject.setDepth(1000);
    this.draggedItem = gameObject;
    this.dragOffset = {
      x: gameObject.x - pointer.x,
      y: gameObject.y - pointer.y,
    };

    this.tweens.killTweensOf(gameObject);
    this.tweens.add({
      targets: gameObject,
      scale: 1.08,
      duration: 100,
      ease: "Sine.easeOut",
    });
  }

  private onDrag(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ): void {
    if (gameObject instanceof ItemSprite) {
      gameObject.setPosition(
        pointer.x + this.dragOffset.x,
        pointer.y + this.dragOffset.y,
      );
    }
  }

  private onDragEnd(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ): void {
    if (!(gameObject instanceof ItemSprite)) {
      return;
    }

    const itemBounds = gameObject.getDropBounds();
    let placed = false;

    for (const shelf of this.shelves) {
      const dropBounds = shelf.getDropBounds();
      const hitsShelf =
        Phaser.Geom.Rectangle.Overlaps(itemBounds, dropBounds) ||
        Phaser.Geom.Rectangle.Contains(dropBounds, pointer.x, pointer.y);

      if (!hitsShelf) {
        continue;
      }

      if (shelf.addItem(gameObject)) {
        placed = true;
        this.tweens.add({
          targets: gameObject,
          scale: 1,
          duration: 80,
          ease: "Sine.easeOut",
        });
        break;
      }
    }

    if (!placed) {
      gameObject.resetToHome();
    }

    gameObject.setDepth(10);
    this.draggedItem = null;
    this.checkLevelComplete();
  }

  private checkLevelComplete(): void {
    if (this.levelComplete) {
      return;
    }
    if (!this.shelves.every((shelf) => shelf.isFull())) {
      return;
    }

    this.levelComplete = true;
    this.input.enabled = false;

    const gateway = this.registry.get("gateway") as PlatformGateway | undefined;
    gateway?.gameplayStop();

    this.time.delayedCall(400, () => {
      this.scene.start("GameOver", { levelIndex: this.levelIndex });
    });
  }

  private handleShutdown(): void {
    this.input.off("dragstart", this.onDragStart, this);
    this.input.off("drag", this.onDrag, this);
    this.input.off("dragend", this.onDragEnd, this);

    const gateway = this.registry.get("gateway") as PlatformGateway | undefined;
    gateway?.gameplayStop();
    this.scene.stop("HUDScene");
  }
}
