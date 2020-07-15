import socket from "./socket";
import { createNewGame } from "./theGame";

export default class WinningScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinningScene" });
  }
  preload() {
    this.load.image("winningbg", "./assets/winScreen.jpg");

    this.load.image("newbutton", "assets/newGameButton.png");
  }
  create() {
    const background = this.add.sprite(-200, 0, "winningbg");
    background.setOrigin(0, 0);
    background.setScale(2);
    this.socket = socket;
    this.socket.emit("getWinner");

    this.socket.on("winner", (playerName) => {
      this.text = this.add.text(550, 500, `${playerName} wins!`);
      this.text.setScale(8);

      this.lobbyButton = this.add
        .sprite(950, 1000, "newbutton")
        .setInteractive();
      this.lobbyButton.setScale(1);
      this.lobbyButton.on("pointerdown", () => {
        location.reload(); //force refresh
        this.scene.switch("WaitingRoom");
      });
    });
  }
  update() {}
}
