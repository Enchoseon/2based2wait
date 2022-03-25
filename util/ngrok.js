// =======
// Imports
// =======

const ngrokWrapper = require("ngrok");

const { config, status } = require("./config.js");
const notifier = require("./notifier.js");

// =========
// Functions
// =========

/**
 * Create ngrok tunnel
 */
function createTunnel() {
	ngrokWrapper.connect({
		proto: "tcp",
		addr: config.proxy.port,
		authtoken: config.ngrok.authtoken,
		region: config.ngrok.region,
	}).then((url) => {
		url = url.split(`tcp://`)[1];
		status.ngrokUrl = url;
		notifier.updateSensitive("Current IP: `" + url + "`");
	});
}

// =======
// Exports
// =======

module.exports = {
	createTunnel
};
