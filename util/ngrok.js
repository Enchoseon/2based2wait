// =======
// Imports
// =======

const fs = require("fs");

const ngrokWrapper = require("ngrok");

const { config } = require("./config.js");
const logger = require("./util/logger.js");
const notifier = require("./util/notifier.js");
const gui = require("./util/gui.js");

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
			logger.log("updateCoordinatorStatus", error, "error");
			return;
		}

		ngrokWrapper.connect({
			proto: "tcp",
			addr: config.proxy.port,
			region: config.ngrok.region,
			configPath: "./ngrok.yml"
		}).then(url => {
			url = url.split(`tcp://`)[1];
			gui.display("ngrokUrl", url);
			notifier.updateSensitive("Current IP: `" + url + "`");
		}).catch(error => {
			console.error(error);
		});
	});
}

// =======
// Exports
// =======

module.exports = {
	createTunnel
};
