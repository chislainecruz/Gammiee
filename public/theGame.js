import GameSceneEasy from "./gameSceneEasy";
import GameScene from "./gameScene";
import WaitingRoom from "./waitingRoom";

const gameSceneEasy = new GameSceneEasy();
const gameScene = new GameScene();
const waitingRoom = new WaitingRoom();

const config = {
  type: Phaser.AUTO,
  width: 2300,
  height: 2500,
  scene: [waitingRoom, gameSceneEasy, gameScene],
  transparent: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1600 },
      debug: false,
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

//load scenes

//start waiting room
game.scene.start("WaitingRoom");
export default game;
