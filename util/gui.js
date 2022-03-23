// =======
// Imports
// =======

const fs = require("fs");

const logger = require("./logger.js");
const notifier = require("./notifier.js");

const config = JSON.parse(fs.readFileSync("config.json"));

// ===========
// Global Vars
// ===========

// GUI
var data = {
	"position": "CHECKING...",
	"eta": "CHECKING...",
	"restart": "None",
	"mineflayer": "CHECKING...",
	"inQueue": "false",
	"ngrokUrl": "None",
};
var dataDefault = data;

// =========
// Functions
// =========

/**
 * Display a basic CLI GUI
 * @param {string} type
 * @param {string} input
 */
function display(type, input) {
	if (data[type] !== input.toString()) { // Only continue if input being received is different from what's already stored in "data".
		data[type] = input.toString(); // Store input in "data"
		console.clear();
		console.log("\x1b[36m", `
88888                               88888
    8 88888  88888 88888 8888 88888     8 e  e  e 88888 8 88888
    8 8   8  8   8 8     8    88  8     8 8  8  8 8   8 8   8
88888 888888 88888 88888 8888 8   8 88888 8  8  8 88888 8   8
8     8    8 8   8     8 8    88  8 8     8  8  8 8   8 8   8
88888 888888 8   8 88888 8888 88888 88888 8888888 8   8 8   8
		`);
		console.log("\x1b[30m", "Enchoseon#1821 was here!");
		console.log("\x1b[33m", "Last Update: [" + logger.getTimestamp() + "]");
		console.log("\x1b[33m", "Account: " + config.account.username);
		console.log("\x1b[33m", "Current Queue Position: " + data.position);
		console.log("\x1b[33m", "ETA: " + data.eta);
		console.log("\x1b[33m", "Restart: " + data.restart);
		console.log("\x1b[35m", "Mineflayer Running: " + data.mineflayer.toUpperCase());
		console.log("\x1b[35m", "In Queue Server: " + data.inQueue.toUpperCase());
		if (config.ngrok.active) {
			console.log("\x1b[35m", "Ngrok URL: " + data.ngrokUrl);
		}

		logger.log("gui", data);
	}
}

/** Reset CLI GUI */
function reset() {
	data = dataDefault;
}

/**
 * Handle incoming packets
 * @param {object} packetData
 * @param {object} packetMeta
 */
function packetHandler(packetData, packetMeta) {
	switch (packetMeta.name) {
		case "playerlist_header": // Handle playerlist packets
			if (data.inQueue === "true") { // Check if in server
				const header = JSON.parse(packetData.header).text.split("\n");
				const position = header[5].split("l")[1];
				const eta = header[6].split("l")[1];

				if (position !== data.position) { // Update position
					display("position", position);
					if (data.position <= config.queueThreshold) { // Position notifications on Discord
						notifier.sendToast("2B2T Queue Position: " + data.position);
						updatePositionWebhook(true);
					} else {
						updatePositionWebhook(false);
					}
				}
				// Update ETA
				display("eta", eta);
			} else {
				display("position", "In Server!");
				display("eta", "Now!");
			}
			break;
		default:
			break;
	}
}

/**
 * Update position in CLI GUI & webhook
 * @param {boolean} ping
 */
function updatePositionWebhook(ping) {
	notifier.sendWebhook({
		title: "2B2T Queue Position: " + data.position,
		ping: ping,
		footer: "ETA: " + data.eta,
		url: config.discord.webhook.position
	});
}

// =======
// Exports
// =======

module.exports = {
	data,
	display,
	reset,
	packetHandler
};
