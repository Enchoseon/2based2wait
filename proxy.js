"use strict";
// =======
// Imports
// =======

const mcproxy = require("@rob9315/mcproxy");
const mc = require("minecraft-protocol");

const { config, status, updateCoordinatorStatus } = require("./util/config.js");
const logger = require("./util/logger.js");
const notifier = require("./util/notifier.js");
const gui = require("./util/gui.js");
const chatty = require("./util/chatty.js");
const ngrok = require("./util/ngrok.js");
const mineflayer = require("./util/mineflayer.js");

// ===========
// Global Vars
// ===========

var conn;
var client;
var server;

// ===========
// Start Proxy
// ===========

restartUncleanDisconnectMonitor();
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

	// Reset uncleanDisconnectMonitor timer
	restartUncleanDisconnectMonitor();
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
	mineflayer.initialize(conn.bot);
	server = mc.createServer({
		"online-mode": config.proxy.onlineMode,
		"encryption": true,
		"host": "localhost",
		"port": config.proxy.port,
		"version": config.server.version,
		"max-players": 1
	});

	// Delete any leftover coordinator.flag files
	if (config.coordination.active) {
		updateCoordinatorStatus();
	}

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
		if (packetMeta.name === "difficulty") { // Explanation: When rerouted by Waterfall, two MC|Brand packets are sent back-to-back followed by a difficulty packet. This statement ignores the first one, as it's just useless noise (it looks something like "Waterfall (git:Waterfall-Bootstrap:1.18-R0.1-SNAPSHOT:ba3bbcc:483)")
			const inQueue = (conn.bot.game.serverBrand === "Waterfall <- 2b2t-lobby");
			gui.display("inQueue", inQueue);
		}

		// Packet handler(s)
		packetHandler(packetData, packetMeta);

		// Update local server motd
		server.motd = "Position: " + status.position + " - ETA: " + status.eta;
		
		// Create ngrok tunnel
		if (config.ngrok.active) {
			ngrok.createTunnel();
		}
	});
}

// ============
// Local Server
// ============

// Handle logins
server.on("login", (bridgeClient) => {
	// Block attempt if...
	if (config.proxy.whitelist.findIndex(needle => bridgeClient.username.toLowerCase() === needle.toLowerCase()) === -1) { // ... player isn't in whitelist
		bridgeClient.end("Your account (" + bridgeClient.username + ") is not whitelisted.\n\nIf you're getting this error in error the Microsoft account token may have expired.");
		logger.log("bridgeclient", bridgeClient.uuid + " was denied connection to the local server.", "proxy");
		return;
	} else if (server.playerCount > 1) { // ... and another player isn't already connected
		bridgeClient.end("This proxy is at max capacity.\n\nCurrent Controller: " + status.controller);
		logger.log("bridgeclient", bridgeClient.uuid + " was denied connection to the local server.", "proxy");
		return;
	}

	// Log successful connection attempt
	logger.log("bridgeclient", bridgeClient.uuid + " has connected to the local server.", "proxy");
	gui.display("controller", bridgeClient.username);

	// Bridge packets between you & the already logged-in client
	bridgeClient.on("packet", (data, meta, rawData) => {
		bridge(rawData, meta, client);
	});

	// Start Mineflayer when disconnected
	bridgeClient.on("end", () => {
		logger.log("bridgeClient", bridgeClient.uuid + " has disconnected from the local server.", "proxy");
		gui.display("controller", "None");
		startMineflayer();
	});

	stopMineflayer();
	conn.sendPackets(bridgeClient);
	conn.link(bridgeClient);
});

// ==========================
// Unclean Disconnect Monitor
// ==========================

// If no packets are received for config.uncleanDisconnectInterval seconds, assume we were disconnected uncleanly.
var uncleanDisconnectMonitor;
// Reset uncleanDisconnectMonitor timer
function restartUncleanDisconnectMonitor() {
	clearTimeout(uncleanDisconnectMonitor)
	uncleanDisconnectMonitor = setTimeout(function () {
		logger.log("proxy", "No packets were received for " + config.uncleanDisconnectInterval + " seconds. Assuming unclean disconnect.", "proxy");
		reconnect();
	}, config.uncleanDisconnectInterval * 1000);
}

// =========
// Functions
// =========

/** Reconnect (Remember to read https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor or this will just cause the script to shut down!) */
function reconnect() {
	logger.log("proxy", "Reconnecting...", "proxy");
	gui.display("restart", "Reconnecting in " + config.reconnectInterval + " seconds...");
	gui.display("livechatRelay", "false");
	setTimeout(function() {
		gui.display("restart", "Reconnecting now!");
		notifier.sendToast("Reconnecting now!");
		process.exit(0);
	}, config.reconnectInterval * 1000);
}

/** Start Mineflayer */
function startMineflayer() {
	logger.log("mineflayer", "Starting Mineflayer.", "proxy");
	gui.display("mineflayer", true);
	if (config.mineflayer.active) {
		conn.bot.autoEat.enable();
		if (config.mineflayer.antiAfk.active) {
			conn.bot.afk.start();
		}
	}
}

/** Stop Mineflayer */
function stopMineflayer() {
	logger.log("mineflayer", "Stopping Mineflayer.", "proxy");
	gui.display("mineflayer", false);
	if (config.mineflayer.active) {
		conn.bot.autoEat.disable();
		if (config.mineflayer.antiAfk.active) {
			conn.bot.afk.stop();
		}
	}
}

/** Send packets from Point A to Point B */
function bridge(data, meta, dest) {
	if (meta.name !== "keep_alive" && meta.name !== "update_time") { // Keep-alive packets are filtered bc the client already handles them. Sending double would kick us.
		dest.writeRaw(data);
	}
}
