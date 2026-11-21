import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config.js";
import { GameOverScene } from "./scenes/GameOverScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { MenuScene } from "./scenes/MenuScene.js";

const parent = document.getElementById("game");

// Avoid stacked Phaser instances after Vite HMR
if (window.__snakeGame) {
  window.__snakeGame.destroy(true);
  window.__snakeGame = null;
  parent.innerHTML = "";
}

window.__snakeGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#9fd8c8",
  scene: [MenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (window.__snakeGame) {
      window.__snakeGame.destroy(true);
      window.__snakeGame = null;
    }
  });
}
