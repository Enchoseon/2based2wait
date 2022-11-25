//webserver.js
const express = require("express");
const app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
const path = require('path');

const chatLog = [""];
function startStatic(){
	app.use(express.static("views")); // public folder for css and image
  app.use(express.static("public")); // public folder for css and images
}

function startwebUI() {
	app.get("/", (req, res) => {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === site.webusername && password === site.webpassword)) {
    return reject();
  }
  app.use(express.static("views")); // public folder for css and image
  app.use(express.static("public")); // public folder for css and images
  res.sendFile(path.join(__dirname, '../views/index.html'));
});
	
	server.listen(site.webport, function(){
	  console.log('listening on *:' + site.webport);
	}); 
	io.on('connection', function(client) { 
		io.emit('updateUsername', "<img hight='10%' width='10%' src='https://mc-heads.net/avatar/" + site.username + "' /> " + site.username);
		io.emit('updateController', site.controller);
		io.emit('updateETA', site.ETA);
		io.emit('updateQueuePosition', site.queuePlace);
		io.emit('updateChatLog', chatLog);
		io.emit('updateHealth', site.playerHealth);
		io.emit('updateHunger', site.playerHunger);
		io.emit('updateWhitelist', site.whitelist);
		
	});

}
function updatewebUI() {
	io.emit('updateUsername', "<img hight='10%' width='10%' src='https://mc-heads.net/avatar/" + site.username + "' /> " + site.username);
	io.emit('updateController', site.controller);
	io.emit('updateETA', site.ETA);
	io.emit('updateQueuePosition', site.queuePlace);
	io.emit('updateHealth', site.playerHealth);
	io.emit('updateHunger', site.playerHunger);
	io.emit('updateWhitelist', site.whitelist);
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
	playerHealth: "0",
	playerHunger: "0",
	whitelist: [""],
	webusername: "admin",
	webpassword: "password",
	webport: 3000
}

module.exports = {
	site,
	updatewebUI,
	startwebUI,
	updateChat,
	io: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }
}
