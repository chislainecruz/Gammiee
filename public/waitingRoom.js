import socket from "./socket";
import playerMoves from "./playerMoves";
import events from "./playerEvents";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("WaitingRoom");
    this.onEvent = this.onEvent.bind(this);
  }
  init() {
    // player parameters
    this.playerSpeed = 350;
    this.jumpSpeed = -800;
    this.start = false;
    this.gameInSession = false;
    this.ready = false;
    this.sceneSelect = "";
  }
  selectingLevel(val) {
    this.sceneSelect = val;
  }

  onEvent() {
    this.music.pause();
    this.socket.off();
    this.socket.emit("changeScenes", this.sceneSelect);
    this.scene.switch(this.sceneSelect);
  }
  playerReady() {
    this.ready = true;
    this.socket.emit("playerReady");
  }
  playerNotReady() {
    this.ready = false;
    this.socket.emit("playerNotReady");
  }

  startGame() {
    this.timedEvent = this.time.delayedCall(100, this.onEvent, [], this);
    this.start = true;
  }

  preload() {
    this.load.image("waitingBg", "./assets/waitingBG.png");
    this.load.image("tiles", "./assets/tiles.png");
    this.load.audio("waitingMusic", "./assets/TimeTemple.mp3");
    this.load.audio("jump", "./assets/jump-sfx.mp3");
    this.load.spritesheet("alien", "assets/alien.png", {
      frameWidth: 90,
      frameHeight: 120,
      margin: 1,
      spacing: 1,
    });
    this.load.spritesheet("werewolf", "assets/werewolf.png", {
      frameWidth: 162,
      frameHeight: 163,
      spacing: 1,
    });
    this.load.spritesheet("lizard", "assets/lizzyMcguire.png", {
      frameWidth: 167.5,
      frameHeight: 146,
    });
    this.load.spritesheet("mushroom", "assets/mushroom.png", {
      frameWidth: 119,
      frameHeight: 125,
      spacing: 1,
    });
    this.load.image("notReadyButton", "assets/readyButton.png");
    this.load.image("readyButton", "assets/notReadyButton.png");
    this.load.image("easybutton", "assets/easy.png");
    this.load.image("mediumbutton", "assets/medium.png");
    this.load.image("hardbutton", "assets/hard.png");
  }
  create() {
    this.socket = socket;
    this.socket.emit("WR");
    this.soundConfig = {
      volume: 0.1,
    };

    this.socket.on("selectingLevel", (val) => {
      this.selectingLevel(val);
    });
    this.jump = this.sound.add("jump");
    this.music = this.sound.add("waitingMusic");
    this.anims.create({
      key: "alienWalking",
      frames: this.anims.generateFrameNames("alien", {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "werewolfWalking",
      frames: this.anims.generateFrameNames("werewolf", {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "lizardWalking",
      frames: this.anims.generateFrameNames("lizard", {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 8,
      yoyo: true,
      repeat: -1,
    });
    this.anims.create({
      key: "mushroomWalking",
      frames: this.anims.generateFrameNames("mushroom", {
        //frames that are moving
        frames: [0, 1, 2],
      }),
      frameRate: 6,
      yoyo: true,
      repeat: -1,
    });

    const background = this.add.sprite(-800, 280, "waitingBg");
    background.setOrigin(0, 0);
    background.setScale(3.7);
    this.ground = this.add.tileSprite(1150, 2400, 23 * 4000, 1 * 60, "tiles");
    this.ground.visible = false;
    this.physics.add.existing(this.ground, true);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;
    this.cursors = this.input.keyboard.addKeys("up, down, left, right");
    events(this);
    this.socket.emit("getScene");
    this.socket.on("currentScene", (scene) => {
      this.sceneSelect = scene;
    });
    this.socket.emit("checkGameStatus");
    this.socket.on("gameInProgress", () => {
      this.gameInSession = !this.gameInSession;
    });
    this.text = this.add.text(540, 2080);
    this.text.setScale(2);
    this.timedEvent;

    this.levelText = this.add.text(600, 1850);
    this.levelText.setScale(2);

    this.readyButton = this.add
      .sprite(800, 2000, "readyButton")
      .setInteractive();
    this.readyButton.setScale(0.2);
    this.readyButton.visible = false;

    this.notReadyButton = this.add
      .sprite(800, 2000, "notReadyButton")
      .setInteractive();
    this.notReadyButton.setScale(0.2);

    // im ready
    this.notReadyButton.on("pointerdown", () => {
      if (!this.gameInSession) {
        this.notReadyButton.visible = false;
        this.readyButton.visible = true;
        this.playerReady();
      }
      //im not ready
      this.readyButton.on("pointerdown", () => {
        if (!this.gameInSession) {
          this.readyButton.visible = false;
          this.notReadyButton.visible = true;
          this.playerNotReady();
        }
      });
    });
    this.easyButton = this.add.sprite(500, 1800, "easybutton").setInteractive();
    this.easyButton.setScale(0.2);
    this.easyButton.on("pointerdown", () => {
      // this.sceneChangeValue = "Easy"
      this.sceneSelect = "Easy";
      socket.emit("selecting", this.sceneSelect);
    });

    this.mediumButton = this.add
      .sprite(800, 1800, "mediumbutton")
      .setInteractive();
    this.mediumButton.setScale(0.2);
    this.mediumButton.on("pointerdown", () => {
      // this.sceneChangeValue = "Medium"
      this.sceneSelect = "Medium";
      socket.emit("selecting", this.sceneSelect);
    });

    this.hardButton = this.add
      .sprite(1100, 1800, "hardbutton")
      .setInteractive();
    this.hardButton.setScale(0.2);
    this.hardButton.on("pointerdown", () => {
      // this.sceneChangeValue = "Hard"
      this.sceneSelect = "Hard";
      socket.emit("selecting", this.sceneSelect);
    });
  }

  update() {
    playerMoves(this);

    if (this.gameInSession) {
      this.text.setText("GAME IN SESSION");
    } else {
      this.text.setText("PRESS READY BUTTON TO START GAME");
    }

    if (this.ready && this.otherPlayers) {
      this.text.setText("Waiting for other players to hit ready...");
    }

    if (this.start) {
      this.text.setText(
        `THE GAME WILL START IN   ${
        10 -
        Math.trunc(this.timedEvent.getProgress().toString().substr(0, 4) * 10)
        }`
      );
    }
    this.levelText.setText(`LEVEL SELECTED : ${this.sceneSelect}`);
  }
}
