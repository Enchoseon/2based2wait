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
const chatty = require("./util/chatty.js");
const ngrok = require("./util/ngrok.js");

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

// =================
// Packet Handler(s)
// =================

/**
 * Handle incoming packets
 * @param {object} packetData
 * @param {object} packetMeta
 */
function packetHandler(packetData, packetMeta) {
	logger.packetHandler(packetData, packetMeta); // Log packets
	gui.packetHandler(packetData, packetMeta); // Process into CLI GUI and notifications
	chatty.packetHandler(packetData, packetMeta); // Parse chat messages
}

// ======
// Client
// ======

/** Start proxy stack */
function start() {
	logger.log("proxy", "Starting proxy stack.", "proxy");
	conn = new mcproxy.Conn({
		"host": config.server.host,
		"version": config.server.version,
		"username": config.account.username,
		"password": config.account.password,
		"auth": config.account.auth
	});
	client = conn.bot._client;
	server = mc.createServer({
		"online-mode": config.proxy.onlineMode,
		"encryption": true,
		"host": "localhost",
		"port": config.proxy.port,
		"version": config.server.version,
		"max-players": 1
	});

	// Log connect and start Mineflayer
	client.on("connect", function() {
		logger.log("connected", "Client connected", "proxy");
		startMineflayer();
	});

	// Log disconnect
	client.on("disconnect", function(packet) {
		logger.log("disconnected", packet.reason, "proxy");
		reconnect();
	});

	// Log kick
	client.on("kick_disconnect", function(packet) {
		logger.log("kick/disconnect", packet.reason, "proxy");
		reconnect();
	});

	// Asoorted packet handlers
	client.on("packet", (packetData, packetMeta) => {
		// Check if in queue
		const inQueue = (conn.bot.game.serverBrand === "Waterfall <- 2b2t-lobby");
		gui.display("inQueue", inQueue);

		// Packet handler(s)
		packetHandler(packetData, packetMeta);

		// Update local server motd
		server.motd = "Position: " + gui.data.position + " - ETA: " + gui.data.eta;
	})

	// Mineflayer stuff
	client.on("physicTick", function() {
		if (gui.data.mineflayer && !gui.data.inQueue) {
			// Mineflayer stuff
		}
	})
}

// ============
// Local Server
// ============

// Handle logins
server.on("login", (bridgeClient) => {
	// Block attempt if...
	if (config.proxy.whitelist.indexOf(bridgeClient.uuid) > -1) { // ... player isn't in whitelist
		bridgeClient.end("Your account is not whitelisted.\n\nIf you're getting this error in error the Microsoft account token may have expired.\n\nThe whitelist may also be set up incorrectly.");
		logger.log("bridgeclient", bridgeClient.uuid + " was denied connection to the local server.", "proxy");
		return;
	} else if (server.playerCount > 1) { // ... and another player isn't already connected
		bridgeClient.end("Your account is whitelisted.\n\nHowever, this proxy is at max capacity.");
		logger.log("bridgeclient", bridgeClient.uuid + " was denied connection to the local server.", "proxy");
		return;
	}

	// Log successful connection attempt
	logger.log("bridgeclient", bridgeClient.uuid + " has connected to the local server.", "proxy");

	// Bridge packets between you & the already logged-in client
	bridgeClient.on("packet", (data, meta, rawData) => {
		bridge(rawData, meta, client);
	});

	// Start Mineflayer when disconnected
	bridgeClient.on("end", () => {
		logger.log("bridgeClient", bridgeClient.uuid + " has disconnected from the local server.", "proxy");
		startMineflayer();
	});

	stopMineflayer();
	conn.sendPackets(bridgeClient);
	conn.link(bridgeClient);
});

// ===================
// Create Ngrok Tunnel
// ===================

if (config.ngrok.active) {
	ngrok.createTunnel();
}

// ===========================
// Unclean Disconnect Detector
// ===========================

// If no packets are sent for 5 minutes, assume we were disconnected uncleanly.


// =========
// Functions
// =========

/** Reconnect (Remember to set up Nodemon or Forever or this will just cause the script to shut down!) */
function reconnect() {
	logger.log("proxy", "Reconnecting...", "proxy");
	notifier.updateSensitive("Reconnecting...");
	gui.display("restart", "Reconnecting in " + config.reconnectInterval + " seconds...");
	setTimeout(
		function() {
			server.close();
			client.end();
			conn.disconnect();
			gui.display("restart", "Reconnecting now!");
			notifier.sendToast("Reconnecting now!");
			notifier.sendWebhook({
				title: "Reconnecting now!",
				ping: true
			});
			gui.reset();
			process.exit(0); // Nodemon or Forever or whatever should handle the restart
		}, config.reconnectInterval * 1000
	);
}

/** Start Mineflayer modules */
function startMineflayer() {
	logger.log("mineflayer", "Starting Mineflayer.", "proxy");
	// meow
	gui.display("mineflayer", true);
}

/** Stop all Mineflayer modules */
function stopMineflayer() {
	logger.log("mineflayer", "Stopping Mineflayer.", "proxy");
	// woof
	gui.display("mineflayer", false);
}

/** Send packets from Point A to Point B */
function bridge(data, meta, dest) {
	if (meta.name !== "keep_alive" || meta.name !== "update_time") { // Keep-alive packets are filtered bc the client already handles them. Sending double would kick us.
		dest.writeRaw(data);
	}
}
