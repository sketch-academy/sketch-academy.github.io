const express = require('express');
//const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

var app = express()
//app.use('/css', express.static('css'));
app.use(express.static(path.join(__dirname)));
//app.use((req, res) => res.sendFile(INDEX));
app.get('/drawing', function (req, res) {
  res.sendFile(path.join(__dirname, '/drawing.html'));
});

app.get('', function(req,res){
 res.sendfile(__dirname + '/index.html');
}); 

var server = require('http').Server(app);
server.listen(PORT);

//var io = socketIO(server);
//app.use((req, res) => res.sendFile(INDEX)).listen(PORT, () => console.log(`Listening on ${ PORT }`));




/*


io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
*/
/*
var acknowledgementsEvents = require("./acknowledgementEvents.js")
var emitEvents = require("./emitEvents.js")
var socketEventRegister = require("./socketEventRegister.js")

socketEventRegister.register(io, emitEvents.socketCallback, "Emit")
socketEventRegister.register(io, acknowledgementsEvents.socketCallback, "Acknowledgement")

var nsp = io.of("/swift")
socketEventRegister.register(nsp, emitEvents.socketCallback, "Emit")
socketEventRegister.register(nsp, acknowledgementsEvents.socketCallback, "Acknowledgement")
*/