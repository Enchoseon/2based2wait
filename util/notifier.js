// =======
// Imports
// =======

const fs = require("fs");

const notifier = require("node-notifier");
const fetch = require("node-fetch");

const gui = require("./gui.js");

const config = JSON.parse(fs.readFileSync("config.json"));

// =========
// Functions
// =========

// Send a toast
function sendToast(titleText) {
	notifier.notify({
		"title": titleText,
		"message": " ",
		"subtitle": "2B Queue Tool",
		"icon": "null",
		"contentImage": "null",
		"sound": "ding.mp3",
		"wait": false
	});
}

// Send message to a Discord webhook
function sendWebhook(options) {
	var params = { // Create the base embed
		embeds: [
			{
				color: 0xcc0000,
				title: "2B2T Queue Position: " + gui.data.position,
				timestamp: new Date(),
				footer: {
					text: "ETA: " + gui.data.eta,
				},
				image: {
					url: null
				}
			}
		]
	}
	if (options.ping) { // ping on Discord
		params.embeds[0].description = "<@" + config.discord.id + ">";
	} else {
		params.embeds[0].description = " ";
	}
	if (options.titleOverride !== undefined) { // override title
		params.embeds[0].title = options.titleOverride;
	}
	// Send the final embed to the webhook
	fetch(config.discord.webhookURL, {
		method: "POST",
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(params)
	}).then(res => {
		// meow
	})
}

// =======
// Exports
// =======

module.exports = {
	sendToast,
	sendWebhook
};