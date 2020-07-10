// Linted with standardJS - https://standardjs.com/
import events from "./playerEvents";
import playerMoves from "./playerMoves";
import socket from "./socket";

let ui_camera;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "gameScene" });
  }
  init() {
    // player parameters
    this.playerSpeed = 350;
    this.jumpSpeed = -800;
  }

  preload() {
    this.load.audio("music", "./assets/battleMusic.mp3");
    this.load.audio("jump", "./assets/jump-sfx.mp3");
    this.load.image("background", "./assets/testback.png");
    this.load.image("platform", "./assets/platform.png");
    this.load.image("block", "./assets/block.png");

    this.load.spritesheet("gameOver", "./assets/gameOver.png", {
      frameWidth: 300,
      frameHeight: 3001,
    });

    this.load.spritesheet("bossAttack", "./assets/bossAttack.png", {
      frameWidth: 110,
      frameHeight: 130,
    });

    this.load.spritesheet("flame", "./assets/flame.png", {
      frameWidth: 75,
      frameHeight: 50,
      margin: 1,
    });

    this.load.spritesheet("fire", "./assets/fire.png", {
      frameWidth: 64,
      frameHeight: 64,
      margin: 1,
    });

    this.load.spritesheet("goal", "./assets/levelBoss.png", {
      frameWidth: 180,
      frameHeight: 207,
    });

    this.load.spritesheet("minion", "./assets/babyBalrog.png", {
      frameWidth: 94.1,
      frameHeight: 95.1,
    });

    this.load.spritesheet("tiles", "./assets/tiles.png", {
      frameWidth: 100,
      frameHeight: 60,
    });

    this.load.spritesheet("alien", "assets/alien.png", {
      frameWidth: 90,
      frameHeight: 120,
      margin: 1,
      spacing: 1,
    });

    this.load.json("levelData", "json/levelData.json");
  }
  endGame() {
    this.gameOverSprite.depth = 100;
    this.gameOverSprite.visible = true;
    this.cameras.add().setScroll(0, 10);
  }

  winGame(sourceSprite, targetSprite) {
    this.socket.emit("playerWins");
    this.endGame();
  }
  create() {
    this.socket = socket;
    let ourMusic = this.sound.add("music");
    this.socket.emit("hello");
    let self = this;
    this.otherPlayers = this.physics.add.group();
    let bg = this.add.sprite(-600, 0, "background");
    bg.setOrigin(0, 0);
    bg.setScale(5);
    this.jump = this.sound.add("jump");
    //creates ground blocks

    //the first 2 nums are the position on the screen

    this.ground = this.add.tileSprite(1100, 2400, 400, 30, "tiles");
    // the true parameter makes the ground static
    this.physics.add.existing(this.ground, true);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;
    this.gameOverSprite = this.add.sprite(1150, 1250, "gameOver");
    this.gameOverSprite.immovable = true;
    this.gameOverSprite.setScale(5);
    this.gameOverSprite.visible = false;

    this.anims.create({
      key: "burning",
      frames: this.anims.generateFrameNames("fire", {
        start: 0,
        end: 60,
      }),
      frameRate: 30,
      repeat: -1,
    });

    this.anims.create({
      key: "floating",
      frames: this.anims.generateFrameNames("minion", {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "flaming",
      frames: this.anims.generateFrameNames("flame", {
        frames: [0, 1, 2],
      }),
      frameRate: 30,
      repeat: -1,
    });

    this.anims.create({
      key: "boss",
      frames: this.anims.generateFrameNames("goal", {
        frames: [0, 1, 2, 2, 3, 3],
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "bossAttacking",
      frames: this.anims.generateFrameNames("bossAttack", {
        frames: [0, 1, 2, 3, 4],
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.on("pointerdown", function (pointer) {
      console.log(pointer.x, pointer.y);
    });

    this.socket.on("endGame", () => {
      this.endGame();
    });

    this.anims.create({
      key: "walking",
      frames: this.anims.generateFrameNames("alien", {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "burning",
      frames: this.anims.generateFrameNames("fire", { start: 0, end: 59 }),
      frameRate: 120,
      repeat: -1,
    });
    //* Level Setup
    this.level();
    this.bossAttack();
    this.minionAttack();

    //* Player attributes
    events(this);
  }

  // eslint-disable-next-line complexity
  update() {
    playerMoves(this);
  }

  // this runs when player gets hit by object
  restartGame(sourceSprite, targetSprite) {
    // fade out
    this.player.x = 1100;
    this.player.y = 2300;
  }

  // boss attack
  bossAttack() {
    this.flames = this.physics.add.group({
      bounceY: 0.1,
      bounceX: 1,
      collideWorldBounds: true,
    });
    let spawnEvent = this.time.addEvent({
      delay: this.levelData.spawner.interval,
      loop: true,
      callbackScope: this,
      callback: function () {
        let flame = this.flames.create(this.goal.x, this.goal.y, "bossAttack");

        flame.anims.play("bossAttacking");

        flame.setVelocityX(-this.levelData.spawner.speed);

        this.time.addEvent({
          delay: this.levelData.spawner.lifespan,
          repeat: 0,
          callbackScope: this,
          callback: function () {
            flame.destroy();
          },
        });
      },
    });
  }

  //minion attack
  minionAttack() {
    for (let i = 0; i < this.levelData.minions.length; i++) {
      let curr = this.levelData.minions[i];
      this.flames = this.physics.add.group({
        bounceY: 0.1,
        bounceX: 1,
        collideWorldBounds: true,
      });
      let spawnEvent = this.time.addEvent({
        delay: curr.interval,
        loop: true,
        callbackScope: this,
        callback: function () {
          let flame = this.flames
            .create(curr.x, curr.y, "flame")
            .setSize(35, 35);

          flame.anims.play("flaming");

          if (curr.flipX === true) {
            flame.flipX = true;
          }
          flame.setVelocityX(curr.speed);

          this.time.addEvent({
            delay: curr.lifespan,
            repeat: 0,
            callbackScope: this,
            callback: function () {
              flame.destroy();
            },
          });
        },
      });
    }
  }

  // sets up all the elements in the level
  level() {
    this.platforms = this.add.group();

    // parse json data
    this.levelData = this.cache.json.get("levelData");

    // create all the platforms
    for (let i = 0; i < this.levelData.platforms.length; i++) {
      let platform = this.levelData.platforms[i];

      let newObj;

      // create object
      if (platform.numTiles == 1) {
        // create sprite
        newObj = this.add
          .sprite(platform.x, platform.y, platform.key)
          .setOrigin(0);
      } else {
        // create tilesprite
        let width = this.textures.get(platform.key).get(0).width;
        let height = this.textures.get(platform.key).get(0).height;
        newObj = this.add
          .tileSprite(
            platform.x,
            platform.y,
            platform.numTiles * width,
            height,
            platform.key
          )
          .setOrigin(0);
      }

      // enable physics
      this.physics.add.existing(newObj, true);

      // add to the group
      this.platforms.add(newObj);
    }
    // create all the fire
    this.fires = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // create all minions
    this.minions = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // create goal/boss
    this.goal = this.add.sprite(
      this.levelData.goal.x,
      this.levelData.goal.y,
      "goal"
    );
    this.goal.anims.play("boss");

    this.physics.add.existing(this.goal);

    // create minions
    for (let i = 0; i < this.levelData.minions.length; i++) {
      let curr = this.levelData.minions[i];
      let newObj = this.minions.create(curr.x, curr.y, "minion").setOrigin(0);
      if (curr.flipX === true) {
        newObj.flipX = true;
      }

      newObj.anims.play("floating");

      this.minions.add(newObj);
    }

    for (let i = 0; i < this.levelData.fires.length; i++) {
      let curr = this.levelData.fires[i];

      let newObj = this.fires
        .create(curr.x, curr.y, "fire")
        .setOrigin(0)
        .setSize(30, 30);

      //   // play burning animation
      newObj.anims.play("burning");

      //   // add to the group
      this.fires.add(newObj);
    }
  }
}
