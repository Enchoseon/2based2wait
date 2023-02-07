// =======
// Imports
// =======

const fs = require("fs");

const ngrokWrapper = require("ngrok");

const { config, updateStatus } = require("./config.js");
const logger = require("./logger.js");
const notifier = require("./notifier.js");

// =========
// Functions
// =========

/**
 * Create ngrok tunnel
 */
function createTunnel() {
	// Create ngrok.yml for the authtoken (using the wrapper causes issues when running multiple tunnels, as it isn't an officially supported thing)
	const data = "authtoken: " + config.ngrok.authtoken;
	fs.writeFile("./ngrok.yml", data, (error) => {
		if (error) {
			logger.log("createTunnel", error, "error");
			return;
		}
		// Create tunnel
		ngrokWrapper.connect({
			proto: "tcp",
			addr: config.proxy.port,
			region: config.ngrok.region,
			configPath: "./ngrok.yml"
		}).then(url => {
			url = url.split("tcp://")[1];
			updateStatus("ngrokUrl", url); // Update cli gui and webhook
			notifier.sendWebhook({
				title: "New Tunnel:",
				description: "Current IP: `" + url + "`",
				category: "spam"
			});
			if (config.waitForControllerBeforeConnect) { // Since the client isn't connected we'll need to send the tunnel IP to the status webhook (normally the tunnel IP would be sent to the status webhook after going under the queueThreshold and joining the server)
				notifier.sendWebhook({
					title: "Current Tunnel:",
					description: "Current IP: `" + url + "`",
					category: "status",
					deleteOnRestart: true
				});
			}
		}).catch(error => {
			logger.log("createTunnel", error, "error");
		});
	});
}

// =======
// Exports
// =======

module.exports = {
	createTunnel
};
