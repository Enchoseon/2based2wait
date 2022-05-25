// =======
// Imports
// =======

const { config, status, updateStatus } = require("./config.js");
const logger = require("./logger.js");
const notifier = require("./notifier.js");

// ===========
// Global Vars
// ===========

var sentNotification = false;

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
		console.log("\x1b[37m", "Current Controller: " + status.controller);
		console.log("\x1b[33m", "Current Queue Position: " + status.position);
		console.log("\x1b[33m", "ETA: " + status.eta);
		console.log("\x1b[33m", "Restart: " + status.restart);
		console.log("\x1b[35m", "In Queue Server: " + status.inQueue.toUpperCase());
		if (config.mineflayer.active) {
			console.log("\x1b[35m", "Mineflayer Running: " + status.mineflayer.toUpperCase());
		}
		if (config.coordination.active) {
			console.log("\x1b[32m", "Livechat Relay: " + status.livechatRelay.toUpperCase());
		}
		if (config.ngrok.active) {
			console.log("\x1b[32m", "Ngrok URL: " + status.ngrokUrl);
		}
		if (type === "inQueue" && input === false) { // The code in this janky statement runs one time when the proxy leaves queue.
			// Send notification when in server
			notifier.sendToast("In Server!");
			notifier.sendWebhook({
				title: "In Server!",
				description: "Current IP: `" + status.ngrokUrl + "`",
				ping: true,
				url: config.discord.webhook.sensitive
			});
		}

		// Log gui object
		logger.log("gui", status, "gui");
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
			if (status.inQueue === "true") { // If we're in queue
				const header = JSON.parse(packetData.header).extra;
				if (header && header.length === 6) {				
					const position = header[4].extra[0].text.replace(/\n/, "");
					const eta = header[5].extra[0].text.replace(/\n/, "");
					if (position !== status.position) { // Update position
						display("position", position);
						if (status.position <= config.queueThreshold) { // Position notifications on Discord
							notifier.sendToast("2B2T Queue Position: " + status.position);
							updatePositionWebhook();
							if (!sentNotification) {
								notifier.sendWebhook({
									title: "Position " + status.position + " in queue!",
									description: "Current IP: `" + status.ngrokUrl + "`",
									ping: true,
									url: config.discord.webhook.sensitive
								});
							}
							sentNotification = true;
						} else {
							updatePositionWebhook();
						}
					}
					// Update ETA
					display("eta", eta);
				}
			} else { // If we're not in queue
				display("position", "In Server!");
				display("eta", "Now!");
			}
			break;
		default:
			break;
	}
}

/**
 * Update position in webhook
 */
function updatePositionWebhook() {
	notifier.sendWebhook({
		title: "2B2T Queue Position: " + status.position,
		description: "ETA: " + status.eta,
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
