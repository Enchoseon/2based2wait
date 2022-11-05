// =======
// Imports
// =======

const fs = require("fs");

const { config, status, updateStatus } = require("./config.js");
const logger = require("./logger.js");
const notifier = require("./notifier.js");

const ChatMessage = require("prismarine-chat")(config.server.version);

// =========
// Functions
// =========

/**
 * Handle incoming chat packets
 * @param {object} packetData
 */
function chatPacketHandler(packetData) {
	// Parse chat messages
	const msgObj = JSON.parse(packetData.message);
	const msg = ChatMessage.fromNotch(msgObj).toString();

	// Notify about server restarts (haven't been tested in a long time due to restarts being less common)
	if (msg && msg.startsWith("[SERVER] Server restarting in ")) {
		let restart = msg.replace("[SERVER] Server restarting in ", "").replace(" ...", "");
		if (updateStatus("restart", restart)) {
			notifier.sendToast("Server Restart In: " + status.restart);
			notifier.sendWebhook({
				title: "Server Restart In: " + status.restart,
				ping: true,
				category: "spam"
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
				updateStatus("livechatRelay", "true");
			}
			// Relay livechat if this proxy is the designated livechat relayer
			if (status.livechatRelay === "true") {
				updateLivechatWebhook(msg);
			}
		} else {
			updateLivechatWebhook(msg);
		}
	} else {
		updateStatus("livechatRelay", "false");
	}

	// Log message
	logger.log("chat", msg, "chat");
}

/**
 * Update livechat webhook
 * @param {string} msg
 */
function updateLivechatWebhook(msg) {
	if (msg.trim().length > 0) {
		notifier.sendWebhook({
			"description": escapeMarkdown(msg),
			"category": "livechat",
			"disableAttribution": true
		});
	}
}

/** Escape Discord markdown and emojis (https://stackoverflow.com/a/39543625) */
function escapeMarkdown(text) {
	const unescaped = text.replace(/\\(\*|_|:|`|~|\\)/g, '$1'); // Unescape backslashed characters
	const escaped = unescaped.replace(/(\*|_|:|`|~|\\)/g, '\\$1'); // Escape *, _, :, `, ~, \
	return escaped;
}

// =======
// Exports
// =======

module.exports = {
	chatPacketHandler
};
