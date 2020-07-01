// Initialize the Phaser Game object and set default game window size

const game = new Phaser.Game(800, 600, Phaser.AUTO, "", {
  preload: preload,
  create: create,
  update: update,
});
