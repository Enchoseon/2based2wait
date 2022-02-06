// =======
// Imports
// =======

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
		var msgUsername = "";
		var msgText = "";
		if (msgObj.text) {
			msgUsername += msgObj.text;
		}
		if (msgObj.extra) {
			msgObj.extra.forEach((extraObj) => {
				if (extraObj.text) {
					msgText += extraObj.text;
				}
			});
		}

		// Notify about server restarts
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

		// Livechat webhook relay, if not in queue
		if (!gui.data.inQueue) {
			notifier.updateLivechat(msgUsername + " " + msgText);
		}
	}
}

// =======
// Exports
// =======

module.exports = {
	packetHandler
};