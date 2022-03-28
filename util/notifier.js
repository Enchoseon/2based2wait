// =======
// Imports
// =======

const toast = require("node-notifier");
const fetch = require("node-fetch");

const { config } = require("./config.js");

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
 * @param {boolean} options.disableAuthor
 * @param {boolean} options.ping
 */
function sendWebhook(options) {
	var params = { // Create embed
		embeds: [
			{
				"color": config.discord.color,
				"title": options.title,
				"description": options.description || "",
				"timestamp": new Date(),
				"footer": {
					"text": options.footer
				},
				"image": {
					"url": null
				}
			}
		]
	}
	// Set author fields
	if (!options.disableAuthor) {
		params.embeds[0].author = {
			"name": "Account: " + config.account.username,
			"icon_url": "https://minotar.net/helm/" + config.account.username + "/69.png"
		}
	}
	// Add Discord ping to description
	if (options.ping) {
		params.embeds[0].description += "<@" + config.discord.id + ">";
	}

	// Send embed (if no destination is provided, defaults to config.discord.webhook.position)
	fetch(options.url || config.discord.webhook.position, {
		method: "POST",
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(params)
	}).then(res => {
		// meow
	});
}

// =======
// Exports
// =======

module.exports = {
	sendToast,
	sendWebhook
};
