import game, { waitingRoom, gameScene, gameSceneEasy } from "./theGame";
import socket from "./socket";

const events = (self) => {
  self.otherPlayers = self.physics.add.group();
  //* Player attributes

  self.socket.on("currentPlayersInWR", (players) => {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        if (players[id].scene === "waitingRoom") {
          addOtherPlayers(self, players[id]);
        }
      }
    });
  });

  self.socket.on("updateScene", (playerId) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.scene = "gameScene" || "gameSceneEasy";
      }
    });
  });

  self.socket.on("currentPlayersInGS", (players) => {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
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
      if (playerId === otherPlayer.playerId) {
        if (self.scene.key === "WaitingRoom") {
          console.log("hello");
        }

        otherPlayer.destroy();
      }
    });
  });
  self.socket.on("playerMoved", (playerInfo) => {
    self.otherPlayers.getChildren().forEach((otherPlayer) => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.flipX = playerInfo.flipX;

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
    //self.socket.broadcast.emit("disconnect");
    //game.destroy();

    alert(
      "You have been disconnected due to inactivity. Please refresh the page"
    );
  });
};

export function addPlayer(self, playerInfo) {
  self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, "alien", 1);
  if (self.scene.key === "gameScene" || self.scene.key === "gameSceneEasy") {
    self.physics.add.collider(self.ground, [
      self.player,
      self.goal,
      self.minion,
    ]);
    self.physics.add.collider(
      [self.player, self.goal, self.flames, self.minion],
      self.platforms
    );
  } else {
    self.physics.add.collider(self.ground, self.player);
  }

  self.player.body.bounce.y = 0.1;
  self.player.body.gravity.y = 800;
  self.player.body.collideWorldBounds = true;
  self.player.setScale(0.7);
  //overlaps
  self.physics.add.overlap(
    self.player,
    [self.fires, self.flames],
    self.restartGame,
    null,
    self
  );
  self.physics.add.overlap(self.player, [self.goal], self.winGame, null, self);
  self.cameras.main.startFollow(self.player);
  self.cameras.main.setZoom(1.6);

  if (self.player.scene === gameScene || self.player.scene === gameSceneEasy) {
    waitingRoom.player.destroy();
  }
}

export function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(
    playerInfo.x,
    playerInfo.y,
    "alien",
    1
  );
  otherPlayer.flipX = playerInfo.flipX;
  self.physics.add.collider(self.ground, otherPlayer);
  if (self.scene.key === "gameScene" || self.scene.key === "gameSceneEasy") {
    self.physics.add.collider(self.platforms, otherPlayer);
  }
  otherPlayer.body.bounce.y = 0.2;
  otherPlayer.body.gravity.y = 800;
  otherPlayer.body.collideWorldBounds = true;
  otherPlayer.setScale(0.7);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

export default events;
