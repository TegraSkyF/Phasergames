export interface PlatformGateway {
  init(): Promise<void>;
  ready(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  showInterstitial(): Promise<void>;
  showRewarded(): Promise<boolean>;
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  track(event: string, props?: Record<string, unknown>): void;
  getConfig<T>(key: string, fallback: T): T;
}
