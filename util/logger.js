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
		log(packetMeta.name + "meta", packetMeta, "packets");
		log(packetMeta.name + "data", packetData, "packets");
	}
}

/**
 * Write to a log file.
 * @param {string} name
 * @param {object} data
 * @param {object} category
 */
function log(name, data, category) {
	if (config.log.active) {
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
		stream.write("[" + getTimestamp() + "] [" + name.toUpperCase() + "] " + JSON.stringify(data) + "\n");
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

/**
 * Merge GUI object into coordinator JSON
 * @param {object} data
 */
function coordinator(data) {
	if (config.coordination.active) {
		fs.readFile(config.coordination.coordinatorPath, (error, coordinatorData) => {
			if (error && error.code == "ENOENT") { // If coordinator json doesn't exist, default to empty object
				coordinatorData = {};
			} else { // Otherwise, read the coordinator JSON
				coordinatorData = JSON.parse(coordinatorData);
			}
			// Merge GUI data object with coordinatorData
			coordinatorData[config.account.username] = data;
			// Write to coordinator JSON
			fs.writeFile(config.coordination.coordinatorPath, JSON.stringify(coordinatorData), (error) => {
				if (error) {
					log("coordinator", error, "error");
				}
			});
		});
	}
}

// =======
// Exports
// =======

module.exports = {
	packetHandler,
	log,
	getTimestamp,
	coordinator
};
