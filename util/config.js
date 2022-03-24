// =======
// Imports
// =======

const fs = require("fs");

// ===========
// Global Vars
// ===========

var config = {};

// ==============
// Process Config
// ==============

config = JSON.parse(fs.readFileSync("config.json"));

if (config.coordination.active) {
	const masterConfig = JSON.parse(fs.readFileSync(config.coordination.masterConfigPath));
	Object.assign(config, masterConfig);
}

// =======
// Exports
// =======

module.exports = {
	config
};
