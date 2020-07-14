import socket from "./socket";
import { createNewGame } from "./theGame";

export default class WinningScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinningScene" });
  }
  preload() {
    //re-using button but will need to be changed to "Go to Lobby"
    this.load.image("button", "assets/readyButton.png");
  }
  create() {
    this.socket = socket;
    this.socket.emit("getWinner");
    this.socket.on("winner", (playerName) => {
      this.text = this.add.text(1000, 2000, `${playerName} wins!`);
      this.text.setScale(2);

      this.lobbyButton = this.add.sprite(800, 2000, "button").setInteractive();
      this.lobbyButton.setScale(0.3);
      this.lobbyButton.on("pointerdown", () => {
        console.log(this);
        this.sys.game.destroy(true);
        document.addEventListener("mousedown", function newGame() {
          //restart or create new game
          // const game = createNewGame();

          document.removeEventListener("mousedown", newGame);
        });
      });
    });
  }
  update() {}
}
