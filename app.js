var express = require('express');
var app = express();
var io = require('socket.io').listen(5000);

io.sockets.on('connection', function(socket){
});


var PORT = process.argv[2] || 3000;

app.engine('jade', require('jade').__express);
app.set('views', process.cwd() + '/app/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/app/assets'));

app.get('/', function(request, response){
  response.render('application');
});

var server = app.listen(PORT);
console.log('listening on port ' + PORT);

module.exports = {
  server: server,
  io: io,
  express: app
};
