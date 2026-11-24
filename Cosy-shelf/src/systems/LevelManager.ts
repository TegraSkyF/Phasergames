import pack01 from "../data/levels/pack_01.json";
import pack02 from "../data/levels/pack_02.json";
import pack03 from "../data/levels/pack_03.json";

export interface LevelItemConfig {
  id: string;
  tag: string;
  sprite: string;
}

export interface LevelShelfConfig {
  id: string;
  accepts: string;
  slots: number;
}

export interface LevelConfig {
  id: number;
  chapter: number;
  rule: "color" | "type";
  items: LevelItemConfig[];
  shelves: LevelShelfConfig[];
}

export interface LevelPack {
  version: number;
  levels: LevelConfig[];
}

export class LevelManager {
  private levels: LevelConfig[] = [];

  constructor() {
    this.registerPack(pack01 as LevelPack);
    this.registerPack(pack02 as LevelPack);
    this.registerPack(pack03 as LevelPack);
  }

  registerPack(pack: LevelPack): void {
    const loadedIds = new Set(this.levels.map((level) => level.id));

    for (const level of pack.levels) {
      if (loadedIds.has(level.id)) {
        throw new Error(`Pack invalid: level ${level.id}: duplicate id`);
      }

      for (const shelf of level.shelves) {
        if (shelf.slots < 1) {
          throw new Error(
            `Pack invalid: level ${level.id}: shelf ${shelf.id} has slots < 1`,
          );
        }
      }

      const slotSum = level.shelves.reduce((sum, shelf) => sum + shelf.slots, 0);
      if (slotSum !== level.items.length) {
        throw new Error(
          `Pack invalid: level ${level.id}: slot sum ${slotSum} !== items ${level.items.length}`,
        );
      }

      const accepted = new Set(level.shelves.map((shelf) => shelf.accepts));
      for (const item of level.items) {
        if (!accepted.has(item.tag)) {
          throw new Error(
            `Pack invalid: level ${level.id}: item ${item.id} tag "${item.tag}" has no matching shelf`,
          );
        }
      }

      loadedIds.add(level.id);
      this.levels.push(level);
    }
  }

  getLevel(index: number): LevelConfig | null {
    if (index < 0 || index >= this.levels.length) {
      return null;
    }
    return this.levels[index];
  }

  getTotalLevels(): number {
    return this.levels.length;
  }
}
