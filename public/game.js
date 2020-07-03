// Linted with standardJS - https://standardjs.com/
// Initialize the Phaser Game object and set default game window size;
//Walking animation
let gameScene = new Phaser.Scene('Game');

var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 700,
  scene: gameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: true,
    },
  },
};

var game = new Phaser.Game(config);

gameScene.init = function () {
  // player parameters
  this.playerSpeed = 150;
  this.jumpSpeed = -600;
};

gameScene.preload = function () {
  this.load.image('background', './assets/background.png');
  this.load.image('platform', './assets/platform.png');

  this.load.spritesheet('yeti', './assets/yeti.png', {
    frameWidth: 60,
    frameHeight: 55,
  });

  this.load.spritesheet('husky', './assets/husky.png', {
    frameWidth: 62,
    frameHeight: 62,
  });

  this.load.spritesheet('tiles', './assets/tiles.png', {
    frameWidth: 100,
    frameHeight: 60,
  });

  this.load.spritesheet('alien', 'assets/Alien.png', {
    frameWidth: 90,
    frameHeight: 120,
    margin: 1,
    spacing: 1,
  });

  this.load.json('levelData', 'json/levelData.json');
};

gameScene.create = function () {
  let bg = this.add.sprite(0, 200, 'background');
  bg.setOrigin(0, 0);
  bg.setScale(1.6);
  //creates 7 ground blocks that are the width of the block. 1 is for the height
  //the first 2 nums are the position on the screen
  let ground = this.add.tileSprite(500, 650, 12 * 100, 1 * 60, 'tiles');
  // the true parameter makes the ground static
  this.physics.add.existing(ground, true);

  ground.body.allowGravity = false;
  ground.body.immovable = true;

  this.level();

  this.player = this.physics.add.sprite(200, 450, 'alien', 1);
  this.player.body.bounce.y = 0.2;
  this.player.body.gravity.y = 800;
  this.player.body.collideWorldBounds = true;

  //makes the player and ground collide
  this.physics.add.collider(ground, this.player);

  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', function (pointer) {
    console.log(pointer.x, pointer.y);
  });

  this.anims.create({
    key: 'walking',
    frames: this.anims.generateFrameNames('alien', {
      //frames that are moving
      frames: [0, 1, 2, 3],
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
    this.player.body.setVelocityX(-this.playerSpeed);

    this.player.flipX = false;

    if (!this.player.anims.isPlaying) {
      this.player.anims.play('walking');
    }
  } else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);
    this.player.flipX = true;

    if (!this.player.anims.isPlaying) {
      this.player.anims.play('walking');
    }
  } else {
    this.player.body.setVelocityX(0);
    this.player.anims.stop('walking');
    //default pose
    this.player.setFrame(1);
  }
  // handle jumping
  if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);

    // stop the walking animation
    this.player.anims.stop('walking');

    // change frame
    this.player.setFrame(2);
  }
};

// sets up all the elements in the level
gameScene.level = function () {
  this.platforms = this.add.group();

  // parse json data
  this.levelData = this.cache.json.get('levelData');

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
};
