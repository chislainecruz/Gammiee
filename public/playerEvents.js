import { waitingRoom } from "./theGame";

const events = (self) => {
  self.otherPlayers = self.physics.add.group();
  self.powerups = self.physics.add.group();
  //* Player attributes

  self.socket.on("currentPlayers", (players) => {
    addPlayer(self, players[self.socket.id]);
    delete players[self.socket.id];

    Object.keys(players).forEach(function (id) {
      if (self.scene.key === players[id].scene) {
        console.log("test");
        addOtherPlayers(self, players[id]);
      }
    });
  });

  self.socket.on("updateScene", (playerId) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.scene = "Hard" || "Easy" || "Medium";
      }
    });
  });

  self.socket.on("newPlayer", (playerInfo) => {
    if (self.scene.key === "WaitingRoom") {
      console.log("creating new player...");
      addOtherPlayers(self, playerInfo);
    }
  });

  self.socket.on("disconnect", (playerId) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (
        playerId === otherPlayer.playerId &&
        self.scene.key === otherPlayer.scene.scene.key
      ) {
        otherPlayer.name.destroy();
        otherPlayer.destroy();
      }
    });
  });
  self.socket.on("playerMoved", (playerInfo) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.flipX = playerInfo.flipX;
        otherPlayer.name.x =
          otherPlayer.x - 25 - otherPlayer.name.text.length * 2;
        otherPlayer.name.y = otherPlayer.y - 50;
        if (otherPlayer.check) {
          otherPlayer.check.x = otherPlayer.name.x
          otherPlayer.check.y = otherPlayer.name.y - 10

        }
        if (playerInfo.frame) {
          otherPlayer.setFrame(playerInfo.frame);
        }
      }
    });
  });

  self.socket.on("startGame", () => {
    if (self.scene.key === "WaitingRoom") {
      self.startGame();
    }
  });

  self.socket.on("disconnectPlayer", () => {
    console.log("stopping scene...");
    //destroys the game instance so other players can join
    self.music.pause();
    //self.sys.game.destroy();

    alert(
      "You have been disconnected due to inactivity. Press OK to re-connect"
    );
    self.scene.stop();
    //self.scene.pause();
  });
  if (self.scene.key !== "WaitingRoom") {
    self.socket.on("createPowerups", (type, x, y) => {
      createPowerups(self, type, x, y);
    });
  }

  self.socket.on("destroyPowerup", (x, y) => {
    self.powerups.getChildren().forEach((powerup) => {
      if (powerup.x === x && powerup.y === y) {
        powerup.destroy();
      }
    });
  });

  const username = document.getElementById("player-name");
  const button = document.getElementById("player-button");

  button.addEventListener("click", function () {
    self.player.name.text = username.value;

    self.socket.emit("usernameAdded", self.player.name.text);
  });



  self.socket.on("displayUsername", (username, socketId) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (socketId === otherPlayer.playerId) {
        otherPlayer.name.text = username;
      }
    });
  });

  if (self.scene.key !== "WaitingRoom") {
    self.socket.on("minionAttack", () => {
      minionAttack(self);
    });
    self.socket.on("bossAttack", () => {
      bossAttack(self);
    });
  }
};

export function addPlayer(self, playerInfo) {
  self.player = self.physics.add.sprite(
    playerInfo.x,
    playerInfo.y,
    playerInfo.sprite.key,
    1
  );
  if (self.scene.key !== "WaitingRoom") {
    self.physics.add.collider(self.ground, [
      self.player,
      self.goal,
      self.minion,
    ]);
    self.physics.add.collider(
      [self.player, self.goal, self.minion],
      self.platforms
    );
  } else {
    self.physics.add.collider(self.ground, self.player);
  }

  self.player.body.bounce.y = 0.1;
  self.player.body.gravity.y = 800;
  self.player.body.collideWorldBounds = true;
  //were wolf scale y 0.5, scalex 0.4
  //lizzy scaley 0.55 scalex 0.375
  //mushroom scaley 0.65 scalex 0.5
  self.player.scaleX = playerInfo.sprite.scaleX;
  self.player.scaleY = playerInfo.sprite.scaleY;
  //player damage overlaps

  self.playerDamage = self.physics.add.overlap(
    self.player,
    [self.fires, self.flames],
    self.restartGame,
    null,
    self
  );
  //player wins overlap
  self.physics.add.overlap(self.player, [self.goal], self.winGame, null, self);
  self.cameras.main.startFollow(self.player);
  self.cameras.main.setZoom(1.6);

  if (!playerInfo.name) {
    playerInfo.name = "Anonymous";
  }
  self.player.name = self.add.text(
    self.player.x - 50,
    self.player.y - 50,
    playerInfo.name
  );
  if (self.player.scene !== waitingRoom) {
    waitingRoom.player.destroy();
  }
}

