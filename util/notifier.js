// =======
// Imports
// =======

const fs = require("fs");

const toast = require("node-notifier");
const fetch = require("node-fetch");

const config = JSON.parse(fs.readFileSync("config.json"));

// =========
// Functions
// =========

/**
 * Send a toast
 * @param {string} titleText
 */
function sendToast(titleText) {
	toast.notify({
		"title": titleText,
		"message": " ",
		"subtitle": "2B Queue Tool",
		"icon": "null",
		"contentImage": "null",
		"sound": "ding.mp3",
		"wait": false
	});
}

/**
 * Send Discord webhook
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.description
 * @param {string} options.footer
 * @param {boolean} options.ping
 */
function sendWebhook(options) {
	var params = { // Create embed
		embeds: [
			{
				color: 0xcc0000,
				title: options.title,
				description: options.description,
				timestamp: new Date(),
				footer: {
					text: options.footer,
				},
				image: {
					url: null
				}
			}
		]
	}
	// Add Discord ping to description
	if (options.ping) {
		params.embeds[0].description += "<@" + config.discord.id + ">";
	}
	// Send embed
	fetch(options.url, {
		method: "POST",
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(params)
	}).then(res => {
		// meow
	})
}

/**
 * Update livechat webhook
 * @param {string} msg
 */
function updateLivechat(msg) {
	if (msg.length > 0) {
		sendWebhook({
			description: msg,
			url: config.discord.webhook.livechat
		});
	}
}

// =======
// Exports
// =======

module.exports = {
	sendToast,
	sendWebhook,
	updateLivechat
};
