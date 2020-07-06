// Linted with standardJS - https://standardjs.com/
import io from "socket.io-client";

class Game extends Phaser.Game {
  constructor() {
    super(config);
    //const socket = io("http://localhost:8082");
    //this.globals = { socket };
  }
}
let music;
let gameScene = new Phaser.Scene("Game");

var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  scene: gameScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1600 },
      debug: true,
    },
  },
};

var game = new Game(config);


gameScene.init = function () {
  // player parameters
  this.playerSpeed = 350;
  this.jumpSpeed = -800;

};

gameScene.preload = function () {

  this.load.image("background", "./assets/background.png");
  this.load.image("platform", "./assets/platform.png");
  this.load.image("block", "./assets/block.png");

  this.load.spritesheet("fire", "./assets/fire.png", {
    frameWidth: 64,
    frameHeight: 64,
  });


  this.load.spritesheet("yeti", "./assets/yeti.png", {
    frameWidth: 60,
    frameHeight: 55,
  });



  this.load.spritesheet('balrug', './assets/balrog.png', {

    frameWidth: 190,
    frameHeight: 190,
    margin: 1,
    spacing: 1,
  });

  this.load.spritesheet("tiles", "./assets/tiles.png", {
    frameWidth: 100,
    frameHeight: 60,
  });

  this.load.spritesheet("alien", "assets/Alien.png", {
    frameWidth: 90,
    frameHeight: 120,
    margin: 1,
    spacing: 1,
  });


  this.load.json("levelData", "json/levelData.json");

};

gameScene.create = function () {
  let self = this;
  this.socket = io("http://localhost:8082");
  this.otherPlayers = this.physics.add.group();
  let bg = this.add.sprite(-700, 100, "background");
  bg.setOrigin(0, 0);

  bg.setScale(3.6);
  //creates 7 ground blocks that are the width of the block. 1 is for the height
  //the first 2 nums are the position on the screen
  this.ground = this.add.tileSprite(600, 667, 400, 30, "tiles");

  // the true parameter makes the ground static
  this.physics.add.existing(this.ground, true);

  this.ground.body.allowGravity = false;
  this.ground.body.immovable = true;
  this.anims.create({
    key: "walking",
    frames: this.anims.generateFrameNames("alien", {
      //frames that are moving
      frames: [0, 1, 2, 3],
    }),
    frameRate: 8,
    // yoyo: true,
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

  //* Player attributes

  this.socket.on("currentPlayers", (players) => {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on("newPlayer", (playerInfo) => {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on("disconnect", (playerId) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on("playerMoved", (playerInfo) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.flipX = playerInfo.flipX;
      }
    });
  });

  //* Boss attributes
  this.boss = this.physics.add.sprite(1100, 15, "balrug", 0);
  this.physics.add.collider(this.ground, this.boss);
  this.physics.add.collider(this.platforms, this.boss);
  this.boss.setScale(0.7);

  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on("pointerdown", function (pointer) {
    console.log(pointer.x, pointer.y);
  });

};

// eslint-disable-next-line complexity
gameScene.update = function () {

  if (this.player) {
    let x = this.player.x;
    let y = this.player.y;
    let flipX = this.player.flipX;

    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x ||
        y !== this.player.oldPosition.y ||
        flipX !== this.player.oldPosition.flipX)
    ) {
      this.socket.emit("playerMovement", {
        x: this.player.x,
        y: this.player.y,
        flipX: this.player.flipX,
      });
    }



    this.player.oldPosition = {
      x: this.player.x,
      y: this.player.y,
      flipX: this.player.flipX,
    };
    let onGround =
      this.player.body.blocked.down || this.player.body.touching.down;

    //respawn when falling
    if (this.player.body.position.y > 600) {
      this.player.x = 600;
      this.player.y = 500;

    if (!this.player.anims.isPlaying) {
      this.player.anims.play("walking");

    }


    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-this.playerSpeed);

      this.player.flipX = false;

      if (!this.player.anims.isPlaying) {
        this.player.anims.play("walking");
      }
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(this.playerSpeed);
      this.player.flipX = true;

      if (!this.player.anims.isPlaying) {
        this.player.anims.play("walking");
      }
    } else {
      this.player.body.setVelocityX(0);
      this.player.anims.stop("walking");
      //default pose
      this.player.setFrame(1);
    }
    // handle jumping
    if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
      // give the player a velocity in Y
      this.player.body.setVelocityY(this.jumpSpeed);

      // stop the walking animation
      if (this.player.anims.isPlaying) {
        this.player.anims.play("jumping");
      } else this.player.anims.play("walking");



      // change frame
      this.player.setFrame(2);
    }
  }
};

// sets up all the elements in the level
gameScene.level = function () {
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
  this.fires = this.add.group();
  for (let i = 0; i < this.levelData.fires.length; i++) {
    let curr = this.levelData.fires[i];


    let newObj = this.add.sprite(curr.x, curr.y, "fire").setOrigin(0);


    //   // enable physics
    this.physics.add.existing(newObj);
    newObj.body.allowGravity = false;
    newObj.body.immovable = true;

    //   // play burning animation


    newObj.anims.play("burning");



    //   // add to the group
    this.fires.add(newObj);

    // this is for level creation
    newObj.setInteractive();
    this.input.setDraggable(newObj);
  }
};

function addPlayer(self, playerInfo) {
  self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, "alien", 1);
  self.physics.add.collider(self.ground, self.player);
  self.physics.add.collider(self.platforms, self.player);
  self.player.body.bounce.y = 0.2;
  self.player.body.gravity.y = 800;
  self.player.body.collideWorldBounds = true;
  self.player.setScale(0.7);
  // self.socket.emit("newPlayer", self.player);

  self.cameras.main.startFollow(self.player);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(
    playerInfo.x,
    playerInfo.y,
    "alien",
    1
  );
  otherPlayer.flipX = playerInfo.flipX;

  self.physics.add.collider(self.ground, otherPlayer);
  self.physics.add.collider(self.platforms, otherPlayer);
  otherPlayer.body.bounce.y = 0.2;
  otherPlayer.body.gravity.y = 800;
  otherPlayer.body.collideWorldBounds = true;
  otherPlayer.setScale(0.7);

  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
