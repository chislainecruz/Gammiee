import GameSceneEasy from "./gameSceneEasy";
import GameSceneMedium from "./gameSceneMedium"
import GameScene from "./gameScene";
import WaitingRoom from "./waitingRoom";

export const gameSceneEasy = new GameSceneEasy();
export const gameSceneMedium = new GameSceneMedium();
export const gameScene = new GameScene();
export const waitingRoom = new WaitingRoom();

const config = {
  type: Phaser.AUTO,
  width: 2300,
  height: 2500,
  scene: [waitingRoom, gameSceneEasy, gameSceneMedium, gameScene],
  transparent: true,
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

//load scenes

//start waiting room
game.scene.start("WaitingRoom");
export default game;
