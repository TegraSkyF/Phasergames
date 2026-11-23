import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { GameScene } from "./scenes/GameScene";
import { HUDScene } from "./scenes/HUDScene";
import { MenuScene } from "./scenes/MenuScene";
import { PreloadScene } from "./scenes/PreloadScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 720,
  height: 1280,
  backgroundColor: "#2b241c",
  scene: [BootScene, PreloadScene, MenuScene, GameScene, HUDScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
