import type { PlatformGateway } from "../platform/PlatformGateway";

export interface SaveData {
  stars: Record<string, number>;
  unlockedMaxIndex: number;
  feathers: number;
  interstitialCount: number;
}

const SAVE_KEY = "cosy-shelf-progress";

const DEFAULT_SAVE: SaveData = {
  stars: {},
  unlockedMaxIndex: 0,
  feathers: 0,
  interstitialCount: 0,
};

export class Save {
  constructor(private readonly gateway: PlatformGateway) {}

  async saveProgress(data: SaveData): Promise<void> {
    await this.gateway.save(SAVE_KEY, data);
  }

  async loadProgress(): Promise<SaveData> {
    const loaded = await this.gateway.load<SaveData>(SAVE_KEY);
    if (!loaded) {
      return { ...DEFAULT_SAVE, stars: {} };
    }
    return {
      stars: loaded.stars ?? {},
      unlockedMaxIndex: loaded.unlockedMaxIndex ?? 0,
      feathers: loaded.feathers ?? 0,
      interstitialCount: loaded.interstitialCount ?? 0,
    };
  }
}
