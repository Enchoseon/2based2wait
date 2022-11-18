//webserver.js
const express = require("express");
const app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 

const startwebUI = function startwebUI() {
	app.use(express.static("views")); // public folder for css and images
	app.use(express.static("public")); // public folder for css and images
	app.set("view engine", "ejs"); // seting the engine for ejs
	app.get('/', function (req, res){res.render('index');});
	server.listen(site.webport, function(){
	  console.log('listening on *:' + site.webport);
	}); 
io.on('connection', function(client) { 
	io.emit('updateUsername', site.username);
	io.emit('updateController', site.controller);
	io.emit('updateETA', site.ETA);
	io.emit('updateQueuePosition', site.queuePlace);
	});
}
const updatewebUI = function updatewebUI() {
	io.emit('updateUsername', site.username);
	io.emit('updateController', site.controller);
	io.emit('updateETA', site.ETA);
	io.emit('updateQueuePosition', site.queuePlace);
}
var site = {
	ETA: "None", //ETA
	username: "None", //username for webserver
	queuePlace: "None", //our place in queue
	controller: "None", //controller 
	webport: 3000
}
module.exports = {
	site,
	updatewebUI,
	startwebUI
};
