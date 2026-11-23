import type { PlatformGateway } from "../platform/PlatformGateway";

export class Save {
  constructor(private readonly gateway: PlatformGateway) {}

  async saveProgress(_data: unknown): Promise<void> {}

  async loadProgress(): Promise<unknown> {
    return null;
  }
}
