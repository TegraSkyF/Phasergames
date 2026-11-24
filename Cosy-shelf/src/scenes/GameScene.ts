import Phaser from "phaser";
import type { PlatformGateway } from "../platform/PlatformGateway";
import { LevelManager, type LevelConfig } from "../systems/LevelManager";
import type { Progression } from "../systems/Progression";
import { Button } from "../ui/Button";
import { ItemSprite } from "../ui/ItemSprite";
import { Shelf } from "../ui/Shelf";

const SHELF_YS = [250, 450, 650, 850];
const TRAY_Y = 1040;
const TRAY_HEIGHT = 240;

export class GameScene extends Phaser.Scene {
  private items: ItemSprite[] = [];
  private shelves: Shelf[] = [];
  private trayItems: ItemSprite[] = [];
  private moveStack: ItemSprite[] = [];
  private draggedItem: ItemSprite | null = null;
  private dragOffset = { x: 0, y: 0 };
  private levelFinished = false;
  private failedChecks = 0;
  private elapsedSeconds = 0;
  private lastEmittedSecond = -1;
  private levelIndex = 0;
  private level: LevelConfig | null = null;
  private trayBounds = new Phaser.Geom.Rectangle(0, TRAY_Y, 720, TRAY_HEIGHT);

  constructor() {
    super({ key: "Game" });
  }

  init(data?: { levelIndex?: number }): void {
    this.levelIndex = data?.levelIndex ?? 0;
  }

  create(): void {
    this.items = [];
    this.shelves = [];
    this.trayItems = [];
    this.moveStack = [];
    this.draggedItem = null;
    this.levelFinished = false;
    this.failedChecks = 0;
    this.elapsedSeconds = 0;
    this.lastEmittedSecond = -1;
    this.input.enabled = true;

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

    this.layoutShelves();
    this.layoutTray();
    this.spawnItemsInTray();
    this.createTrayButtons();

    this.input.on("dragstart", this.onDragStart, this);
    this.input.on("drag", this.onDrag, this);
    this.input.on("dragend", this.onDragEnd, this);

    this.scene.launch("HUDScene", { levelId: this.level.id });
    this.scene.bringToTop("HUDScene");
    this.game.events.emit("hud-timer", 0);
    this.game.events.on("use-hint", this.onUseHint, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  update(_time: number, delta: number): void {
    if (this.levelFinished || this.scene.isPaused()) {
      return;
    }
    this.elapsedSeconds += delta / 1000;
    const seconds = Math.floor(this.elapsedSeconds);
    if (seconds !== this.lastEmittedSecond) {
      this.lastEmittedSecond = seconds;
      this.game.events.emit("hud-timer", seconds);
    }
  }

  private layoutShelves(): void {
    if (!this.level) {
      return;
    }
    this.shelves = this.level.shelves.map((shelfData, index) => {
      const y = SHELF_YS[index] ?? SHELF_YS[SHELF_YS.length - 1];
      return new Shelf(this, 360, y, shelfData);
    });
  }

  private layoutTray(): void {
    const tray = this.add.graphics();
    tray.fillStyle(0xa67c52, 1);
    tray.lineStyle(4, 0x5a4632, 1);
    tray.fillRoundedRect(8, TRAY_Y, 704, TRAY_HEIGHT - 8, 18);
    tray.strokeRoundedRect(8, TRAY_Y, 704, TRAY_HEIGHT - 8, 18);
  }

  private traySlotPosition(index: number, total: number): { x: number; y: number } {
    const cols = Math.min(7, Math.max(1, total));
    const col = index % cols;
    const row = Math.floor(index / cols);
    const innerWidth = 500;
    const startX = 360 - innerWidth / 2 + ItemSprite.WIDTH / 2;
    const step = cols <= 1 ? 0 : (innerWidth - ItemSprite.WIDTH) / (cols - 1);
    return {
      x: startX + col * step,
      y: TRAY_Y + 52 + row * 92 + ItemSprite.HEIGHT / 2,
    };
  }

  private spawnItemsInTray(): void {
    if (!this.level) {
      return;
    }
    const total = this.level.items.length;
    this.items = this.level.items.map((itemData, index) => {
      const pos = this.traySlotPosition(index, total);
      const item = new ItemSprite(this, pos.x, pos.y, itemData);
      item.setHome(item.x, item.y);
      this.input.setDraggable(item);
      item.enableGrab();
      this.trayItems.push(item);
      return item;
    });
  }

  private relayoutTray(): void {
    this.trayItems.forEach((item, index) => {
      const pos = this.traySlotPosition(index, this.trayItems.length);
      const x = pos.x - ItemSprite.WIDTH / 2;
      const y = pos.y - ItemSprite.HEIGHT / 2;
      item.setHome(x, y);
      this.tweens.add({
        targets: item,
        x,
        y,
        scale: 1,
        duration: 180,
        ease: "Sine.easeOut",
      });
    });
  }

  private returnToTray(item: ItemSprite, recordMove: boolean): void {
    for (const shelf of this.shelves) {
      shelf.removeItem(item);
    }
    if (!this.trayItems.includes(item)) {
      this.trayItems.push(item);
    }
    if (recordMove) {
      this.moveStack = this.moveStack.filter((moved) => moved !== item);
    }
    this.relayoutTray();
  }

  private createTrayButtons(): void {
    const undo = new Button(
      this,
      90,
      1252,
      140,
      56,
      "Undo",
      0xe8dcc0,
      0x5a4632,
      () => this.undoLastMove(),
    );
    undo.setDepth(1500);

    const check = new Button(
      this,
      630,
      1252,
      140,
      56,
      "Check",
      0x8fa876,
      0xf5ebda,
      () => {
        void this.runCheck();
      },
    );
    check.setDepth(1500);
  }

  private undoLastMove(): void {
    const item = this.moveStack.pop();
    if (!item) {
      return;
    }
    this.returnToTray(item, false);
  }

  private onDragStart(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
  ): void {
    if (!(gameObject instanceof ItemSprite) || this.levelFinished) {
      return;
    }

    for (const shelf of this.shelves) {
      if (shelf.items.includes(gameObject)) {
        shelf.removeItem(gameObject);
      }
    }
    this.trayItems = this.trayItems.filter((item) => item !== gameObject);

    gameObject.setDepth(1000);
    this.draggedItem = gameObject;
    this.dragOffset = {
      x: gameObject.x - pointer.x,
      y: gameObject.y - pointer.y,
    };
    gameObject.playPickup();
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
    const onTray =
      Phaser.Geom.Rectangle.Overlaps(itemBounds, this.trayBounds) ||
      Phaser.Geom.Rectangle.Contains(this.trayBounds, pointer.x, pointer.y);

    if (onTray) {
      this.returnToTray(gameObject, true);
      gameObject.setDepth(10);
      this.draggedItem = null;
      return;
    }

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
        if (!this.moveStack.includes(gameObject)) {
          this.moveStack.push(gameObject);
        }
        this.relayoutTray();
        break;
      }
    }

    if (!placed) {
      this.returnToTray(gameObject, true);
    }

    gameObject.setDepth(10);
    this.draggedItem = null;
  }

