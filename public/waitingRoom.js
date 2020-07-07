import GameScene, {gamescene} from './game'

class WaitingRoom extends GameScene{
    constructor(){
        super('waitingRoom')
    }
    preload(){

    }
    create(){
        console.log(this)
    }
}
const waitingRoomScene = new WaitingRoom
export default waitingRoomScene