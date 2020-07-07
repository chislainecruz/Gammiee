let waitingRoomScene = new Phaser.Scene("waitingRoom");



export default waitingRoomScene

waitingRoomScene.preload = function () {
    this.load.image('clouds', './assets/background.png');
    this.load.image('tiles', './assets/tiles.png')
    this.load.spritesheet('alien', 'assets/Alien.png', {
        frameWidth: 90,
        frameHeight: 120,
        margin: 1,
        spacing: 1,
      });
}

waitingRoomScene.create = function () {
    let background = this.add.sprite(0, 300, 'clouds')
    background.setOrigin(0, 0)
    background.setScale(3)
    // this.add.sprite(600, 600, 'tiles')
    let ground = this.add.tileSprite(1150, 1250, 23 * 100, 1 * 60, 'tiles')
    this.physics.add.existing(ground, true);

    ground.body.allowGravity = false;
    ground.body.immovable = true;
    this.alien = this.physics.add.sprite(600, 600, 'alien')
    this.physics.add.collider(this.alien, ground)
       
    var style = {
        'background-color': 'lime',
        'width': '220px',
        'height': '100px',
        'font': '48px Arial',
        'font-weight': 'bold'
    };

    var element = this.add.dom(400, 300, 'div', style, 'Phaser 3');
    console.log('eh', element)
    
    this.input.once('pointerdown', function (event) {
        
        console.log('From SceneB to SceneC');
        console.log(this.scene)
        this.scene.start('Game');

    }, this);
    let button = document.createElement('button')
    button.innerText = 'test'
    document.body.appendChild(button)
}

function addPlayer(self, playerInfo) {
    self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, "alien", 1);
  
    self.physics.add.collider(self.ground, [self.player, self.goal, self.minion]);
    self.physics.add.collider([self.player, self.goal, self.flames, self.minion], self.platforms);
    self.player.body.bounce.y = 0.2;
    self.player.body.gravity.y = 800;
    self.player.body.collideWorldBounds = true;
    self.player.setScale(0.7);
    //overlaps
    self.physics.add.overlap(self.player, [self.fires, self.flames], self.restartGame, null, self);
  
  
    self.cameras.main.startFollow(self.player);
    self.cameras.main.setZoom(1.6)
  }