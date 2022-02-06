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
	"inQueue": false
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
	if (eval("data." + type + " !== `" + input + "`")) { // Jankus maximus
		eval("data." + type + " = `" + input + "`");
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
		console.log("\x1b[33m", "Current Queue Position: " + data.position);
		console.log("\x1b[33m", "ETA: " + data.eta);
		console.log("\x1b[33m", "Restart: " + data.restart);
		console.log("\x1b[35m", "Mineflayer Running: " + data.mineflayer.toUpperCase());
		console.log("\x1b[35m", "In Queue Server: " + data.inQueue.toString().toUpperCase());

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
			if (data.inQueue) { // Check if in server
				const header = JSON.parse(packetData.header).text.split("\n");
				const position = header[5].split("l")[1];
				const eta = header[6].split("l")[1];
				if (position !== data.position) { // Position
					display("position", position);
					if (data.position <= config.queueThreshold) { // Notifications
						notifier.sendToast("2B2T Queue Position: " + data.position);
						updatePosition(true);
					} else {
						updatePosition(false);
					}
				}
				if (eta !== data.eta) { // ETA
					display("eta", eta);
				}
			} else {
				var position = "In Server!";
				var eta = "Now!";
				if (data.position !== position) {
					display("position", "In Server!");
				}
				if (data.eta !== eta) {
					display("eta", "Now!");
				}
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
function updatePosition(ping) {
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
