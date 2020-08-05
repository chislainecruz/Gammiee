import GameSceneEasy from "./gameSceneEasy";
import GameSceneMedium from "./gameSceneMedium";
import GameScene from "./gameScene";
import WaitingRoom from "./waitingRoom";
import WinningScene from "./winningScene";

export const gameSceneEasy = new GameSceneEasy();
export const gameSceneMedium = new GameSceneMedium();
export const gameScene = new GameScene();
export const waitingRoom = new WaitingRoom();
export const winningScene = new WinningScene();

export const config = {
  type: Phaser.AUTO,
  width: 2300,
  height: 2500,
  scene: [waitingRoom, gameSceneEasy, gameSceneMedium, gameScene, winningScene],
  transparent: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1600 },
      // debug: true,
    },
    scale: {
      mode: Phaser.DOM.FIT,
      autoCenter: Phaser.DOM.CENTER_HORIZONTALLY,
      width: 900,
      height: 900,
    },
  },
};

let game = new Phaser.Game(config);

//start waiting room scene
game.scene.start("WaitingRoom");

export default game;
