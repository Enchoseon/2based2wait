// =======
// Imports
// =======

const { config, status, updateStatus } = require("./config.js");
const notifier = require("./notifier.js");

// ===========
// Global Vars
// ===========

let sentNotification = false;

// =========
// Functions
// =========

/**
 * Difficulty packet handler, checks whether or not we're in queue (explanation: when rerouted by Velocity, the difficulty packet is always sent after the MC|Brand packet.)
 */
function difficultyPacketHandler(packetData, conn) {
	const inQueue = (conn.bot.game.serverBrand === "2b2t (Velocity)") && (conn.bot.game.dimension === "minecraft:end") && (packetData.difficulty === 1);
	if (updateStatus("inQueue", inQueue) && inQueue === false && config.notify.whenJoining) { // Send notification when joining server
		notifier.sendToast("In Server!");
		notifier.sendWebhook({
			title: "In Server!",
			description: "Current IP: `" + status.ngrokUrl + "`",
			ping: true,
			category: "status",
			deleteOnRestart: true
		});
	}
}

/**
 * Playerlist packet handler, checks position in queue
 */
function playerlistHeaderPacketHandler(packetData, server) {
	// If no longer in queue, stop here
	if (status.inQueue === "false") {
		updateStatus("position", "In Server!");
		updateStatus("eta", "Now!");
		return;
	}
	// Parse header packets
	const header = JSON.parse(packetData.header).extra;
	if (header && header.length === 6) {				
		const position = header[4].extra[0].text.replace(/\n/, "");
		const eta = header[5].extra[0].text.replace(/\n/, "");
		// Update position
		if (updateStatus("position", position)) {
			// Update local server motd
			server.motd = "Position: " + status.position + " - ETA: " + status.eta;
			if (status.position <= config.queueThreshold) { // Position notifications on Discord (status webhook)
				notifier.sendToast("2B2T Queue Position: " + status.position);
				notifier.sendWebhook({
					title: "2B2T Queue Position: " + status.position,
					description: "ETA: " + status.eta,
					category: "spam"
				});
				if (!sentNotification && config.notify.whenBelowQueueThreshold) {
					notifier.sendWebhook({
						title: "Position " + status.position + " in queue!",
						description: "Current IP: `" + status.ngrokUrl + "`",
						ping: true,
						category: "status",
						deleteOnRestart: true
					});
				}
				sentNotification = true;
			} else { // Position notifications on Discord (spam webhook)
				notifier.sendWebhook({
					title: "2B2T Queue Position: " + status.position,
					description: "ETA: " + status.eta,
					category: "spam"
				});
			}
		}
		// Update ETA
		updateStatus("eta", eta);
	}
}

// =======
// Exports
// =======

module.exports = {
	difficultyPacketHandler,
	playerlistHeaderPacketHandler
};
