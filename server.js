var express = require('express');
var app = express();
var http = require('http').Server(app);
var _ = require('underscore-node');
io = require('socket.io').listen(http);


/*
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');

});
*/


app.get('/', function(req, res) {
  return res.render('index.jade');
});

app.get('/game.js', function(req, res) {
    return res.sendfile('game.js', {root:__dirname});
});


io.on('connection', function(socket){
  socket.on('join', function(msg){
    console.log('Player joined: ' + msg);
  });
});

app.use(express.static('public'));
http.listen(8001, function(){
  console.log('listening on *:8001');
});
