var express = require("express");
var app = express();
var server = require("http").Server(app);
const PORT = process.env.PORT || 8080;
var io = require("socket.io").listen(server, {});
let spritesArray = require("./public/json/spriteData.json").sprites;
const easyPlatforms = require("./public/json/levelDataEasy").platforms;
const mediumPlatforms = require("./public/json/levelDataMedium").platforms;
const hardPlatforms = require("./public/json/levelDataHard").platforms;

//We will use this object to keep track of all the players that are currently in the games
let players = {};
let gSPlayers = {};
let wRPlayers = {};
let winner = "";
let selectedScene = "Easy";
let platforms;
const powerKeys = ["speed", "immune"];
let powerUps = [];
let createdPowerup = false;

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//listening for the connection and disconnection

io.on("connection", function (socket) {
  // create a new player and add it to our players object
  // chooses a random index from our sprites array
  let index = Math.floor(Math.random() * spritesArray.length);
  //we remove that sprite so there a no duplicate sprites in the game
  //splice returns an array so we access it with index [0]
  let sprite = spritesArray[index];

  players[socket.id] = {
    x: Math.random() * (1400 - 1000) + 1000,
    y: 2300,
    playerId: socket.id,
    ready: false,
    scene: "WaitingRoom",
    sprite: sprite,
  };

  socket.on("usernameAdded", (username) => {
    players[socket.id].name = username;
    socket.broadcast.emit("displayUsername", username, socket.id);
  });

  console.log("a user connected");
  // send the players object to the new player
  socket.on("WR", () => {
    for (let player in players) {
      if (players[player].scene === "WaitingRoom") {
        wRPlayers[players[player].playerId] = players[player];
      }
    }
    socket.emit("currentPlayers", wRPlayers);
  });

  socket.on("GS", () => {
    for (let player in players) {
      if (players[player].scene !== "WaitingScene") {
        gSPlayers[players[player].playerId] = players[player];
      }
    }
    socket.emit("currentPlayers", gSPlayers);
  });

  socket.on("changeScenes", (ourScene) => {
    console.log("changing scenes...");
    players[socket.id].scene = ourScene;
    socket.broadcast.emit("updateScene", socket.id);
    switch (ourScene) {
      case "Easy":
        platforms = easyPlatforms;
        break;
      case "Medium":
        platforms = mediumPlatforms;
        break;

      case "Hard":
        platforms = hardPlatforms;
        break;
      default:
        break;
    }
    if (!createdPowerup) {
      setInterval(() => {
        socket.emit("minionAttack");
        socket.broadcast.emit("minionAttack");
      }, 8000);

      setInterval(() => {
        socket.emit("bossAttack");
        socket.broadcast.emit("bossAttack");
      }, 6700);

      setInterval(() => {
        const platform =
          platforms[Math.floor(Math.random() * platforms.length)];
        const minX = platform.x;
        const maxX = platform.x + platform.numTiles * 36;
        const y = platform.y - 20;
        const x = Math.random() * (maxX - minX) + minX;
        const powerup = powerKeys[Math.floor(Math.random() * powerKeys.length)];
        powerUps.push({ key: powerup, x: x, y: y });
        socket.broadcast.emit("createPowerups", powerup, x, y);
        socket.emit("createPowerups", powerup, x, y);
      }, 5000);
    }

    createdPowerup = true;
  });

  //destroy a powerup after a player has taken it
  socket.on("powerupTaken", (x, y) => {
    socket.broadcast.emit("destroyPowerup", x, y);
  });

  //update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("playerNotReady", () => {
    players[socket.id].ready = false;
    socket.broadcast.emit("notReadyCheck", socket.id);
  });

  socket.on("playerReady", () => {
    players[socket.id].ready = true;
    socket.broadcast.emit("readyCheck", socket.id);
    let everyoneReady = true;
    for (let player in players) {
      if (players[player].ready === false) {
        everyoneReady = false;
      }
    }
    if (everyoneReady) {
      console.log("everyone is ready");
      socket.emit("startGame");
      socket.broadcast.emit("startGame");
    }
  });

  socket.on("playerWins", (playerName) => {
    socket.broadcast.emit("endGame");
    winner = playerName;
  });
  socket.on("getWinner", () => {
    socket.emit("winner", winner);
  });

  socket.on("selecting", (ourScene) => {
    selectedScene = ourScene;
    socket.broadcast.emit("selectingLevel", ourScene);
  });

  socket.on("getScene", () => {
    socket.emit("currentScene", selectedScene);
  });

  socket.on("checkGameStatus", () => {
    if (Object.keys(gSPlayers).length > 0) {
      socket.emit("gameInProgress");
    }
  });

  socket.on("disconnect", function () {
    console.log(`user ${socket.id} disconnected`);
    if (gSPlayers[socket.id]) {
      delete gSPlayers[socket.id];
      if (!(Object.keys(gSPlayers).length >= 1)) {
        io.emit("gameInProgress");
      }
    } else if (wRPlayers[socket.id]) {
      delete wRPlayers[socket.id];
    }
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });
  //when a player moves
  socket.on("playerMovement", (data) => {
    //listen for player's inactivity and disconnect
    clearTimeout(socket.inactivityTimeout);

    socket.inactivityTimeout = setTimeout(
      () => {
        socket.emit("disconnect");
        socket.emit("disconnectPlayer");
      },
      //if player goes a minute without moving, they will be disconnected
      1000 * 120
    );

    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].flipX = data.flipX;
    players[socket.id].frame = data.frame;
    //emit msg to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});

server.listen(PORT, function () {
  console.log(`Listening on ${server.address().port}`);
});
