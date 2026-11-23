import type { PlatformGateway } from "../PlatformGateway";

export class YandexAdapter implements PlatformGateway {
  async init(): Promise<void> {
    // TODO: connect YaGames SDK in iteration 7
  }

  ready(): void {
    // TODO: connect YaGames SDK in iteration 7
  }

  gameplayStart(): void {
    // TODO: connect YaGames SDK in iteration 7
  }

  gameplayStop(): void {
    // TODO: connect YaGames SDK in iteration 7
  }

  async showInterstitial(): Promise<void> {
    // TODO: connect YaGames SDK in iteration 7
  }

  async showRewarded(): Promise<boolean> {
    // TODO: connect YaGames SDK in iteration 7
    return false;
  }

  async save<T>(_key: string, _data: T): Promise<void> {
    // TODO: connect YaGames SDK in iteration 7
  }

  async load<T>(_key: string): Promise<T | null> {
    // TODO: connect YaGames SDK in iteration 7
    return null;
  }

  track(_event: string, _props?: Record<string, unknown>): void {
    // TODO: connect YaGames SDK in iteration 7
  }

  getConfig<T>(_key: string, fallback: T): T {
    // TODO: connect YaGames SDK in iteration 7
    return fallback;
  }
}
