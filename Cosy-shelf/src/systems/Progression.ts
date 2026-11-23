import type { PlatformGateway } from "../platform/PlatformGateway";

export class Progression {
  constructor(private readonly gateway: PlatformGateway) {}

  getCurrentLevelId(): string {
    return "";
  }

  getStars(_levelId: string): number {
    return 0;
  }

  unlockChapter(_chapterId: string): void {}

  recordLevelComplete(_levelId: string, _stars: number): void {}
}
