// =======
// Imports
// =======

const os = require("os");
const downloadNgrok = require("ngrok/download");

// =============
// Update Binary
// =============

const arch = os.platform() + os.arch();
console.log(`Downloading latest Ngrok binary for your architecture ("${arch}")...`);
downloadNgrok(callback, { ignoreCache: true });

// =========
// Functions
// =========

/**
 * Prints error message to console, or notifies the user that they successfully updated their Ngrok binary/
 * @param {string} msg Error message from downloadNgrok. Empty if there were no errors;
 */
function callback(msg) {
	if (msg) {
		console.error(msg);
	} else {
		console.log("Successfully updated Ngrok binary!");
	}
}