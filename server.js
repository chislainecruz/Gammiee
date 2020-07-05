var express = require("express");
var app = express();
var server = require("http").Server(app);

var io = require("socket.io").listen(server);

//We will use this object to keep track of all the players that are currently in the game
var players = {};

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//listening for the connection and disconnection

io.on("connection", function (socket) {
  // create a new player and add it to our players object
  
  // send the players object to the new player
  socket.emit("test", 'this is a comment')
  // update all other players of the new player
  socket.on('newPlayer', (player) => {
    console.log('new player', player)
  })
  console.log("a user connected");
  socket.on("disconnect", function () {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("disconnect", socket.id);
  });
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
