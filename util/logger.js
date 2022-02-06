// =======
// Imports
// =======

const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json"));

// ===========
// Global Vars
// ===========

var logIndex = 1;
var logHashCode = String(Math.random()).replace(".", "");

// =========
// Functions
// =========

/**
 * Filter & log incoming packets
 * @param {object} packetData
 * @param {object} packetMeta
 */
function packetHandler(packetData, packetMeta) {
	if (config.log.active) {
		const filter = config.log.filter;
		for (var i = 0; i < filter.length; i++) {
			if (packetMeta.name === filter[i]) {
				return;
			}
		}
		log("packet" + packetMeta.name + "meta", packetMeta);
		log("packet" + packetMeta.name + "data", packetData);
	}
}

/**
 * Write to a log file
 * @param {string} category
 * @param {object} data
 */
function log(category, data) {
	if (config.log.active) {
		// Create file name
		var logFile = "log/2based2wait_" + getTimestamp(true) + "_" + logHashCode + "_" + logIndex + ".log";
		// Write to log
		var stream = fs.createWriteStream(logFile, {
			flags: "a"
		});
		stream.write("[" + getTimestamp() + "] [" + category.toUpperCase() + "] " + JSON.stringify(data) + "\n");
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
