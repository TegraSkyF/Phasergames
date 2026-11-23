import type { PlatformGateway } from "../platform/PlatformGateway";

export class Analytics {
  constructor(private readonly gateway: PlatformGateway) {}

  track(_event: string, _props?: Record<string, unknown>): void {}
}
