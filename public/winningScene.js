import socket from "./socket";

export default class WinningScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinningScene" });
  }
  preload() {
    console.log("loading WS...");
  }
  create() {
    this.socket = socket;
    this.socket.emit("getWinner");
    this.socket.on("winner", (playerName) => {
      console.log("got winners name, ", playerName);
      this.text = this.add.text(1000, 2000, `${playerName} wins!`);
      this.text.setScale(2);
    });
    console.log("creating WS...");
  }
  update() {}
}
