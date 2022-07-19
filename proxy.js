"use strict";
// =======
// Imports
// =======

const mcproxy = require("@rob9315/mcproxy");
const mc = require("minecraft-protocol");

const { config, status, updateStatus, updateCoordinatorStatus } = require("./util/config.js");
const logger = require("./util/logger.js");
const notifier = require("./util/notifier.js");
const chatty = require("./util/chatty.js");
const ngrok = require("./util/ngrok.js");
const mineflayer = require("./util/mineflayer.js");
const queue = require("./util/queue.js");

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
	// Log packets
	logger.packetHandler(packetData, packetMeta);
	
	// Assorted packet handlers
	switch (packetMeta.name) {
		case "chat": // Forward chat packets to chatty.js for livechat relay and reading server restart messages
			chatty.chatPacketHandler(packetData);
			break;
		case "difficulty": // Difficulty packet handler, checks whether or not we're in queue (explanation: when rerouted by Velocity, the difficulty packet is always sent after the MC|Brand packet.)
			queue.difficultyPacketHandler(packetData, conn);
			break;
		case "playerlist_header": // Playerlist packet handler, checks position in queue
			queue.playerlistHeaderPacketHandler(packetData, server);
		default:
			break;
	}

	// Reset uncleanDisconnectMonitor timer
	restartUncleanDisconnectMonitor();
}

// =================
// Start Proxy Stack
// =================

/** Start proxy stack */
function start() {
	logger.log("proxy", "Starting proxy stack.", "proxy");

	// Delete any leftover coordinator.flag files
	if (config.coordination.active) {
		updateCoordinatorStatus();
	}

	// Create local server
	createLocalServer();

	// Create client (connects to server)
	if (!config.waitForControllerBeforeConnect) { // ... but if waitForControllerBeforeConnect is true, delay the creation of the client until someone connects to the local server
		createClient();
	} else {
		console.log("Waiting for a controller...");
		if (config.ngrok.active) { // Create ngrok tunnel
			ngrok.createTunnel(); // Note: May overwrite MSA instructions in console(?)
		}
	}
}

// ==========================
// Client (Connect to Server)
// ==========================

function createClient() {
	console.log("Creating client (connecting to server)");
	logger.log("proxy", "Creating client.", "proxy");
	// Connect to server
	conn = new mcproxy.Conn({
		"host": config.server.host,
		"version": config.server.version,
		"username": config.account.username,
		"password": config.account.password,
		"auth": config.account.auth
	});
	client = conn.bot._client;
	mineflayer.initialize(conn.bot);

	// Log connect and start Mineflayer
	client.on("connect", function () {
		logger.log("connected", "Client connected", "proxy");
		startMineflayer();
		// Create ngrok tunnel (unless waitForControllerBeforeConnect is true, in which case the tunnel already exists)
		if (config.ngrok.active && !config.waitForControllerBeforeConnect) {
			ngrok.createTunnel();
		}
	});

	// Log disconnect
	client.on("disconnect", function (packet) {
		logger.log("disconnected", packet.reason, "proxy");
		reconnect();
	});

	// Log kick
	client.on("kick_disconnect", function (packet) {
		logger.log("kick/disconnect", packet.reason, "proxy");
		reconnect();
	});

	// Packet handlers
	client.on("packet", (packetData, packetMeta) => {
		packetHandler(packetData, packetMeta);
	});
}

// ============
// Local Server
// ============

/** Create the local server. Handles players connecting and also bridges packets to the client **/
function createLocalServer() {
	console.log("Creating local server");
	logger.log("proxy", "Creating local server.", "proxy");
	// Create server
	server = mc.createServer({
		"online-mode": config.proxy.onlineMode,
		"encryption": true,
		"host": "localhost",
		"port": config.proxy.port,
		"version": config.server.version,
		"max-players": 1
	});
	// Handle logins
	server.on("login", (bridgeClient) => {
		// Block attempt if...
		if (config.proxy.whitelist.findIndex(needle => bridgeClient.username.toLowerCase() === needle.toLowerCase()) === -1) { // ... player isn't in whitelist
			bridgeClient.end("Your account (" + bridgeClient.username + ") is not whitelisted.\n\nIf you're getting this error in error the Microsoft account token may have expired.");
			logSpam(bridgeClient.username + "(" + bridgeClient.uuid + ")" + " was denied connection to the proxy for not being whitelisted.");
			return;
		} else if (server.playerCount > 1) { // ... and another player isn't already connected
			bridgeClient.end("This proxy is at max capacity.\n\nCurrent Controller: " + status.controller);
			logSpam(bridgeClient.username + "(" + bridgeClient.uuid + ")" + " was denied connection to the proxy despite being whitelisted because " + status.controller + " was already in control.");
			return;
		}

		// Log successful connection attempt
		logSpam(bridgeClient.username + "(" + bridgeClient.uuid + ")" + " has connected to the proxy.");
		updateStatus("controller", bridgeClient.username);

		// Create client if it hasn't been created yet (waitForControllerBeforeConnect)
		if (config.waitForControllerBeforeConnect && typeof conn === "undefined") {
			bridgeClient.end("Received signal to connect to server. Reconnect to the proxy to play.");
			createClient();
		}

		// Start Mineflayer when disconnected
		bridgeClient.on("end", () => {
			logSpam(bridgeClient.username + "(" + bridgeClient.uuid + ")" + " has disconnected from the local server.");
			updateStatus("controller", "None");
			startMineflayer();
		});

		// Stop Mineflayer
		stopMineflayer();

		// Bridge packets
		bridgeClient.on("packet", (data, meta, rawData) => {
			bridge(rawData, meta, client);
		});
		conn.sendPackets(bridgeClient);
		conn.link(bridgeClient);

		/** Send message to logger and spam webhook **/
		function logSpam(logMsg) {
			logger.log("bridgeclient", logMsg, "proxy");
			notifier.sendWebhook({
				title: logMsg,
				url: config.discord.webhook.spam
			});
		}
	});
}

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
	notifier.sendWebhook({
		title: "Reconnecting...",
		url: config.discord.webhook.spam
	});
	updateStatus("restart", "Reconnecting in " + config.reconnectInterval + " seconds...");
	updateStatus("livechatRelay", "false");
	notifier.deleteMarkedMessages();
	setTimeout(function() {
		updateStatus("restart", "Reconnecting now!");
		notifier.sendToast("Reconnecting now!");
		process.exit(0);
	}, config.reconnectInterval * 1000);
}

/** Start Mineflayer */
function startMineflayer() {
	logger.log("mineflayer", "Starting Mineflayer.", "proxy");
	updateStatus("mineflayer", true);
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
	updateStatus("mineflayer", false);
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