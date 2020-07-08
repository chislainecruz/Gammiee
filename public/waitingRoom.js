import GameScene from "./game";

class WaitingRoom extends GameScene {
  constructor() {
    super("WaitingRoom");
  }
  init() {
    this.playerSpeed = 350;
    this.jumpSpeed = -800;
  }
  preload() {
    this.load.image('clouds', './assets/background.png');
    this.load.image('tiles', './assets/tiles.png')
    this.load.spritesheet('alien', 'assets/Alien.png', {
        frameWidth: 90,
        frameHeight: 120,
        margin: 1,
        spacing: 1,
      });
  }
  create() {
    
    //super.create();
    let background = this.add.sprite(0, 300, 'clouds')
    background.setOrigin(0, 0)
    background.setScale(3)
    // this.add.sprite(600, 600, 'tiles')
    let ground = this.add.tileSprite(1150, 1250, 23 * 100, 1 * 60, 'tiles')
    this.physics.add.existing(ground, true);

    ground.body.allowGravity = false;
    ground.body.immovable = true;
    this.player = this.physics.add.sprite(600, 600, 'alien')
    console.log('this is the player', this.player)
    this.physics.add.collider(this.player, ground)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.waitingMovement = this.movement.bind(this)
    // console.log('x', this.player)
    this.input.once('pointerdown', function (event) {
        
      console.log('From SceneB to SceneC');
      console.log(this.scene)
      
      this.scene.start('Game');

  }, this);
    
  }
  
  update() {
    
  }
}

const gameScene = new GameScene("Game");
const waitingRoom = new WaitingRoom();

const config = {
  type: Phaser.AUTO,
  width: 2300,
  height: 2500,
  scene: [gameScene, waitingRoom],
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
