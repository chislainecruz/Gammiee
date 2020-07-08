import GameScene from './game'

class WaitingRoom extends GameScene {
    constructor() {
        super('WaitingRoom');
    }
    init() {

    }
    preload() {
    }
    create() {
        super.create()

    }
    update() {

    }
}

const gamescene = new GameScene
const waitingRoom = new WaitingRoom

var config = {
    type: Phaser.AUTO,
    width: 2300,
    height: 2500,
    scene: [waitingRoom, gamescene],
    physics: {
        default: 'arcade',
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
var game = new Phaser.Game(config);

