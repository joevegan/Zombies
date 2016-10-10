var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

/*
app.get('/', function(req, res) {
  return res.render('index.jade');
});
*/

io.on('connection', function(socket){
  socket.on('join', function(msg){
    console.log('Player joined: ' + msg);
  });
});

app.use(express.static('public'));
http.listen(8001, function(){
  console.log('listening on *:8001');
});
