"use strict";

// =======
// Imports
// =======

const fs = require("fs");

const mcproxy = require("@rob9315/mcproxy");
const mc = require("minecraft-protocol");

const logger = require("./util/logger.js");
const notifier = require("./util/notifier.js");
const gui = require("./util/gui.js");

const config = JSON.parse(fs.readFileSync("config.json"));

// ===========
// Global Vars
// ===========

var conn;
var client;
var server;

// ===========
// Start Proxy
// ===========

start();

// ======
// Client
// ======

// Start proxy stack
function start() {
	logger.log("proxy", "Starting proxy stack.");
	conn = new mcproxy.Conn({
		host: config.server.host,
		version: config.server.version,
		username: config.account.username,
		password: config.account.password,
		auth: config.account.auth
	});
	client = conn.bot._client;
	server = mc.createServer({
		"online-mode": config.proxy.whitelist,
		encryption: true,
		host: "localhost",
		port: config.proxy.port,
		version: config.server.version,
		"max-players": 1
	});

	// Send message once connected to 2B2T
	client.on("connect", function () {
		logger.log("connected", "Client connected to 2B2T");
		startMineflayer();
	});

	// Send message once disconnected from 2B2T
	client.on("disconnect", function (packet) {
		logger.log("disconnected", packet.reason);
		reconnect();
	});

	// Listen to packets for ETA, position, joining, & restart info
	client.on("packet", (data, meta) => {
		// Log packets
		logger.packetHandler(meta, data);
		
		// Check if in queue
		var inQueue = conn.bot.game.serverBrand === "Waterfall <- 2b2t-lobby";
		if (inQueue !== gui.data.inQueue) {
			gui.display("inQueue", inQueue);
		}
		
		switch(meta.name) {
			case "playerlist_header": // Handle playerlist packets
				if (inQueue) { // Check if in server
					var header = JSON.parse(data.header);
					var position = header.text.split("\n")[5].split("§l")[1];
					var eta = header.text.split("\n")[6].split("§l")[1];
					if (position !== gui.data.position) { // Position
						gui.display("position", position);
						if (gui.data.position <= config.queueThreshold) { // Notifications
							notifier.sendToast("2B2T Queue Position: " + gui.data.position);
							notifier.sendWebhook({ping: true});
						} else {
							notifier.sendWebhook({ping: false});
						}
					}
					if (eta !== gui.data.eta) { // ETA
						gui.display("eta", eta);
					}
				} else {
					var position = "In Server!";
					var eta = "Now!";
					if (gui.data.position !== position) {
						gui.display("position", "In Server!");
					}
					if (gui.data.eta !== eta) {
						gui.display("eta", "Now!");
					}
				}
				server.motd = "Position: " + gui.data.position + " - ETA: " + gui.data.eta; // Update local server motd
				break;
			case "chat": // Handle chat packets
				var msg = JSON.parse(data.message);
				logger.log("chat", msg);
				if (msg.extra !== undefined && msg.extra[0].text.startsWith("[SERVER] Server restarting in ")) {
					var restart = msg.extra[0].text.replace("[SERVER] Server restarting in ", "").replace(" ...", "");
					if (restart !== gui.data.restart) {
						gui.display("restart", restart);
						notifier.sendToast("Server Restart In: " + gui.data.restart);
						notifier.sendWebhook({ping: true, titleOverride: "Server Restart In: " + gui.data.restart});
					}
				}
				break;
			case "kick_disconnect": // Handle kick/disconnect packets
				logger.log("kick/disconnect", data);
				reconnect();
				break;
			default:
				break;
		}
	})
	
	// Mineflayer stuff
	client.on("physicTick", function() {
		if (gui.data.mineflayer && !gui.data.inQueue) {			
			// Mineflayer stuff
		}
	})
}

// Reconnect
function reconnect() {
	logger.log("proxy", "Reconnecting.");
	gui.display("restart", "Reconnecting in " + config.reconnectInterval + " seconds...");
	setTimeout(
		function(){
			server.close();
			client.end();
			conn.disconnect();
			gui.display("restart", "Reconnecting now!");
			notifier.sendToast("Reconnecting now!");
			notifier.sendWebhook({ping: true, titleOverride: "Reconnecting now!"});
			gui.reset();
			start();
		}, config.reconnectInterval * 1000
	);
}

// Start Mineflayer modules
function startMineflayer() {
	logger.log("mineflayer", "Starting Mineflayer.");
	// meow
	gui.display("mineflayer", true);
}

// Stop all Mineflayer modules
function stopMineflayer() {
	logger.log("mineflayer", "Stopping Mineflayer.");
	// woof
	gui.display("mineflayer", false);
}

// ============
// Local Server
// ============

// Bridge packets between you & the already logged-in client
server.on("login", (bridgeClient) => {
	if (config.proxy.whitelist && (client.uuid !== bridgeClient.uuid)) {
		bridgeClient.end("You must either use the same account specified in config.json or disable whitelisting.\n\nIf you're getting this error in error, you may have to grant the script permission to use your Microsoft account (if you're using a Microsoft account).");
		return;
	}
	logger.log("bridgeclient", bridgeClient.uuid + " has connected to the local server.");
	
	bridgeClient.on("packet", (data, meta, rawData) => {
		bridge(rawData, meta, client);
	});
	bridgeClient.on("end", ()=>{
		logger.log("bridgeClient", bridgeClient.uuid + " has disconnected from the local server.");
		startMineflayer();
	});

	stopMineflayer();
	conn.sendPackets(bridgeClient);
	conn.link(bridgeClient);
});

// Send packets from Point A to Point B
function bridge(data, meta, dest) {
	if (meta.name !== "keep_alive" && meta.name !== "update_time") { // Keep-alive packets are filtered bc the client already handles them. Sending double would kick us.
		dest.writeRaw(data);
	}
}