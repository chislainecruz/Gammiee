import GameScene from "./game";

class WaitingRoom extends GameScene {
  constructor() {
    super("WaitingRoom");
  }
  init() {}
  preload() {
    super.preload();
    console.log("hello");
  }
  create() {
    //super.create();
    super.create();
    console.log("hi");
  }
  update() {}
}

const gameScene = new GameScene("Game");
const waitingRoom = new WaitingRoom();

const config = {
  type: Phaser.AUTO,
  width: 2300,
  height: 2500,
  scene: [waitingRoom, gameScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1600 },
      debug: true,
    },
    scale: {
      mode: Phaser.DOM.FIT,
      autoCenter: Phaser.DOM.CENTER,
      width: 900,
      height: 1000,
    },
  },
};
let game = new Phaser.Game(config);
