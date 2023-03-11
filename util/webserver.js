//webserver.js
const express = require("express");
const app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server); 
const path = require('path');

const { config, status } = require("./config.js");
const storedChat = [[new Date().toLocaleTimeString().replace(/(.*)\D\d+/, '$1'), "iMessenger", "Please support by sharing the project!"]];




//===============================
//Setting up password for website
//===============================
let webusername = config.webinterface.username;
let webpassword = config.webinterface.password;
let webport = config.webinterface.port;
let webEnable = config.webinterface.pwprotected;


let sequenceNumberByClient = new Map();
//Start webserver
if (config.webinterface.enabled) startwebUI();
function startwebUI() {
	app.get("/", (req, res) => {
  	const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };
		if (webEnable){
			const authorization = req.headers.authorization;
	  		if (!authorization) {
	    		return reject();
	  		}
	  		const [username, password] = Buffer.from(authorization.replace("Basic ", ""), "base64").toString().split(":");
	  		if (!(username === webusername && password === webpassword)) {
	    		return reject();
	  		}
		}
			app.use(express.static("views")); // public folder for css and image
		  	app.use(express.static("public")); // public folder for css and images
		  	res.sendFile(path.join(__dirname, '../views/index.html'));	
});
	//Start timers

	server.listen(webport, function(){
		console.log('listening on *:' + webport);
	}); 
	//Information gets updated on first connection
	io.on('connection', function(client) { 
		io.emit('updateUsername', config.account.username);
		io.emit('updateController', status.controller);
		io.emit("updateStoredChat", storedChat);
		io.emit("updateHealth", playerInfo.health);
		io.emit("updateHunger", playerInfo.hunger);
		io.emit('updateQueuePosition', status.position);
		io.emit('updateWhitelist', serverInfo.whitelist);
		io.emit('serverInfo', config.account.username);
		
		if (status.eta != "Now!"){
			io.emit('updateETALabel', "Estimated Wait time");
			io.emit('updateETA', status.eta);
		}else{
			io.emit('updateETALabel', "Connected at:");
			io.emit('updateETA', serverInfo.connectedAt);
		};
		//=========================
		//Process request from site
		//=========================
		client.on('addToWhitelist', (msg) => {
	    	config.proxy.whitelist.push(msg)
	      	io.emit('updateWhitelist', serverInfo.whitelist);
    	});
    	client.on('deleteLastWhitelist', function() {
      		config.proxy.whitelist.pop()
      		io.emit('updateWhitelist', serverInfo.whitelist);
    	});
    	client.on('openWebterminal', function() {
      		console.log("Opening web terminal");
    	});
    	//============
    	//Web Terminal
    	//============
    	client.on('terminalConnect', function() {
      		console.log("Connected to terminal.");
    	});
    	client.on('terminalHelp', function() {
      		console.log("[Terminal] Help command issued.");
    	});
    	
    	// client.on('terminalPlayer', function() {
    	// 	console.log("[Terminal] whoami command issued.");
    	// 	io.emit('playerCMD', terminal.playerCMDInfo);
    	// });
	});
	setInterval(() => {
		serverInfo.upTime++
		io.emit('updateUptime', toDaysMinutesSeconds(serverInfo.upTime));
	}, 1000);
	setInterval(() => {
		if(serverInfo.queueFinished){
			serverInfo.connectionTime++
			io.emit('updateCurrentServer', toDaysMinutesSeconds(serverInfo.connectionTime)); 
			io.emit('updateETALabel', "Connected at:");
			io.emit('updateETA', serverInfo.connectedAt);
		}else{
			io.emit('updateCurrentServer', "waiting to connect...");
		}
	}, 1000);
};
//Update website values
function updateWebStatus(webValue, systemvalue) {
    io.emit(webValue, systemvalue);
}
//mineflayer bot
function botWebInject(bot) {
	//=========================
	//Setting all player values
	//=========================
	bot.once("spawn", () => {
		//===================
		//Getting player info
		//===================
		io.on('connection', function(client) { 

			client.on('terminalPlayer', function() {
				let cmdOutput = [`+--------------+-----------------------------------------+`];
				let cmdPlayerInfo = [["username", ""], ["UUID", ""], ["Position", ""], ["Ping", ""], ["Health", ""], ["Hunger", ""]];
				cmdPlayerInfo[0][1] = bot.username;
				cmdPlayerInfo[1][1] = bot.player.uuid;
				cmdPlayerInfo[2][1] = `x(${Math.round(bot.entity.position.x)}) y(${Math.round(bot.entity.position.y)}) z(${Math.round(bot.entity.position.z)})`;
				cmdPlayerInfo[3][1] = bot.player.ping.toString();
				cmdPlayerInfo[4][1] = bot.health.toString();
				cmdPlayerInfo[5][1] = bot.food.toString();
				cmdPlayerInfo.forEach((item) => { 
				let description = item[0];
        for (let i = 0; i < (12 - item[0].length); i++) {
            description += " "
        }
        let information = item[1];
        for (let i = 0; i < (40 - item[1].length); i++) {
            information += " "
        }
        cmdOutput.push(`| ${description} | ${information}|`, );
        cmdOutput.push(`+--------------+-----------------------------------------+`);
				});
				io.emit('playerCMD', cmdOutput);
				console.log(cmdOutput)
			});
			client.on('terminalPlayerName', function() {
				let cmdOutput = [`+--------------+-----------------------------------------+`];
				let cmdPlayerInfo = [["username", ""], ["UUID", ""]];
				cmdPlayerInfo[0][1] = bot.username;
				cmdPlayerInfo[1][1] = bot.player.uuid;
				cmdPlayerInfo.forEach((item) => { 
				let description = item[0];
        for (let i = 0; i < (12 - item[0].length); i++) {
            description += " "
        }
        let information = item[1];
        for (let i = 0; i < (40 - item[1].length); i++) {
            information += " "
        }
        cmdOutput.push(`| ${description} | ${information}|`, );
        cmdOutput.push(`+--------------+-----------------------------------------+`);
				});
				io.emit('playerNameCMD', cmdOutput);
				console.log(cmdOutput)
			});
			client.on('terminalWhoAmI', function() {
    		let whoamiOutput = [`+--------------+-----------------------------------------+`];
				let cmdwhoamiInfo = [["username", ""], ["UUID", ""]];
				cmdwhoamiInfo[0][1] = bot.username;
				cmdwhoamiInfo[1][1] = bot.player.uuid;
				cmdwhoamiInfo.forEach((item) => { 
				let description = item[0];
        for (let i = 0; i < (12 - item[0].length); i++) {
            description += " "
        }
        let information = item[1];
        for (let i = 0; i < (40 - item[1].length); i++) {
            information += " "
        }
        whoamiOutput.push(`| ${description} | ${information}|`, );
        whoamiOutput.push(`+--------------+-----------------------------------------+`);
				});
				io.emit('playerCMD', whoamiOutput);
				console.log(whoamiOutput)
    	});


		});
	});
	bot.on('chat', (username, message) => {
        updateWebChat(username, message);
    });
    //Update health information on the site
    bot.on("health", () => {
    	playerInfo.health = bot.health;
        updateWebStatus('updateHealth', playerInfo.health);
    	playerInfo.hunger = bot.food;
        updateWebStatus('updateHunger', playerInfo.hunger);
    })
    //Chat Box
    io.on('connection', function(client) {
	    client.on('chat message', (msg) => {
	        bot.chat(msg);
	    });
	});

}
//Where we update the web chat
function updateWebChat (username, message){
	let time = new Date().toLocaleTimeString().replace(/(.*)\D\d+/, '$1');
	let renderChat = [time, username, message]
	storedChat.push(renderChat)
	//console.log(renderChat);
	io.emit('updateWebChatLog', renderChat);
}
//Player Information
var playerInfo = {
	health: "0",
	hunger: "0",
}
var serverInfo = {
	ETA: "None", //ETA
	queuePlace: "None", //our place in queue
	upTime: 0,
	queueFinished: false,
	connectionTime: 0,
	connectedAt: "",
	whitelist: config.proxy.whitelist
}
var terminal = {
	playerInfo: [["Username", ]

	],
	playerCMDInfo: [`+--------------+-----------------------------------------+`]

}
function toDaysMinutesSeconds(totalSeconds) {
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const days = Math.floor(totalSeconds / (3600 * 24));

  const secondsStr = ('0' + seconds).slice(-2);
  const minutesStr = ('0' + minutes).slice(-2) + ':';
  const hoursStr = ('0' + hours).slice(-2) + ':';;
  const daysStr = makeHumanReadable(days, 'Day');

  return `${daysStr}${hoursStr}${minutesStr}${secondsStr}`.replace(/,\s*$/, '');
}
function makeHumanReadable(num, singular) {
  return num > 0
    ? num + (num === 1 ? ` ${singular}, ` : ` ${singular}s, `)
    : '';
}
module.exports = {
	startwebUI,
	updateWebStatus,
	updateWebChat,
	botWebInject,
	serverInfo,
	io: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }  
}
