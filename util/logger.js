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

// Filter & log packets
function packetHandler(meta, data) {
	if (config.log.active) {
		const filter = config.log.filter;
		for (var i = 0; i < filter.length; i++) {
			if (meta.name === filter[i]) {
				return;
			}
		}
		log("packet" + meta.name + "meta", meta);
		log("packet" + meta.name + "data", data);
	}
}

// Write to a log file
function log(prefix, msg) {
	if (config.log.active) {
		// Create file name
		var date = new Date();
		var logFile = "log/2based2wait_" + date.getYear() + "-" + date.getMonth() + "-" + date.getDay() + "_" + logHashCode + "_" + logIndex + ".log";
		// Write to log
		var stream = fs.createWriteStream(logFile, { flags: "a" });
		stream.write("[" + getTimestamp("-") + "] [" + prefix.toUpperCase() + "] " + JSON.stringify(msg) + "\n");
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

// Get current timestamp
function getTimestamp(separator) {
	var date = new Date();
	return date.getHours() + separator + date.getMinutes() + separator + date.getSeconds();
}

// =======
// Exports
// =======

module.exports = {
	packetHandler,
	log,
	getTimestamp
};