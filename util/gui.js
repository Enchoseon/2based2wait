// =======
// Imports
// =======

const { config, status, updateStatus, updateCoordinatorStatus } = require("./config.js");
const logger = require("./logger.js");
const notifier = require("./notifier.js");

// =========
// Functions
// =========

/**
 * Display a basic CLI GUI
 * @param {string} type
 * @param {string} input
 */
function display(type, input) {
	// Update status object and only continue if input being received is different from what's already stored in "status".
	if (updateStatus(type, input)) {
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
		console.log("\x1b[37m", "Last Update: [" + logger.getTimestamp() + "]");
		console.log("\x1b[37m", "Account: " + config.account.username);
		console.log("\x1b[33m", "Current Queue Position: " + status.position);
		console.log("\x1b[33m", "ETA: " + status.eta);
		console.log("\x1b[33m", "Restart: " + status.restart);
		console.log("\x1b[35m", "Mineflayer Running: " + status.mineflayer.toUpperCase());
		console.log("\x1b[35m", "In Queue Server: " + status.inQueue.toUpperCase());
		if (config.ngrok.active) {
			console.log("\x1b[32m", "Ngrok URL: " + status.ngrokUrl);
		}
		if (config.coordination.active) {
			console.log("\x1b[32m", "Livechat Relay: " + status.livechatRelay.toUpperCase());
		}

		// Log gui object
		logger.log("gui", status, "gui");
		updateCoordinatorStatus(status);
	} else {
		logger.log("gui", "updateStatus() failed for: " + type + ", " + input, "error");
	}
}

/**
 * Handle incoming packets
 * @param {object} packetData
 * @param {object} packetMeta
 */
function packetHandler(packetData, packetMeta) {
	switch (packetMeta.name) {
		case "playerlist_header": // Handle playerlist packets
			if (status.inQueue === "true") { // Check if in server
				const header = JSON.parse(packetData.header).text.split("\n");
				const position = header[5].split("l")[1];
				const eta = header[6].split("l")[1];

				if (position !== status.position) { // Update position
					display("position", position);
					if (status.position <= config.queueThreshold) { // Position notifications on Discord
						notifier.sendToast("2B2T Queue Position: " + status.position);
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
		title: "2B2T Queue Position: " + status.position,
		ping: ping,
		footer: "ETA: " + status.eta,
		url: config.discord.webhook.position
	});
}

// =======
// Exports
// =======

module.exports = {
	display,
	packetHandler
};
