// Linted with standardJS - https://standardjs.com/
// Initialize the Phaser Game object and set default game window size;
//Walking animation
let gameScene = new Phaser.Scene('Game');

var config = {
  type: Phaser.AUTO,
  width: 2300,
  height: 2500,
  scene: gameScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1600 },
      // debug: true,
    },
    scale: {
      mode: Phaser.DOM.FIT,
      autoCenter: Phaser.DOM.CENTER,
      width: 900,
      height: 1000
    }
  },
};

var game = new Phaser.Game(config);


gameScene.init = function () {
  // player parameters
  this.playerSpeed = 350;
  this.jumpSpeed = -800;

};

gameScene.preload = function () {
  this.load.image('background', './assets/testback.png');
  this.load.image('platform', './assets/platform.png');
  this.load.image('block', './assets/block.png');

  this.load.spritesheet('bossAttack', './assets/bossAttack.png', {
    frameWidth: 110,
    frameHeight: 130
  })


  this.load.spritesheet('flame', './assets/flame.png', {
    frameWidth: 75,
    frameHeight: 50,
    margin: 1,
  })

  this.load.spritesheet('fire', './assets/fire.png', {
    frameWidth: 64,
    frameHeight: 64,
    margin: 1,

  })


  this.load.spritesheet('yeti', './assets/yeti.png', {
    frameWidth: 60,
    frameHeight: 55,
  });

  this.load.spritesheet('goal', './assets/balrog.png', {
    frameWidth: 200,
    frameHeight: 180,
  });

  this.load.spritesheet('minion', './assets/babyBalrog.png', {
    frameWidth: 94.1,
    frameHeight: 95.1,
  });

  this.load.spritesheet('tiles', './assets/tiles.png', {
    frameWidth: 100,
    frameHeight: 60,
  });

  this.load.spritesheet('alien', 'assets/Alien.png', {
    frameWidth: 90,
    frameHeight: 120,
    margin: 1,
    spacing: 1,
  });



  this.load.json('levelData', 'json/levelData.json');
};

gameScene.create = function () {
  let bg = this.add.sprite(-600, 0, 'background');
  bg.setOrigin(0, 0);
  bg.setScale(5);

  //creates 7 ground blocks that are the width of the block. 1 is for the height
  //the first 2 nums are the position on the screen
  let ground = this.add.tileSprite(1100, 2400, 400, 30, 'tiles');
  // the true parameter makes the ground static
  this.physics.add.existing(ground, true);

  ground.body.allowGravity = false;
  ground.body.immovable = true;

  this.anims.create({
    key: 'burning',
    frames: this.anims.generateFrameNames('fire', {
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
    }),
    frameRate: 10,
    repeat: -1
  });


  this.anims.create({
    key: 'floating',
    frames: this.anims.generateFrameNames('minion', {
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'flaming',
    frames: this.anims.generateFrameNames('flame', {
      frames: [0, 1, 2]
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'boss',
    frames: this.anims.generateFrameNames('goal', {
      frames: [0, 1, 2, 3, 3, 3, 3, 3, 3]
    }),
    frameRate: 8,
    repeat: -1
  });

  this.anims.create({
    key: 'bossAttacking',
    frames: this.anims.generateFrameNames('bossAttack', {
      frames: [0, 1, 2]
    }),
    frameRate: 10,
    repeat: -1
  });

  //* Level Setup
  this.level();

  this.bossAttack()

  this.minionAttack()

  //* Player attributes
  this.player = this.physics.add.sprite(1100, 600, 'alien', 1);
  this.player.body.bounce.y = 0.2;
  this.player.body.gravity.y = 800;
  this.player.body.collideWorldBounds = true;
  this.player.setScale(0.7);
  this.player.setSize(80, 110)


  // collision detection
  this.physics.add.collider(ground, [this.player, this.goal, this.minion]);
  this.physics.add.collider([this.player, this.goal, this.flames, this.minion], this.platforms);

  //overlaps
  this.physics.add.overlap(this.player, [this.fires, this.flames], this.restartGame, null, this);

  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', function (pointer) {
    console.log(pointer.x, pointer.y);
  });

  this.anims.create({
    key: "walking",
    frames: this.anims.generateFrameNames("alien", {
      //frames that are moving
      frames: [0, 1, 2, 3],
    }),
    frameRate: 8,
    repeat: -1,
  });
  // this.anims.create({
  //   key: "jumping",
  //   frames: this.anims.generateFrameNames("alien", {
  //     //frames that are moving
  //     frames: 4,
  //   }),
  //   frameRate: 8,
  //   repeat: -1,
  // });
  this.cameras.main.startFollow(this.player)
  this.cameras.main.zoom = 1;

};

gameScene.update = function () {


  let onGround =
    this.player.body.blocked.down || this.player.body.touching.down;

  // respawn when falling
  if (this.player.body.position.y > 2400) {
    this.player.x = 1100
    this.player.y = 2300
  }

  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-this.playerSpeed);

    this.player.flipX = false;

    if (!this.player.anims.isPlaying) {
      this.player.anims.play("walking");
    }
  } else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);
    this.player.flipX = true;

    if (!this.player.anims.isPlaying) {
      this.player.anims.play("walking");
    }
  } else {
    this.player.body.setVelocityX(0);
    this.player.anims.stop("walking");
    //default pose
    this.player.setFrame(1);
  }
  // handle jumping
  if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);

    // stop the walking animation
    // if (this.player.anims.isPlaying) {
    //   this.player.anims.play("jumping");
    // } else this.player.anims.play("walking");

    // change frame
    this.player.setFrame(2);
  }
};

