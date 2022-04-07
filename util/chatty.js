// =======
// Imports
// =======

const fs = require("fs");

const { config, status } = require("./config.js");
const logger = require("./logger.js");
const notifier = require("./notifier.js");
const gui = require("./gui.js");

// =========
// Functions
// =========

/**
 * Handle incoming packets
 * @param {object} packetData
 * @param {object} packetMeta
 */
function packetHandler(packetData, packetMeta) {
	if (packetMeta.name === "chat") {
		// Parse chat messages
		var msgObj = JSON.parse(packetData.message);
		var msgUsername = msgObj.text || "";
		var msgText = "";
		if (msgObj.extra) { // Being incredibly careful and meandering about how I do this because I didn't read the protocol documentation
			msgObj.extra.forEach((extraObj) => {
				if (extraObj.text) {
					msgText += extraObj.text;
				}
			});
		}
		const msg = msgUsername + " " + msgText;

		// Notify about server restarts (haven't been tested in a long time due to restarts being less common)
		if (msgText && msgText.startsWith("[SERVER] Server restarting in ")) {
			var restart = msgText.replace("[SERVER] Server restarting in ", "").replace(" ...", "");
			if (restart !== status.restart) {
				gui.display("restart", restart);
				notifier.sendToast("Server Restart In: " + status.restart);
				notifier.sendWebhook({
					title: "Server Restart In: " + status.restart,
					ping: true,
					url: config.discord.webhook.position
				});
			}
		}

		// Livechat webhook relay, if not in queue.
		if (status.inQueue === "false") {
			// If coordination is active...
			if (config.coordination.active) {
				// If no proxy in the pool is the designated livechat relayer, make this one the one
				const flagPath = config.coordination.path + "coordinator.flag";
				if (status.livechatRelay === "false" && !fs.existsSync(flagPath)) {
					gui.display("livechatRelay", "true");
				}
				// Relay livechat if this proxy is the designated livechat relayer
				if (status.livechatRelay === "true") {
					updateLivechatWebhook(msg);
				}
			} else {
				updateLivechatWebhook(msg);
			}
		} else {
			gui.display("livechatRelay", "false");
		}

		// Log message
		logger.log("chat", msg, "chat");
	}
}

/**
 * Update livechat webhook
 * @param {string} msg
 */
function updateLivechatWebhook(msg) {
	if (msg.trim().length > 0) {
		notifier.sendWebhook({
			"description": msg,
			"url": config.discord.webhook.livechat,
			"footer": {
				"text": "Controller: " + status.controller
			},
			"subtleAttribution": true
		});
	}
}

// =======
// Exports
// =======

module.exports = {
	packetHandler
};