  private async runCheck(): Promise<void> {
    if (this.levelFinished || !this.level) {
      return;
    }

    this.shelves.forEach((shelf) => shelf.setError(false));

    const incomplete = this.shelves.some((shelf) => !shelf.isFull());
    const wrong = this.shelves.filter((shelf) => shelf.hasWrongItems());

    if (incomplete || wrong.length > 0 || this.trayItems.length > 0) {
      this.failedChecks += 1;
      wrong.forEach((shelf) => shelf.setError(true));
      this.cameras.main.shake(220, 0.008);
      return;
    }

    this.levelFinished = true;
    this.input.enabled = false;

    const stars = this.calcStars();
    const progression = this.registry.get("progression") as Progression | undefined;
    const prevStars = progression?.getStars(this.level.id) ?? 0;
    const reward = progression?.getLevelReward(this.levelIndex) ?? 0;
    if (progression) {
      progression.addFeathers(reward);
      await progression.recordLevelComplete(this.level.id, this.levelIndex, stars);
    }

    const gateway = this.registry.get("gateway") as PlatformGateway | undefined;
    gateway?.gameplayStop();

    const timeSeconds = Math.floor(this.elapsedSeconds);
    this.scene.stop("HUDScene");
    this.time.delayedCall(350, () => {
      this.scene.start("GameOver", {
        levelIndex: this.levelIndex,
        stars,
        prevStars,
        timeSeconds,
        reward,
      });
    });
  }

  private onUseHint(): void {
    if (this.levelFinished) {
      return;
    }
    const misplaced = this.items.find((item) => {
      const shelf = this.shelves.find((candidate) => candidate.items.includes(item));
      return !shelf || shelf.accepts !== item.tag;
    });
    if (!misplaced) {
      return;
    }
    const targetShelf = this.shelves.find((shelf) => shelf.accepts === misplaced.tag);
    this.pulseHint(misplaced);
    if (targetShelf) {
      this.pulseHint(targetShelf);
    }
  }

  private pulseHint(target: Phaser.GameObjects.Container): void {
    this.tweens.killTweensOf(target);
    target.setAlpha(0.5);
    this.tweens.add({
      targets: target,
      alpha: 1,
      duration: 250,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        target.setAlpha(1);
      },
    });
  }

  private calcStars(): number {
    const baseStars = this.failedChecks === 0 ? 2 : this.failedChecks <= 2 ? 1 : 0;
    const timeBonus = this.elapsedSeconds < 60 ? 1 : 0;
    return Math.min(3, Math.max(1, baseStars + timeBonus));
  }

  private handleShutdown(): void {
    this.input.off("dragstart", this.onDragStart, this);
    this.input.off("drag", this.onDrag, this);
    this.input.off("dragend", this.onDragEnd, this);
    this.game.events.off("use-hint", this.onUseHint, this);

    const gateway = this.registry.get("gateway") as PlatformGateway | undefined;
    gateway?.gameplayStop();
    this.scene.stop("HUDScene");
    this.scene.stop("PauseScene");
  }
}
