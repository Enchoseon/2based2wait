// =======
// Imports
// =======

const fs = require("fs");

const ngrokWrapper = require("ngrok");

const gui = require("./gui.js");
const notifier = require("./notifier.js");

const config = JSON.parse(fs.readFileSync("config.json"));

// =========
// Functions
// =========

/**
 * Create ngrok tunnel
 */
function createTunnel() {
	ngrokWrapper.connect({ // Get the URL
		proto: "tcp",
		addr: config.proxy.port,
		authtoken: config.ngrok.authtoken,
		region: config.ngrok.region,
	}).then((url) => {
		url = url.split(`tcp://`)[1];
		gui.data.ngrokUrl = url;
		notifier.updateSensitive("Ngrok Url: " + url);
	});
}

// =======
// Exports
// =======

module.exports = {
	createTunnel
};
