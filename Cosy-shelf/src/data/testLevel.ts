export interface LevelConfig {
  id: number;
  rule: "color" | "type";
  items: Array<{ id: string; tag: string; label: string; color: number }>;
  shelves: Array<{ id: string; accepts: string; slots: number }>;
}

export const TEST_LEVEL: LevelConfig = {
  id: 1,
  rule: "color",
  items: [
    { id: "r1", tag: "red", label: "R1", color: 0xe07856 },
    { id: "r2", tag: "red", label: "R2", color: 0xe07856 },
    { id: "r3", tag: "red", label: "R3", color: 0xe07856 },
    { id: "b1", tag: "blue", label: "B1", color: 0x6b8e9f },
    { id: "b2", tag: "blue", label: "B2", color: 0x6b8e9f },
    { id: "b3", tag: "blue", label: "B3", color: 0x6b8e9f },
  ],
  shelves: [
    { id: "shelf-red", accepts: "red", slots: 3 },
    { id: "shelf-blue", accepts: "blue", slots: 3 },
  ],
};
