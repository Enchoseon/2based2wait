// =======
// Imports
// =======

const fs = require("fs");

const { config } = require("./config.js");

// ===========
// Global Vars
// ===========

var logIndex = 1;
const logRandomEnumerator = String(Math.random()).replace(".", "");

// =========
// Functions
// =========

/**
 * Filter & log incoming packets from the server or bridgeClient
 * @param {object} packetData
 * @param {object} packetMeta
 * @param {string} source
 */
function packetHandler(packetData, packetMeta, category) {
	var filter = [];
	if (config.log.packetFilters[category].indexOf(packetMeta.name) === -1) { // Don't log filtered packets
		log(packetMeta.name + "meta", packetMeta, category + "Packets");
		log(packetMeta.name + "data", packetData, category + "Packets");
	}
}

/**
 * Write to a log file.
 * @param {string} name
 * @param {object} data
 * @param {object} category
 */
function log(name, data, category) {
	// Don't proceed if logging is disabled
	if (!config.log.active) {
		return;
	}
	// Create log folder if it doesn't exist
	const dir = "./log/" + category + "/";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true
		});
	}
	// Create file name
	var logFile = dir + category + "_" + getTimestamp(true) + "_" + logRandomEnumerator + "_" + logIndex + ".log";
	// Write to log
	var stream = fs.createWriteStream(logFile, {
		flags: "a"
	});
	stream.write("[" + getTimestamp() + "] [" + name + "] " + JSON.stringify(data) + "\n");
	stream.end();
	// Increment filename if size is too big
	fs.stat(logFile, (err, stats) => {
		if (!err) { // ez error handling
			if (stats.size >= config.log.cutoff * 1000) {
				logIndex++;
			}
		}
	});
}

/**
 * Get current timestamp
 * @param {boolean} includeTime
 */
function getTimestamp(includeTime) {
	var timestamp = new Date();
	if (includeTime) {
		timestamp = timestamp.toLocaleDateString();
	} else {
		timestamp = timestamp.toLocaleString();
	}
	return timestamp.replace(/\//g, "-") // Replace forward-slash with hyphen
					.replace(",", ""); // Remove comma
}

// =======
// Exports
// =======

module.exports = {
	packetHandler,
	log,
	getTimestamp
};
