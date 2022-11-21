//webserver.js
const express = require("express");
const app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
const chatLog = [""];
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
	io.emit('updateChatLog', chatLog);
	});
}
const updatewebUI = function updatewebUI() {
	io.emit('updateUsername', site.username);
	io.emit('updateController', site.controller);
	io.emit('updateETA', site.ETA);
	io.emit('updateQueuePosition', site.queuePlace);
}
function updateChat (chat){
	chatLog.push("[" + getTimestamp() + "] " + chat);
	io.emit('updateChatLog', chatLog);
}
function getTimestamp(includeTime) {
	let timestamp = new Date();
	if (includeTime) {
		timestamp = timestamp.toLocaleDateString();
	} else {
		timestamp = timestamp.toLocaleString();
	}
	return timestamp.replace(/\//g, "-") // Replace forward-slash with hyphen
					.replace(",", ""); // Remove comma
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
	startwebUI,
	updateChat
};
