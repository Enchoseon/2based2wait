// =======
// Imports
// =======

const fs = require("fs");

const merge = require("deepmerge");

// ===========
// Global Vars
// ===========

var config = {};

// ==============
// Process Config
// ==============

config = JSON.parse(fs.readFileSync("config.json"));

// Apply overrides
if (config.coordination.active) {
	const masterConfig = JSON.parse(fs.readFileSync(config.coordination.masterConfigPath));
	config = merge(config, masterConfig);
}

// =======
// Exports
// =======

module.exports = {
	config
};
