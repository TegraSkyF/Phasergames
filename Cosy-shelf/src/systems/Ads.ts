import type { PlatformGateway } from "../platform/PlatformGateway";

export class Ads {
  constructor(private readonly gateway: PlatformGateway) {}

  async showInterstitial(_placement: string): Promise<void> {}

  async showRewarded(_placement: string): Promise<boolean> {
    return false;
  }
}
