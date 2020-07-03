// Linted with standardJS - https://standardjs.com/
// Initialize the Phaser Game object and set default game window size;
//Walking animation

var gameScene = new Phaser.Scene("Game");

gameScene.init = function () {
  this.levelData = {
    platforms: [
      {
        x: 50,
        y: 750,
        numTiles: 4,
        key: "tiles",
      },
      {
        x: 300,
        y: 350,
        numTiles: 6,
        key: "tiles",
      },
    ],
  };
};

gameScene.preload = function () {
  this.load.image("background", "./assets/background.png");
  this.load.spritesheet("yeti", "./assets/yeti.png", {
    frameWidth: 60,
    frameHeight: 55,
  });
  this.load.spritesheet("husky", "./assets/husky.png", {
    frameWidth: 62,
    frameHeight: 62,
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
};

gameScene.create = function () {
  let bg = this.add.sprite(0, 400, "background");
  bg.setOrigin(0, 0);
  bg.setScale(1.7);
  //creates 7 ground blocks that are the width of the block. 1 is for the height
  //the first 2 nums are the position on the screen
  let ground = this.add.tileSprite(650, 850, 12 * 50, 1 * 30, "tiles");

  // the true parameter makes the ground static
  this.physics.add.existing(ground, true);

  ground.body.allowGravity = false;
  ground.body.immovable = true;

  //add floating platforms

  this.setupLevel();
  console.log(this);

  this.player = this.physics.add.sprite(600, 790, "alien", 1);
  this.player.body.bounce.y = 0.2;
  this.player.body.gravity.y = 800;
  this.player.body.collideWorldBounds = true;

  // this shrinks the alien's size
  this.player.setScale(0.5);
  //makes the player and ground collide
  this.physics.add.collider(ground, this.player);

  this.cursors = this.input.keyboard.createCursorKeys();

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
    key: "jumping",
    frames: this.anims.generateFrameNames("alien", {
      //frames that are moving
      frames: 4,
    }),
    frameRate: 8,
    // yoyo: true,
    repeat: -1,
  });
};

gameScene.update = function () {
  let onGround =
    this.player.body.blocked.down || this.player.body.touching.down;

  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-350);

    this.player.flipX = false;

    if (!this.player.anims.isPlaying) {
      this.player.anims.play("walking");
    }
  } else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(350);
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
    this.player.body.setVelocityY(-600);

    // stop the walking animation
    if (this.player.anims.isPlaying) {
      this.player.anims.play("jumping");
    } else this.player.anims.play("walking");

    // change frame
    this.player.setFrame(2);
  }
};

gameScene.setupLevel = function () {
  for (let i = 0; i < this.levelData.platforms.length; i++) {
    let curr = this.levelData.platforms[i];
    let width = this.textures.get(curr.key).get(0).width;
    let height = this.textures.get(curr.key).get(0).height;
    let platform = this.add
      .tileSprite(curr.x, curr.y, curr.numTiles * width, height, curr.key)
      .setOrigin(0);

    //enable physics
    this.physics.add.existing(platform, true);
  }
};

var config = {
  type: Phaser.AUTO,
  width: 1300,
  height: 900,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: true,
    },
  },
  scene: gameScene,
};

let game = new Phaser.Game(config);
