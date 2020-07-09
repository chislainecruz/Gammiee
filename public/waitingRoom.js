import socket from "./socket";
import playerMoves from "./playerMoves";
import events from "./playerEvents";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("WaitingRoom");
  }
  init() {
    // player parameters
    this.playerSpeed = 350;
    this.jumpSpeed = -800;
  }
  preload() {
    this.load.image("clouds", "./assets/background.png");
    this.load.image("tiles", "./assets/tiles.png");
    this.load.spritesheet("alien", "assets/alien.png", {
      frameWidth: 90,
      frameHeight: 120,
      margin: 1,
      spacing: 1,
    });
  }
  create() {
    this.socket = socket;
    //this.socket.emit("hello");
    this.anims.create({
      key: "walking",
      frames: this.anims.generateFrameNames("alien", {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 8,
      repeat: -1,
    });

    const background = this.add.sprite(0, 300, "clouds");
    background.setOrigin(0, 0);
    background.setScale(3);
    this.ground = this.add.tileSprite(1150, 1250, 23 * 100, 1 * 60, "tiles");
    this.physics.add.existing(this.ground, true);

    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;

    //this.physics.add.collider(this.player, this.ground);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.once(
      "pointerdown",
      (event) => {
        this.scene.switch("gameScene");
      },
      this
    );

    events(this);
  }

  update() {
    playerMoves(this);
  }
}
