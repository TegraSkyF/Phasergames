import Phaser from "phaser";
import type { PlatformGateway } from "../platform/PlatformGateway";
import type { Save } from "./Save";

export interface AdsConfig {
  interstitialCooldownMs: number;
  interstitialMinLevel: number;
  rewardedCooldownMs: number;
}

export class Ads {
  private lastInterstitialAt = 0;
  private lastRewardedAt = 0;
  private showing = false;

  constructor(
    private readonly gateway: PlatformGateway,
    private readonly save: Save,
    private readonly config: AdsConfig,
    private readonly game: Phaser.Game,
  ) {}

  async showInterstitial(currentLevelIndex: number): Promise<void> {
    if (currentLevelIndex < this.config.interstitialMinLevel) {
      return;
    }
    if (Date.now() - this.lastInterstitialAt < this.config.interstitialCooldownMs) {
      return;
    }
    if (this.showing) {
      return;
    }

    this.showing = true;
    try {
      await this.withAdMuted(async () => {
        await this.gateway.showInterstitial();
      });
      this.lastInterstitialAt = Date.now();
      const data = await this.save.loadProgress();
      data.interstitialCount += 1;
      await this.save.saveProgress(data);
    } finally {
      this.showing = false;
    }
  }

  async showRewarded(placement: string): Promise<boolean> {
    if (this.showing) {
      return false;
    }
    if (Date.now() - this.lastRewardedAt < this.config.rewardedCooldownMs) {
      return false;
    }

    this.showing = true;
    this.gateway.track("ad_requested", { type: "rewarded", placement });
    try {
      const rewarded = await this.withAdMuted(async () => {
        return this.gateway.showRewarded();
      });
      this.lastRewardedAt = Date.now();
      return rewarded;
    } finally {
      this.showing = false;
    }
  }

  private async withAdMuted<T>(run: () => Promise<T>): Promise<T> {
    const gameWasRunning =
      this.game.scene.isActive("Game") && !this.game.scene.isPaused("Game");
    if (gameWasRunning) {
      this.game.scene.pause("Game");
    }
    this.game.sound.pauseAll();
    try {
      return await run();
    } finally {
      this.game.sound.resumeAll();
      if (gameWasRunning) {
        this.game.scene.resume("Game");
      }
    }
  }
}
