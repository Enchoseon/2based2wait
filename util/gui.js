// =======
// Imports
// =======

const logger = require("./logger.js");

// ===========
// Global Vars
// ===========

// GUI
var data = {
	"position": "CHECKING...",
	"eta": "CHECKING...",
	"restart": "None",
	"mineflayer": "CHECKING...",
	"inQueue": "CHECKING..."
};
var dataDefault = data;

// =========
// Functions
// =========

// Display a basic GUI
function display(type, input) {
	if (eval("data." + type + " !== `" + input + "`")) { // Jankus maximus
		eval("data." + type + " = `" + input + "`");
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
		console.log("\x1b[33m", "Last Update: [" + logger.getTimestamp(":") + "]");
		console.log("\x1b[33m", "Current Queue Position: " + data.position);
		console.log("\x1b[33m", "ETA: " + data.eta);
		console.log("\x1b[33m", "Restart: " + data.restart);
		console.log("\x1b[35m", "Mineflayer Running: " + data.mineflayer.toUpperCase());
		console.log("\x1b[35m", "In Queue Server: " + data.inQueue.toUpperCase());

		logger.log("gui", data);
	}
}

// Reset GUI
function reset() {
	data = dataDefault;
}

// =======
// Exports
// =======

module.exports = {
	data,
	display,
	reset
};