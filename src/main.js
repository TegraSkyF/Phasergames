import Phaser from "phaser";

const statusEl = document.getElementById("status");

function setStatus(ok, details) {
  statusEl.textContent = ok
    ? `Phaser ${Phaser.VERSION} подключён. ${details}`
    : `Ошибка подключения Phaser: ${details}`;
  statusEl.style.color = ok ? "#7dffb3" : "#ff8b8b";
}

class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x102038)
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 24, "Phaser 3", {
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "42px",
        color: "#f4f7ff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 24, `v${Phaser.VERSION} · OK`, {
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "20px",
        color: "#7dffb3",
      })
      .setOrigin(0.5);

    setStatus(true, "Сцена запущена.");
  }
}

try {
  // eslint-disable-next-line no-new
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    width: 800,
    height: 450,
    backgroundColor: "#0b1220",
    scene: [BootScene],
  });
} catch (error) {
  setStatus(false, error instanceof Error ? error.message : String(error));
  console.error(error);
}
