import type { PlatformGateway } from "../platform/PlatformGateway";

export class RemoteConfig {
  constructor(private readonly gateway: PlatformGateway) {}

  get<T>(_key: string, fallback: T): T {
    return fallback;
  }
}
