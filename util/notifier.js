// =======
// Imports
// =======

const toast = require("node-notifier");
const fetch = require("node-fetch");

const { config, status } = require("./config.js");

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
 * @param {boolean} options.disableAttribution
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
				"image": {
					"url": null
				}
			}
		]
	}
	// If someone is controlling the bot add that to the embed
	if (status.controller !== "None") {
		params.embeds[0].footer = {
			"text": "Controller: " + status.controller
		}
	}
	// Set author fields so that we know where each embed came from
	if (!options.disableAttribution) {
		params.embeds[0].author = {
			"name": "Account: " + config.account.username,
			"icon_url": "https://minotar.net/helm/" + config.account.username + "/69.png"
		}
	}
	// Add Discord ping to description
	if (options.ping) {
		params.embeds[0].description += " <@" + config.discord.id + ">";
	}

	// Send embed (if no destination is provided, defaults to config.discord.webhook.spam)
	fetch(options.url || config.discord.webhook.spam, {
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
