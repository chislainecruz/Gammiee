import GameScene from "./game"
import WaitingRoom from "./waitingRoom"

const gameScene = new GameScene();
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
new Phaser.Game(config)
