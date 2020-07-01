// Linted with standardJS - https://standardjs.com/
// Initialize the Phaser Game object and set default game window size

var config = {
  type: Phaser.AUTO,
  width: 400,
  height: 300,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

// const game = new Phaser.Game(800, 600, Phaser.AUTO, "", {
//   preload: preload,
//   create: create,
//   update: update,
// });

let player;

function preload() {
  // game.load.image("sky", "./assets/sky.png");
  this.load.image("sky", "assets/sky.png");
  this.load.spritesheet("kirby", "./assets/kirby.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
  // game.load.spritesheet("dude", "./assets/dude.png", 32, 32);
}
function create() {
  // this.physics.startSystem(Phaser.Physics.ARCADE);
  this.add.image(0, 0, "sky");
  player = this.physics.add.sprite(100, 450, "kirby");
  // game.physics.arcade.enable(player);
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 800;
  player.body.collideWorldBounds = true;
}

function update() {}
