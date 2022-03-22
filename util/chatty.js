// =======
// Imports
// =======

const fs = require("fs");

const notifier = require("./notifier.js");
const gui = require("./gui.js");

const config = JSON.parse(fs.readFileSync("config.json"));

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

		// Notify about server restarts (haven't been tested in a long time due to restarts being less common)
		if (msgText && msgText.startsWith("[SERVER] Server restarting in ")) {
			var restart = msgText.replace("[SERVER] Server restarting in ", "").replace(" ...", "");
			if (restart !== gui.data.restart) {
				gui.display("restart", restart);
				notifier.sendToast("Server Restart In: " + gui.data.restart);
				notifier.sendWebhook({
					title: "Server Restart In: " + gui.data.restart,
					ping: true
				});
			}
		}

		if (gui.data.inQueue !== "true") {
			// Livechat webhook relay, if not in queue
			updateLivechatWebhook(msgUsername + " " + msgText);
		}
	}
}

/**
 * Update livechat webhook
 * @param {string} msg
 */
function updateLivechatWebhook(msg) {
	if (msg.length > 0) {
		notifier.sendWebhook({
			description: msg,
			url: config.discord.webhook.livechat
		});
	}
}

// =======
// Exports
// =======

module.exports = {
	packetHandler
};