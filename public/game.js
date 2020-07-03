// Linted with standardJS - https://standardjs.com/

class Game extends Phaser.Game {
  constructor() {
    super(config);
    const socket = io("http://localhost:8081");
    this.globals = { socket };
  }
}
let music
let gameScene = new Phaser.Scene("Game");

var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 700,
  scene: gameScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
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
  this.load.image('background', './assets/background.png');
  this.load.image('platform', './assets/platform.png');
  this.load.image('block', './assets/block.png');
  this.load.audio('temple', './assets/TimeTemple.mp3')
  this.load.audio('jump', './assets/jump-sfx.mp3')
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
  let bg = this.add.sprite(0, 200, "background");
  bg.setOrigin(0, 0);
  bg.setScale(1.7);
  this.jump = this.sound.add('jump')
  music = this.sound.add('temple')
  let button = document.createElement('button')
  button.id = 'music'
  button.innerText = 'Turn Music on'
  button.addEventListener('click', function(){
    if (music.isPlaying){
      music.pause()
      button.innerText = 'Turn Music On'
    }
    else if (music.isPaused){
      music.resume()
      button.innerText = 'Turn Music Off'
    }
    else {
      music.play()
      button.innerText = 'Turn Music Off'
    }
  })
  document.body.appendChild(button)
  //creates 7 ground blocks that are the width of the block. 1 is for the height
  //the first 2 nums are the position on the screen
  let ground = this.add.tileSprite(610, 667, 12 * 100, 1 * 60, 'tiles');
  // the true parameter makes the ground static
  this.physics.add.existing(ground, true);

  ground.body.allowGravity = false;
  ground.body.immovable = true;

  //* Level Setup
  this.level();

  //* Player attributes
  this.player = this.physics.add.sprite(400, 450, 'alien', 1);
  this.player.body.bounce.y = 0.2;
  this.player.body.gravity.y = 800;
  this.player.body.collideWorldBounds = true;
  this.player.setScale(0.7);

  this.physics.add.collider(ground, this.player);
  this.physics.add.collider(this.platforms, this.player);

  //* Boss attributes
  this.boss = this.physics.add.sprite(1100, 15, 'balrug', 0);
  this.physics.add.collider(ground, this.boss);
  this.physics.add.collider(this.platforms, this.boss);
  this.boss.setScale(0.7);

  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on("pointerdown", function (pointer) {
    console.log(pointer.x, pointer.y);
  });

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
};

// eslint-disable-next-line complexity
gameScene.update = function () {
  let onGround =
    this.player.body.blocked.down || this.player.body.touching.down;

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
    this.jump.play()
    this.player.body.setVelocityY(this.jumpSpeed);

    // stop the walking animation
    if (this.player.anims.isPlaying) {
      this.player.anims.play("jumping");
    } else this.player.anims.play("walking");

    // change frame
    this.player.setFrame(2);
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
};
