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

    const exit = this.add
      .text(680, 72, "Выход", {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#5A4632",
        backgroundColor: "#e7d3b0",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });

    exit.on("pointerup", () => {
      this.scene.start("Menu");
    });

    this.layoutLevel();

    this.input.on("dragstart", this.onDragStart, this);
    this.input.on("drag", this.onDrag, this);
    this.input.on("dragend", this.onDragEnd, this);

    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  private layoutLevel(): void {
    if (!this.level) {
      return;
    }

    const gameWidth = 720;
    const gameHeight = 1280;
    const edge = 20;
    const maxRowWidth = gameWidth - edge * 2;
    const minItemShelfGap = 100;
    const shelfCount = this.level.shelves.length;

    let shelfWidth = Math.max(
      ...this.level.shelves.map((shelf) => Shelf.naturalWidth(shelf.slots)),
    );
    if (shelfCount * shelfWidth > maxRowWidth) {
      shelfWidth = Math.max(Shelf.MIN_WIDTH, maxRowWidth / shelfCount);
    }

    const rowWidth = shelfCount * shelfWidth;
    const rowLeft = (gameWidth - rowWidth) / 2;
    const shelfTop = gameHeight - edge - Shelf.HEIGHT;
    const shelfCenterY = shelfTop + Shelf.HEIGHT / 2;

    this.shelves = this.level.shelves.map((shelfData, index) => {
      const shelfX = rowLeft + index * shelfWidth + shelfWidth / 2;
      return new Shelf(this, shelfX, shelfCenterY, shelfData, shelfWidth);
    });

    const itemCount = this.level.items.length;
    const cols = itemCount <= 4 ? Math.min(2, itemCount) : Math.min(3, itemCount);
    const rows = Math.ceil(itemCount / Math.max(cols, 1));
    const itemAreaTop = 160;
    const itemAreaBottom = shelfTop - minItemShelfGap;
    const rowStep =
      rows <= 1
        ? 0
        : Math.min(
            140,
            Math.max(
              ItemSprite.HEIGHT + 16,
              (itemAreaBottom - itemAreaTop - ItemSprite.HEIGHT) / (rows - 1),
            ),
          );
    const firstCenterY = itemAreaTop + ItemSprite.HEIGHT / 2;
    const colStep =
      cols <= 1 ? 0 : Math.min(180, (maxRowWidth - ItemSprite.WIDTH) / (cols - 1));
    const gridWidth = ItemSprite.WIDTH + (cols - 1) * colStep;
    const firstCenterX = gameWidth / 2 - gridWidth / 2 + ItemSprite.WIDTH / 2;

    this.items = this.level.items.map((itemData, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = firstCenterX + col * colStep;
      const y = firstCenterY + row * rowStep;
      const item = new ItemSprite(this, x, y, itemData);
      this.input.setDraggable(item);
      item.enableGrab();
      return item;
    });
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
