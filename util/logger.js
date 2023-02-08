// =======
// Imports
// =======

const fs = require("fs");
const zlib = require("zlib");

const { config } = require("./config.js");

// ===========
// Global Vars
// ===========

let logFiles = {};

// ===================
// Initialize Logfiles
// ===================

// Create the directories and plan which logfiles to write to
for (const category in config.log.active) {
	if (!config.log.active[category]) { // Don't proceed if logging category is disabled in config.json
		return;
	}
	const dir = createDirectory(category); // Create directory for category if it doesn't exist
	const files = fs.readdirSync(dir, { // Get all files in the directory with the correct extension (either .log.gz or .log)
		"withFileTypes": true
	}).filter(f => {
		if (config.log.compression.active) {
			return f.name.endsWith(".log.gz");
		} else {
			return f.name.endsWith(".log");
		}
	});
	let file = findExisting(dir, category, files); // Pick a filename (either a valid existing one or a new one)
	if (!file || config.log.alwaysIncrement) {
		file = createFilename(category, files.length + 1);
	}
	logFiles[category] = dir + file; // Push file path to logFiles
}

// =========
// Functions
// =========

/**
 * Filter & log incoming packets from the server or bridgeClient
 * @param {object} packetData Packet data
 * @param {object} packetMeta Packet metadeta
 * @param {string} category Log category
 */
function packetHandler(packetData, packetMeta, category) {
	if (config.log.packetFilters[category].indexOf(packetMeta.name) === -1) { // Don't log filtered packets
		log(packetMeta.name, packetData, category + "Packets");
	}
}

/**
 * Write to a log file.
 * @param {string} name The name of the entry
 * @param {object} data The data to log
 * @param {string} category The category to log this under
 */
function log(name, data, category) {
	// Don't proceed if logging category is disabled in config.json
	if (!config.log.active[category]) {
		return;
	}
	// Create file name
	createDirectory(category);
	let logFile = logFiles[category];
	// Create log message
	const logMessage = "[" + getTimestamp() + "] [" + name + "] " + JSON.stringify(data) + "\n";
	// Write to log (either gzipped or raw)
	let stream = fs.createWriteStream(logFile, {
		flags: "a"
	});
	if (config.log.compression.active) {
		stream.write(zlib.gzipSync(logMessage, { // Save Gzipped
			"level": config.log.compression.level,
			"memLevel": config.log.compression.memLevel,
			"windowBits": config.log.compression.windowBits,
			"strategy": 1,
		}));
	} else {
		stream.write(logMessage); // Save raw
	}
	stream.end();
}

/**
 * Create a directory if it doesn't exist (in "./log/${category}/"). Also makes sure that logs from mocha tests don't contaminate normal logs.
 * @param {string} category The category to write logs to
 * @returns {string} Path to the created directory
 */
function createDirectory(category) {
	// Choose the directory
	let dir = "./log/" + category + "/";
	if (process.env.CI) { // (Change to a test directory if being ran by mocha.)
		dir = "./test/log/" + category + "/";
	}
	// Create directory if it doesn't exist
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			"recursive": true
		});
	}
	return dir;
}

/**
 * Return a filename for a log category.
 * @param {string} category The category of the log file
 * @param {number} index The index of the log file
 * @returns {string} The created filename
 */
function createFilename(category, index) {
	let filename = category + "_" + index + ".log";
	if (config.log.compression.active) {
		filename += ".gz";
	}
	return filename;
}

/**
 * Returns a filename of the most recent and valid log to continue using.
 * @param {string} dir Directory of log folder
 * @param {string} category Category of the log to look for
 * @param {Array} files All valid files in the directory
 * @returns {string} Filename of the most recent and valid log to continue writing to (returns false otherwise)
 */
function findExisting(dir, category, files) {
	for (let i = files.length - 1; i >= 0; i--) {
		const file = files[i].name;
		// Check if there's an existing log file to reuse and whether it has enough space to write to
		if (file === createFilename(category, files.length) && fs.existsSync(dir) && fs.statSync(dir + file).size < config.log.cutoff * 1000) {
			return file;
		}
	}
	return false;
}

/**
 * Get current timestamp
 * @param {boolean} includeTime Whether to include the Date String
 * @returns {string} Human-readable timestamp
 */
function getTimestamp(includeTime) {
	let timestamp = new Date();
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
