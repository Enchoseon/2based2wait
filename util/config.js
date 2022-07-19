// =======
// Imports
// =======

const fs = require("fs");

const merge = require("deepmerge");
const JSON5 = require("json5");

// ===========
// Global Vars
// ===========

var config = {};
var status = {
	"position": "CHECKING...",
	"eta": "CHECKING...",
	"restart": "None",
	"mineflayer": "CHECKING...",
	"inQueue": "true",
	"ngrokUrl": "None",
	"livechatRelay": "false",
	"controller": "None"
};

// =======================
// Process Config & Status
// =======================

// Read config.json
config = JSON5.parse(fs.readFileSync("config.json"));

// If coordination is active...
if (config.coordination.active) {
	// ... create coordination path folder(s) if it doesn't exist
	const dir = config.coordination.path;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true
		});
	}
	// ... and apply master-config.json overrides if provided
	const masterConfigPath = config.coordination.path + "master-config.json";
	if (fs.existsSync(masterConfigPath)) {
		const masterConfig = JSON5.parse(fs.readFileSync(masterConfigPath));
		config = merge(masterConfig, config);
	}
}

// =========
// Functions
// =========

/**
 * Update status object. Returns whether the input being received is different from what's already stored in the object.
 * @param {string} type
 * @param {string} input
 */
function updateStatus(type, input) {
	if (status[type] !== input.toString()) {
		status[type] = input.toString();
		if (config.coordination.active && type === "livechatRelay") { // Update coordinator status if livechatRelay changes
			updateCoordinatorStatus();
		}
		updateGui();
		// logger.log("status", status, "status");
		return true;
	}
	return false;
}

/**
 * Update proxy coordinator status
 */
function updateCoordinatorStatus() {
	// Add or remove the flag
	const flagPath = config.coordination.path + "coordinator.flag";
	if (status.livechatRelay === "true") {
		fs.writeFile(flagPath, config.account.username, (error) => {
			if (error) {
				// logger.log("updateCoordinatorStatus", error, "error");
			}
		});
	} else {
		// Check if the flag is assigned to this proxy
		if (fs.existsSync(flagPath) && fs.readFileSync(flagPath).toString() === config.account.username) {
			fs.unlinkSync(flagPath);
		}
	}
}

/**
 * Display a basic CLI GUI
 */
function updateGui() {
	// Cli GUI
	console.clear();
	console.log("\x1b[36m", `
88888                               88888
    8 88888  88888 88888 8888 88888     8 e  e  e 88888 8 88888
    8 8   8  8   8 8     8    88  8     8 8  8  8 8   8 8   8
88888 888888 88888 88888 8888 8   8 88888 8  8  8 88888 8   8
8     8    8 8   8     8 8    88  8 8     8  8  8 8   8 8   8
88888 888888 8   8 88888 8888 88888 88888 8888888 8   8 8   8
	`);
	console.log("\x1b[30m", "Enchoseon#1821 was here!");
	console.log("\x1b[37m", "Last Update: [" + getTimestamp() + "]");
	console.log("\x1b[37m", "Account: " + config.account.username);
	console.log("\x1b[37m", "Current Controller: " + status.controller);
	console.log("\x1b[33m", "Current Queue Position: " + status.position);
	console.log("\x1b[33m", "ETA: " + status.eta);
	console.log("\x1b[33m", "Restart: " + status.restart);
	console.log("\x1b[35m", "In Queue Server: " + status.inQueue.toUpperCase());
	if (config.mineflayer.active) {
		console.log("\x1b[35m", "Mineflayer Running: " + status.mineflayer.toUpperCase());
	}
	if (config.coordination.active) {
		console.log("\x1b[32m", "Livechat Relay: " + status.livechatRelay.toUpperCase());
	}
	if (config.ngrok.active) {
		console.log("\x1b[32m", "Ngrok URL: " + status.ngrokUrl);
	}
}

/**
 * Get current timestamp
 */
function getTimestamp(includeTime) {
	var timestamp = new Date();
	timestamp = timestamp.toLocaleString();
	return timestamp.replace(/\//g, "-") // Replace forward-slash with hyphen
					.replace(",", ""); // Remove comma
}

// =======
// Exports
// =======

module.exports = {
	config,
	status,
	updateStatus,
	updateCoordinatorStatus
};