// sets up all the elements in the level
gameScene.level = function () {
  this.platforms = this.add.group();


  // parse json data
  this.levelData = this.cache.json.get('levelData');

  // create all the platforms
  for (let i = 0; i < this.levelData.platforms.length; i++) {
    let platform = this.levelData.platforms[i];

    let newObj;

    // create object
    if (platform.numTiles == 1) {
      // create sprite
      newObj = this.add
        .sprite(platform.x, platform.y, platform.key)
        .setOrigin(0);
    } else {
      // create tilesprite
      let width = this.textures.get(platform.key).get(0).width;
      let height = this.textures.get(platform.key).get(0).height;
      newObj = this.add
        .tileSprite(
          platform.x,
          platform.y,
          platform.numTiles * width,
          height,
          platform.key
        )
        .setOrigin(0);
    }

    // enable physics
    this.physics.add.existing(newObj, true);

    // add to the group
    this.platforms.add(newObj);
  }
  // create all the fire
  this.fires = this.physics.add.group({
    allowGravity: false,
    immovable: true,
  });

  // create all minions
  this.minions = this.physics.add.group({
    allowGravity: false,
    immovable: true,
  });

  // create goal/boss
  this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');

  this.goal.anims.play('boss')

  this.physics.add.existing(this.goal);

  // create minions
  for (let i = 0; i < this.levelData.minions.length; i++) {
    let curr = this.levelData.minions[i];
    let newObj = this.minions.create(curr.x, curr.y, 'minion').setOrigin(0)
    if (curr.flipX === true) {
      newObj.flipX = true
    }

    newObj.anims.play('floating');

    this.minions.add(newObj);
  }
  // minion = this.add.sprite(this.levelData.minion.x, this.levelData.minion.y, 'minion');
  // this.physics.add.existing(this.minion);
  // if (this.levelData.minion.flipX === true) {
  //   this.minion.flipX = true
  // }



  for (let i = 0; i < this.levelData.fires.length; i++) {
    let curr = this.levelData.fires[i];

    let newObj = this.fires.create(curr.x, curr.y, 'fire').setOrigin(0).setSize(30, 30)

    //   // play burning animation
    newObj.anims.play('burning');

    //   // add to the group
    this.fires.add(newObj);

  }

  // restart game (game over + you won!)
  gameScene.restartGame = function (sourceSprite, targetSprite) {
    // fade out
    this.player.x = 1100
    this.player.y = 2300

  };

  // boss attack
  gameScene.bossAttack = function () {
    this.flames = this.physics.add.group({
      bounceY: 0.1,
      bounceX: 1,
      collideWorldBounds: true
    })
    let spawnEvent = this.time.addEvent({
      delay: this.levelData.spawner.interval,
      loop: true,
      callbackScope: this,
      callback: function () {

        let flame = this.flames.create(this.goal.x, this.goal.y, 'bossAttack');



        flame.anims.play('bossAttacking');


        flame.setVelocityX(-this.levelData.spawner.speed);

        this.time.addEvent({
          delay: this.levelData.spawner.lifespan,
          repeat: 0,
          callbackScope: this,
          callback: function () {
            flame.destroy();
          }
        });

      }
    })
  }

  //minion attack
  gameScene.minionAttack = function () {
    for (let i = 0; i < this.levelData.minions.length; i++) {
      let curr = this.levelData.minions[i];
      this.flames = this.physics.add.group({
        bounceY: 0.1,
        bounceX: 1,
        collideWorldBounds: true
      })
      let spawnEvent = this.time.addEvent({
        delay: curr.interval,
        loop: true,
        callbackScope: this,
        callback: function () {

          let flame = this.flames.create(curr.x, curr.y, 'flame').setSize(35, 35);

          flame.anims.play('flaming');


          if (curr.flipX === true) {
            flame.flipX = true
          }
          flame.setVelocityX(curr.speed);

          this.time.addEvent({
            delay: curr.lifespan,
            repeat: 0,
            callbackScope: this,
            callback: function () {
              flame.destroy();
            }
          });

        }
      })
    }

    gameScene.winGame = function (sourceSprite, targetSprite) {


    }
  }
}
