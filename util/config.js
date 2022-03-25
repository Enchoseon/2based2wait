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
	"inQueue": "false",
	"ngrokUrl": "None",
	"livechatRelay": "false"
};
var coordinatorStatus = {};

// ===============
// Process Configs
// ===============

config = JSON.parse(fs.readFileSync("config.json"));

if (config.coordination.active) {
	// Apply master config overrides
	const masterConfig = JSON.parse(fs.readFileSync(config.coordination.masterConfigPath));
	config = merge(config, masterConfig);
	// Get current coordinator JSON file
	coordinatorStatus = JSON.parse(fs.readFileSync(config.coordination.coordinatorPath));
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
		return true;
	}
	return false;
}

/**
 * Merge GUI object into coordinator JSON
 * @param {object} data
 */
function updateCoordinatorStatus(data) {
	if (config.coordination.active) {
		fs.readFile(config.coordination.coordinatorPath, (error, coordinatorData) => {
			if (error && error.code == "ENOENT") { // If coordinator json doesn't exist, default to empty object
				coordinatorData = {};
			} else if (!error) { // Otherwise, read the coordinator JSON
				coordinatorData = JSON.parse(coordinatorData);				
			} else {
				log("updateCoordinatorStatus", error, "error");
			}
			// Merge GUI data object with coordinatorData
			coordinatorData[config.account.username] = data;
			// Write to coordinator JSON and coordinatorStatus
			coordinatorStatus = coordinatorData;
			fs.writeFile(config.coordination.coordinatorPath, JSON.stringify(coordinatorData), (error) => {
				if (error) {
					log("updateCoordinatorStatus", error, "error");
				}
			});
		});
	}
}

// =======
// Exports
// =======

module.exports = {
	config,
	status,
	coordinatorStatus,
	updateStatus,
	updateCoordinatorStatus
};
