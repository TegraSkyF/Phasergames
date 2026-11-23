import { MockAdapter } from "./adapters/MockAdapter";
import { YandexAdapter } from "./adapters/YandexAdapter";
import type { PlatformGateway } from "./PlatformGateway";

export type { PlatformGateway };

export function createGateway(): PlatformGateway {
  const platform = import.meta.env.VITE_PLATFORM ?? "mock";

  if (platform === "yandex") {
    return new YandexAdapter();
  }

  return new MockAdapter();
}
