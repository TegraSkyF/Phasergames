import Phaser from "phaser";
import { createGateway } from "../platform";
import type { PlatformGateway } from "../platform/PlatformGateway";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "Boot" });
  }

  async create(): Promise<void> {
    this.scale.lockOrientation("portrait");

    const gateway: PlatformGateway = createGateway();
    this.registry.set("gateway", gateway);

    await gateway.init();
    gateway.ready();

    this.scene.start("Preload");
  }
}
