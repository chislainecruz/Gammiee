var express = require("express");
var app = express();
var server = require("http").Server(app);

var io = require("socket.io").listen(server);

//We will use this object to keep track of all the players that are currently in the game
let players = {};

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//listening for the connection and disconnection

io.on("connection", function (socket) {
  // create a new player and add it to our players object

  players[socket.id] = {
    x: Math.random() * (800 - 400) + 400,
    y: 2600,
    playerId: socket.id,
  };

  console.log("a user connected");
  // send the players object to the new player
  socket.emit("currentPlayers", players);
  //update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  socket.on("disconnect", function () {
    console.log(`user ${socket.id} disconnected`);
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });

  //when a player moves
  socket.on("playerMovement", (data) => {
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].flipX = data.flipX;
    //emit msg to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});

server.listen(8082, function () {
  console.log(`Listening on ${server.address().port}`);
});
