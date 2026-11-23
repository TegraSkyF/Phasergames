import type { PlatformGateway } from "../platform/PlatformGateway";

export interface SaveData {
  stars: Record<string, number>;
  unlockedMaxIndex: number;
}

const SAVE_KEY = "cosy-shelf-progress";

const EMPTY: SaveData = {
  stars: {},
  unlockedMaxIndex: 0,
};

export class Save {
  constructor(private readonly gateway: PlatformGateway) {}

  async saveProgress(data: SaveData): Promise<void> {
    await this.gateway.save(SAVE_KEY, data);
  }

  async loadProgress(): Promise<SaveData> {
    const loaded = await this.gateway.load<SaveData>(SAVE_KEY);
    if (!loaded) {
      return { ...EMPTY, stars: {} };
    }
    return {
      stars: loaded.stars ?? {},
      unlockedMaxIndex: loaded.unlockedMaxIndex ?? 0,
    };
  }
}
