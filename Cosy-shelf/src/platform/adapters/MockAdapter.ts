import config from "../../data/config.json";
import type { PlatformGateway } from "../PlatformGateway";

const AD_DELAY_MS = 1500;

type ConfigMap = Record<string, unknown>;

export class MockAdapter implements PlatformGateway {
  private readonly config: ConfigMap = config as ConfigMap;

  async init(): Promise<void> {
    console.log("[MockAdapter] init");
  }

  ready(): void {
    console.log("[MockAdapter] ready");
  }

  gameplayStart(): void {
    console.log("[MockAdapter] gameplayStart");
  }

  gameplayStop(): void {
    console.log("[MockAdapter] gameplayStop");
  }

  async showInterstitial(): Promise<void> {
    console.log("MOCK AD: interstitial");
    await delay(AD_DELAY_MS);
    console.log("MOCK AD: interstitial closed");
  }

  async showRewarded(): Promise<boolean> {
    console.log("MOCK AD: rewarded");
    await delay(AD_DELAY_MS);
    console.log("MOCK AD: rewarded completed, reward granted");
    return true;
  }

  async save<T>(key: string, data: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
    console.log("[MockAdapter] save", key);
  }

  async load<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key);
    console.log("[MockAdapter] load", key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  }

  track(event: string, props?: Record<string, unknown>): void {
    console.log("[MockAdapter] track", event, props ?? {});
  }

  getConfig<T>(key: string, fallback: T): T {
    if (Object.prototype.hasOwnProperty.call(this.config, key)) {
      return this.config[key] as T;
    }
    return fallback;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
