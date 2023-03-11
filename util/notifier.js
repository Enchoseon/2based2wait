// =======
// Imports
// =======

const toast = require("node-notifier");
const fetch = require("node-fetch");

const { config, status } = require("./config.js");

// ===========
// Global Vars
// ===========

let deleteOnRestart = []; // Urls of messages to be deleted when restarting the proxy

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
		"subtitle": "2Based2Wait",
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
 * @param {string} options.category
 * @param {string} options.imageUrl
 * @param {boolean} options.deleteOnRestart
 */
function sendWebhook(options) {
	// Don't proceed if Discord webhooks are disabled in config.json
	if (!config.discord.active) {
		return;
	}

	// Create embed
	let params = {
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
	// Set author fields so that we know where each embed originated. If disabled, the only way to tell the source of a message (without checking logs) would be through embed color.
	if (!options.disableAttribution) {
		params.embeds[0].author = {
			"name": "Account: " + config.account.username,
			"icon_url": "https://minotar.net/helm/" + config.account.username + "/69.png"
		}
	}

	// Add Discord ping to message content
	if (options.ping) {
		params.content = " <@" + config.discord.id + ">";
	}

	// Add image to embed
	if (options.imageUrl) {
		params.embeds[0].image = {
			url: options.imageUrl,
		};
    }

	// Send embed (if no destination is provided, defaults to config.discord.webhook.spam)
	const webhookUrl = (config.discord.webhook[options.category] || config.discord.webhook.spam);
	fetch(webhookUrl + "?wait=true", {
		method: "POST",
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(params)
	}).then(response => {
		if (options.deleteOnRestart) {
			response.text().then(json => {
				deleteOnRestart.push(webhookUrl + "/messages/" + JSON.parse(json).id); // URL to send DELETE request to when restarting the proxy
			});
		}
	});
}

/** Delete webhook messages marked for deletion */
function deleteMarkedMessages() {
	deleteOnRestart.forEach(url => {
		fetch(url, {
			method: "DELETE",
			headers: {
				"Content-type": "application/json"
			}
		});
	});
}

// =======
// Exports
// =======

module.exports = {
	sendToast,
	sendWebhook,
	deleteMarkedMessages
};
