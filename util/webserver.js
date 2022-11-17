//webserver
//declaring shit
const express = require("express");
const app = express();
const port = 3000
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 

//rendering shit
app.use(express.static("views")); // public folder for css and images
app.use(express.static("public")); // public folder for css and images
app.set("view engine", "ejs"); // seting the engine for ejs
app.get('/', function (req, res){res.render('index');});

//setting up socket.io for live updates..idk an alternative
io.on('connection', function(client) { 
	//someone please fix this
	setInterval(() => {
		    io.emit('updateUsername', exported.username);
		    io.emit('updateController', exported.controller);
		    io.emit('updateETA', exported.ETA);
		    io.emit('updateQueuePosition', exported.queuePlace);

	}, 1000);
    //send a message to ALL connected clients
});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
}); 

var exported = module.exports = {
	ETA: "None", //ETA
	username: "None", //username for webserver
	queuePlace: "None", //our place in queue
	controller: "None" //controller 
};
