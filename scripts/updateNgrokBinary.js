// =======
// Imports
// =======

const os = require("os");
const downloadNgrok = require('ngrok/download');

// =============
// Update Binary
// =============

const arch = os.platform() + os.arch();
console.log("Downloading latest Ngrok binary for your architecture (" + arch + ")...")
downloadNgrok(callback, { ignoreCache: true });

// =========
// Functions
// =========

/**
 * Recieves empty msg from downloadNgrok when update completes with no errors, recieves error msg from downloadNgrok when something goes wrong.
 * @param {string} msg 
 */
function callback(msg) {
	if (msg) {
		console.error(msg);
	} else {
		console.log("Finished!")
	}
}