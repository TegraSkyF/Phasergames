import Phaser from "phaser";
import { createGateway } from "../platform";
import type { PlatformGateway } from "../platform/PlatformGateway";
import { Progression } from "../systems/Progression";
import { Save } from "../systems/Save";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "Boot" });
  }

  async create(): Promise<void> {
    this.scale.lockOrientation("portrait");

    const gateway: PlatformGateway = createGateway();
    this.registry.set("gateway", gateway);

    const save = new Save(gateway);
    const progression = new Progression(save);
    await progression.load();
    this.registry.set("save", save);
    this.registry.set("progression", progression);

    await gateway.init();
    gateway.ready();

    this.scene.start("Preload");
  }
}
