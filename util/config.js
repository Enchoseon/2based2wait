// =======
// Imports
// =======

const fs = require("fs");

const merge = require("deepmerge");

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
	"livechatRelay": "false"
};

// =======================
// Process Config & Status
// =======================

config = JSON.parse(fs.readFileSync("config.json"));

if (config.coordination.active) {
	// Create coordination path folder(s) if it doesn't exist
	const dir = config.coordination.path;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true
		});
	}
	// Apply master-config.json overrides if provided
	const masterConfigPath = config.coordination.path + "master-config.json";
	if (fs.existsSync(masterConfigPath)) {
		const masterConfig = JSON.parse(fs.readFileSync(config.coordination.path + "master-config.json"));
		config = merge(masterConfig, config);
	}
}

// If server isn't 2b, default status.inQueue to false to fix bugs.
/*
if (config.server.host !== "connect.2b2t.org") {
	status.inQueue = "false";
}
*/

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
		if (fs.readFileSync(flagPath) === config.account.username) {
			fs.unlinkSync(flagPath);
		}
	}
}

// =======
// Exports
// =======

module.exports = {
	config,
	status,
	updateStatus
};
