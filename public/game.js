// Linted with standardJS - https://standardjs.com/
// Initialize the Phaser Game object and set default game window size

var config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 700,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

let player;

function preload() {
  this.load.image("background", "./assets/background.png");
  this.load.spritesheet("yeti", "./assets/yeti.png", {
    frameWidth: 62,
    frameHeight: 62,
  });
  this.load.spritesheet("husky", "./assets/husky.png", {
    frameWidth: 62,
    frameHeight: 62,
  });
  this.load.spritesheet("tiles", "./assets/tiles.png", {
    frameWidth: 100,
    frameHeight: 60,
  });
}
function create() {
  let bg = this.add.sprite(0, 200, "background");
  bg.setOrigin(0, 0);
  bg.setScale(1.6);
  //creates 7 ground blocks that are the width of the block. 1 is for the height
  //the first 2 nums are the position on the screen
  let ground = this.add.tileSprite(500, 650, 7 * 100, 1 * 60, "tiles");
  // the true parameter makes the ground static
  this.physics.add.existing(ground, true);

  ground.body.allowGravity = false;
  ground.body.immovable = true;

  player = this.physics.add.sprite(200, 450, "yeti");
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 800;
  player.body.collideWorldBounds = true;

  //makes the player and ground collide
  this.physics.add.collider(ground, player);
}

function update() {}
