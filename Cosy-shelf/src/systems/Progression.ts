import type { Save, SaveData } from "./Save";

/** Temporary: every level is playable from the menu. Turn off before ship. */
export const UNLOCK_ALL_LEVELS = true;

export class Progression {
  private data: SaveData = { stars: {}, unlockedMaxIndex: 0 };

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

  async recordLevelComplete(
    levelId: number,
    index: number,
    stars: number,
  ): Promise<void> {
    const key = String(levelId);
    const previous = this.data.stars[key] ?? 0;
    this.data.stars[key] = Math.max(previous, stars);
    this.data.unlockedMaxIndex = Math.max(this.data.unlockedMaxIndex, index + 1);
    await this.save.saveProgress(this.data);
  }
}
