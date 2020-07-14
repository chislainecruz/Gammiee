import socket from './socket';
import playerMoves from './playerMoves';
import events from './playerEvents';

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super('WaitingRoom');
    this.onEvent = this.onEvent.bind(this);
  }
  init() {
    // player parameters
    this.playerSpeed = 350;
    this.jumpSpeed = -800;
    this.start = false;
    this.gameInSession = false;
    this.ready = false;
  }

  onEvent() {
    this.music.pause();
    this.socket.emit('changeScenes');
    this.socket.off();
    this.scene.switch("gameSceneMedium");
  }

  playerReady() {
    this.ready = true;
    this.socket.emit('playerReady');
  }

  startGame() {
    this.timedEvent = this.time.delayedCall(100, this.onEvent, [], this);
    this.start = true;
  }

  preload() {
    this.load.image('clouds', './assets/background.png');
    this.load.image('tiles', './assets/tiles.png');
    this.load.audio('waitingMusic', './assets/TimeTemple.mp3');
    this.load.audio('jump', './assets/jump-sfx.mp3');
    this.load.spritesheet('alien', 'assets/alien.png', {
      frameWidth: 90,
      frameHeight: 120,
      margin: 1,
      spacing: 1,
    });
    this.load.spritesheet('werewolf', 'assets/werewolf.png', {
      frameWidth: 162,
      frameHeight: 163,
      spacing: 1,
  
    });
    this.load.image('button', 'assets/readyButton.png');
  }
  create() {
    this.socket = socket;
    this.socket.emit('WR');
    this.soundConfig = {
      volume: 0.1,
    };
    this.jump = this.sound.add('jump');
    this.music = this.sound.add('waitingMusic');
    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNames('alien', {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'werewolfWalking',
      frames: this.anims.generateFrameNames('werewolf', {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 4,
      repeat: -1,
    });

    const background = this.add.sprite(-700, 800, 'clouds');
    background.setOrigin(0, 0);
    background.setScale(5);
    this.ground = this.add.tileSprite(1150, 2400, 23 * 4000, 1 * 60, 'tiles');
    this.physics.add.existing(this.ground, true);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;
    this.cursors = this.input.keyboard.addKeys('up, down, left, right')
    events(this);
    this.socket.emit('checkGameStatus');
    this.socket.on('gameInProgress', () => {
      this.gameInSession = !this.gameInSession;
    });
    this.text = this.add.text(1000, 2000);
    this.text.setScale(2);
    this.timedEvent;

    this.startButton = this.add.sprite(800, 2000, 'button').setInteractive();
    this.startButton.setScale(0.3);
    this.startButton.on('pointerdown', () => {
      if (!this.gameInSession) {
        this.playerReady();
      }
    });
  }

  update() {
    playerMoves(this);

    if (this.gameInSession) {
      this.text.setText('GAME IN SESSION');
    } else {
      this.text.setText("PRESS I'M READY TO START GAME");
    }

    if (this.ready && this.otherPlayers) {
      this.text.setText('Waiting for other players to hit ready...');
    }

    if (this.start) {
      this.text.setText(
        `THE GAME WILL START IN   ${
        10 -
        Math.trunc(this.timedEvent.getProgress().toString().substr(0, 4) * 10)
        }`
      );
    }
  }
}
