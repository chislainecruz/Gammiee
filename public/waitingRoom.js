import socket from './socket';
import playerMoves from './playerMoves';
import events from './playerEvents';

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super('WaitingRoom');
  }
  init() {
    // player parameters
    this.playerSpeed = 350;
    this.jumpSpeed = -800;
    this.start = false;
  }

  onEvent() {
    this.scene.switch('gameScene');
  }

  playerReady() {
    if (this.otherPlayers) {
      this.text.setText('Waiting for other players to hit ready...');
    }
    this.socket.emit('playerReady');
  }

  startGame() {
    this.timedEvent = this.time.delayedCall(10000, this.onEvent, [], this);
    this.start = true;
  }

  preload() {
    this.load.image('clouds', './assets/background.png');
    this.load.image('tiles', './assets/tiles.png');
    this.load.audio('jump', './assets/jump-sfx.mp3');
    this.load.spritesheet('alien', 'assets/alien.png', {
      frameWidth: 90,
      frameHeight: 120,
      margin: 1,
      spacing: 1,
    });
    this.load.image('button', 'assets/readyButton.png');
    this.load.html('nameform', './nameform.html');
  }
  create() {
    this.socket = socket;
    this.socket.emit('hello');
    this.jump = this.sound.add('jump');
    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNames('alien', {
        //frames that are moving
        frames: [0, 1, 2, 3],
      }),
      frameRate: 8,
      repeat: -1,
    });

    const background = this.add.sprite(-700, 800, 'clouds');
    background.setOrigin(0, 0);
    background.setScale(5);
    this.ground = this.add.tileSprite(1150, 2400, 23 * 4000, 1 * 60, 'tiles');
    this.physics.add.existing(this.ground, true);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;
    this.cursors = this.input.keyboard.createCursorKeys();

    events(this);

    this.startButton = this.add.sprite(800, 2000, 'button').setInteractive();
    this.startButton.setScale(0.3);
    this.startButton.on('pointerdown', () => {
      this.playerReady();
    });

    this.text = this.add.text(1000, 2000, "PRESS I'M READY TO START GAME");
    this.text.setScale(2);
    this.timedEvent;

    const namePrompt = this.add.text(1300, 1750, 'Please enter your name', {
      color: 'white',
      fontSize: '30px ',
    });
    const element = this.add.dom(namePrompt.x, 0).createFromCache('nameform');

    console.log('WaitingRoom -> create -> element', element);
    const inputText = document.getElementsByName('lname');
    console.log('WaitingRoom -> create -> inputText', inputText);

    element.addListener('click');

    element.on('click', function (event) {
      if (event.target.name === 'playButton') {
        var inputText = this.getChildByName('nameField');

        //  Have they entered anything?
        if (inputText.value !== '') {
          //  Turn off the click events
          this.removeListener('click');

          //  Hide the login element
          this.setVisible(false);

          //  Populate the text with whatever they typed in
          text.setText('Welcome ' + inputText.value);
        } else {
          //  Flash the prompt
          this.scene.tweens.add({
            targets: namePrompt,
            alpha: 0.2,
            duration: 250,
            ease: 'Power3',
            yoyo: true,
          });
        }
      }
    });

    const input = this.tweens.add({
      targets: element,
      y: namePrompt.y - 120,
      x: namePrompt.x,
      duration: 1000,
      ease: 'Linear',
    });
    console.log('WaitingRoom -> create -> tween', input);
    element.setScale(1);
  }

  update() {
    playerMoves(this);

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
