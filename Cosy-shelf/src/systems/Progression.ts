import type { Save, SaveData } from "./Save";

/** Temporary: every level is playable from the menu. Turn off before ship. */
export const UNLOCK_ALL_LEVELS = true;

export class Progression {
  private data: SaveData = {
    stars: {},
    unlockedMaxIndex: 0,
    feathers: 0,
    interstitialCount: 0,
  };
  private persistQueue: Promise<void> = Promise.resolve();

  constructor(private readonly save: Save) {}

  async load(): Promise<void> {
    this.data = await this.save.loadProgress();
  }

  isUnlocked(index: number): boolean {
    if (UNLOCK_ALL_LEVELS) {
      return true;
    }
    return index <= this.data.unlockedMaxIndex;
  }

  getStars(levelId: number): number {
    return this.data.stars[String(levelId)] ?? 0;
  }

  getUnlockedMaxIndex(): number {
    return this.data.unlockedMaxIndex;
  }

  getFeathers(): number {
    return this.data.feathers;
  }

  addFeathers(amount: number): void {
    this.data.feathers += amount;
    void this.persist();
  }

  getLevelReward(levelIndex: number): number {
    return 10 + levelIndex * 2;
  }

  async recordLevelComplete(
    levelId: number,
    index: number,
    stars: number,
  ): Promise<void> {
    const key = String(levelId);
    const previous = this.data.stars[key] ?? 0;
    this.data.stars[key] = Math.max(previous, stars);
    this.data.unlockedMaxIndex = Math.max(this.data.unlockedMaxIndex, index + 1);
    await this.persist();
  }

  private persist(): Promise<void> {
    this.persistQueue = this.persistQueue.then(async () => {
      const latest = await this.save.loadProgress();
      this.data.interstitialCount = Math.max(
        this.data.interstitialCount,
        latest.interstitialCount,
      );
      await this.save.saveProgress(this.data);
    });
    return this.persistQueue;
  }
}
