import Phaser from "phaser";
import { TEST_LEVEL } from "../data/testLevel";
import type { PlatformGateway } from "../platform/PlatformGateway";
import { ItemSprite, Shelf } from "../ui";

const ITEM_STARTS: Array<{ x: number; y: number }> = [
  { x: 140, y: 320 },
  { x: 300, y: 360 },
  { x: 460, y: 310 },
  { x: 580, y: 400 },
  { x: 180, y: 480 },
  { x: 420, y: 500 },
];

export class GameScene extends Phaser.Scene {
  private items: ItemSprite[] = [];
  private shelves: Shelf[] = [];
  private draggedItem: ItemSprite | null = null;
  private dragOffset = { x: 0, y: 0 };
  private levelComplete = false;

  constructor() {
    super({ key: "Game" });
  }

  create(): void {
    const gateway = this.registry.get("gateway") as PlatformGateway;
    gateway.gameplayStart();

    const bg = this.add.graphics();
    bg.fillStyle(0xf5ebda, 1);
    bg.fillRect(0, 0, 720, 1280);

    this.add
      .text(360, 72, "Уровень 1", {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        color: "#5A4632",
      })
      .setOrigin(0.5);

    this.shelves = [
      new Shelf(this, 200, 1000, TEST_LEVEL.shelves[0]),
      new Shelf(this, 520, 1000, TEST_LEVEL.shelves[1]),
    ];

    this.items = TEST_LEVEL.items.map((data, index) => {
      const start = ITEM_STARTS[index];
      const item = new ItemSprite(this, start.x, start.y, data);
      this.input.setDraggable(item);
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

    const pointerBounds = new Phaser.Geom.Rectangle(
      pointer.worldX - 40,
      pointer.worldY - 50,
      80,
      100,
    );

    let dropped = false;
    for (const shelf of this.shelves) {
      if (Phaser.Geom.Rectangle.Overlaps(pointerBounds, shelf.getBounds())) {
        dropped = true;
        if (shelf.addItem(gameObject)) {
          this.tweens.add({
            targets: gameObject,
            scale: 1,
            duration: 80,
            ease: "Sine.easeOut",
          });
        } else {
          gameObject.resetToHome();
        }
        break;
      }
    }

    if (!dropped) {
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
      this.scene.start("GameOver");
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
