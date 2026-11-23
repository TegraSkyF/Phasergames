import type { PlatformGateway } from "../platform/PlatformGateway";

export class Economy {
  constructor(private readonly gateway: PlatformGateway) {}

  getFeathers(): number {
    return 0;
  }

  getStars(): number {
    return 0;
  }

  addFeathers(_amount: number, _source: string): void {}

  addStars(_amount: number, _source: string): void {}

  spendFeathers(_amount: number, _sink: string): boolean {
    return false;
  }

  spendStars(_amount: number, _sink: string): boolean {
    return false;
  }
}
