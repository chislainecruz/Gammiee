var express = require("express");
var app = express();
var server = require("http").Server(app);
const PORT = process.env.PORT || 8080;
var io = require("socket.io").listen(server, {});

//We will use this object to keep track of all the players that are currently in the games
let players = {};
let gSPlayers = {};
let wRPlayers = {};

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//listening for the connection and disconnection

io.on("connection", function (socket) {
  // create a new player and add it to our players object

  players[socket.id] = {
    x: Math.random() * (1400 - 830) + 830,
    y: 2300,
    playerId: socket.id,
    ready: false,
    scene: "WaitingRoom",
  };

  console.log("a user connected");
  // send the players object to the new player
  socket.on("WR", () => {
    for (let player in players) {
      if (players[player].scene === "WaitingRoom") {
        wRPlayers[players[player].playerId] = players[player];
      }
    }
    socket.emit("currentPlayersInWR", wRPlayers);
  });

  socket.on("GS", () => {
    for (let player in players) {
      if (players[player].scene === "gameScene") {
        gSPlayers[players[player].playerId] = players[player];
      }
    }
    socket.emit("currentPlayersInGS", gSPlayers);
  });

  socket.on("changeScenes", () => {
    console.log("changing scenes...");
    players[socket.id].scene = "gameScene";
    socket.broadcast.emit("updateScene", socket.id);
  });

  //update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

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

  socket.on("playerWins", () => {
    socket.broadcast.emit("endGame");
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
        socket.emit("disconnectPlayer");
      },
      //if player goes a minute without moving, they will be disconnected
      1000 * 20
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
