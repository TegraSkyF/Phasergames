import type { PlatformGateway } from "../platform/PlatformGateway";

export class LevelManager {
  constructor(private readonly gateway: PlatformGateway) {}

  loadPack(_packId: string): void {}

  getLevel(_levelId: string): unknown {
    return null;
  }
}
