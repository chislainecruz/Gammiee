import GameScene from './game'

class WaitingRoom extends Phaser.Scene {
    constructor() {
        super('waitingRoom')
    }
    preload() {
        console.log('hello')

    }
    create() {
        console.log(this)
    }
}
const waitingRoomScene = new WaitingRoom
export default waitingRoomScene