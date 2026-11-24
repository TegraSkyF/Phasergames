import Phaser from "phaser";
import config from "../data/config.json";
import { createGateway } from "../platform";
import type { PlatformGateway } from "../platform/PlatformGateway";
import { Ads } from "../systems/Ads";
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

    const ads = new Ads(
      gateway,
      save,
      {
        interstitialCooldownMs: config.interstitialCooldownMs,
        interstitialMinLevel: config.interstitialMinLevel,
        rewardedCooldownMs: config.rewardedCooldownMs,
      },
      this.game,
    );
    this.registry.set("ads", ads);

    await gateway.init();
    gateway.ready();

    this.scene.start("Preload");
  }
}
