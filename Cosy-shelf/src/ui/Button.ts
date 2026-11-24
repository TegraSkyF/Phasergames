import Phaser from "phaser";

function toCssColor(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

export class Button extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    bgColor: number,
    textColor: number,
    onClick: () => void,
  ) {
    super(scene, x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.lineStyle(3, 0x5a4632, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);

    const label = scene.add
      .text(0, 0, text, {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        fontStyle: "bold",
        color: toCssColor(textColor),
      })
      .setOrigin(0.5);

    this.add([bg, label]);
    this.setSize(width, height);
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.on("pointerover", () => {
      this.setScale(1.05);
      scene.input.setDefaultCursor("pointer");
    });
    this.on("pointerout", () => {
      this.setScale(1);
      scene.input.setDefaultCursor("default");
    });
    this.on("pointerdown", () => {
      this.setScale(0.95);
    });
    this.on("pointerup", () => {
      this.setScale(1);
      onClick();
    });

    scene.add.existing(this);
  }
}