export function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(
    playerInfo.x,
    playerInfo.y,
    playerInfo.sprite.key,
    1
  );
  otherPlayer.flipX = playerInfo.flipX;
  self.physics.add.collider(self.ground, otherPlayer);
  if (self.scene.key !== "WaitingRoom") {
    self.physics.add.collider(self.platforms, otherPlayer);
  }
  otherPlayer.body.bounce.y = 0.2;
  otherPlayer.body.gravity.y = 800;
  otherPlayer.body.collideWorldBounds = true;
  otherPlayer.scaleX = playerInfo.sprite.scaleX;
  otherPlayer.scaleY = playerInfo.sprite.scaleY;
  otherPlayer.playerId = playerInfo.playerId;

  if (!playerInfo.name) {
    playerInfo.name = "Anonymous";
  }
  otherPlayer.name = self.add.text(
    otherPlayer.x - 50,
    otherPlayer.y - 50,
    playerInfo.name
  );
  self.otherPlayers.add(otherPlayer);
}

export function spawnPowerUps(self, powerUp, x, y) {
  let powerUpSpawn = self.physics.add.sprite(x, y, powerUp);
  self.powerups.add(powerUpSpawn);
  powerUpSpawn.body.allowGravity = false;
  if (powerUp === "speed") {
    powerUpSpawn.func = speedBoost;
  } else {
    powerUpSpawn.func = invincible;
  }
  return powerUpSpawn;
}

function speedNormal() {
  this.playerSpeed = 350;
  this.jumpSpeed = -800;
}

function speedBoost(sourceSprite, targetSprite) {
  this.playerSpeed = 700;
  this.jumpSpeed = -1000;
  this.time.delayedCall(8000, speedNormal, [], this);
  targetSprite.destroy();
  this.socket.emit("powerupTaken", targetSprite.x, targetSprite.y);
}

function notInvincible() {
  this.playerDamage.active = true;
  this.minionDamage.active = true;
  this.bossDamage.active = true;
}
function invincible(sourceSprite, targetSprite) {
  this.minionDamage.active = false;
  this.bossDamage.active = false;
  this.playerDamage.active = false;
  this.time.delayedCall(8000, notInvincible, [], this);
  targetSprite.destroy();
  this.socket.emit("powerupTaken", targetSprite.x, targetSprite.y);
}

function createPowerups(self, powerUp, x, y) {
  let power = spawnPowerUps(self, powerUp, x, y);
  self.physics.add.overlap(self.player, power, power.func, null, self);
  return power;
}

//minion attack
function minionAttack(self) {
  self.flames = self.physics.add.group({
    bounceY: 0.1,
    bounceX: 1,
    collideWorldBounds: true,
  });

  for (let i = 0; i < self.levelData.minions.length; i++) {
    let curr = self.levelData.minions[i];

    let flame = self.flames.create(curr.x, curr.y, "flame").setSize(35, 35);

    flame.anims.play("flaming");

    if (curr.flipX === true) {
      flame.flipX = true;
    }
    flame.setVelocityX(curr.speed);

    self.time.addEvent({
      delay: curr.lifespan,
      repeat: 0,
      callbackScope: self,
      callback: function () {
        flame.destroy();
      },
    });
  }
  self.physics.add.collider(self.platforms, self.flames);
  self.minionDamage = self.physics.add.overlap(self.player, self.flames, self.restartGame, null, self)

}

function bossAttack(self) {
  self.bossAttack = self.physics.add.group({
    bounceY: 0.1,
    bounceX: 1,
    collideWorldBounds: true,
  });

  let flame = self.bossAttack.create(self.goal.x, self.goal.y, "bossAttack");
  flame.anims.play("bossAttacking");
  flame.setVelocityX(-self.levelData.spawner.speed);
  self.time.addEvent({
    delay: self.levelData.spawner.lifespan,
    repeat: 0,
    callbackScope: self,
    callback: function () {
      flame.destroy();
    },
  });

  self.physics.add.collider(self.platforms, self.bossAttack);
  self.bossDamage = self.physics.add.overlap(self.player, self.bossAttack, self.restartGame, null, self)
}

export default events;
