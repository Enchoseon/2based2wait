// =======
// Imports
// =======

const fs = require("fs");

const merge = require("deepmerge");
const JSON5 = require("json5");

const { configSchema } = require("./schemas.js");

// ===========
// Global Vars
// ===========

const config = processConfig(); // Stores parsed and validated user configuration
let status = { // Stores pertinent information (to-do: set up setters and getters)
	"position": "CHECKING...",
	"eta": "CHECKING...",
	"restart": "None",
	"mineflayer": "CHECKING...",
	"inQueue": "true",
	"ngrokUrl": "None",
	"livechatRelay": "false",
	"controller": "None"
};

// ======================
// Generate Documentation
// ======================

if (process.argv.indexOf("--documentation") !== -1) {
	console.clear();
	const doc = joiToMarkdown(configSchema, true); // Generate documentation with anchor links
	const dir = "./docs/";
	if (!fs.existsSync(dir)) { // Create directory if it doesn't exist
		fs.mkdirSync(dir, {
			"recursive": true
		});
	}
	fs.writeFileSync(dir + "configuration-guide.md", doc); // Write documentation to markdown file
	// Output documentation without any anchor links for the GitHub Wiki, which annoyingly doesn't support anchor links
	console.log("### See [this page](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md) for a better version of this guide with anchor links\n---\n" + joiToMarkdown(configSchema, false));
	process.exit();
}


// =========
// Functions
// =========

/**
 * Process and validate Config.json
 * @returns 
 */
function processConfig() {
	let config;
	try { // Read config.json
		if (typeof global.it !== "function") {
			config = JSON5.parse(fs.readFileSync("config.json"));
		} else { // If we're running a unit test read the test config instead
			config = JSON5.parse(fs.readFileSync("./test/test-config.json"));
		}
	} catch (error) { // JSON5 Parsing Error
		console.error(error);
		throw new Error("Couldn't read config.json, likely due to user error near or at Line" + error.lineNumber + ", Column" + error.columnNumber); // Kill the process here
	}
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
	// Validate the config with Joi
	const validationResult = configSchema.validate(config, { // Validate schema
		"abortEarly": false, // (find all errors)
		"allowUnknown": true // (allow undefined values (we'll set defaults where we can))
	});
	const validationErrors = validationResult.error;
	if (validationErrors) { // If error found, print error to console and kill process...
		if (validationErrors.details.length === 1) {
			console.log("\x1b[36m", "Stopped proxy, encountered an error in config.json (you must fix it): \n");
		} else {
			console.log("\x1b[36m", "Stopped proxy, encountered " + validationErrors.details.length + " errors in config.json (you must fix them): \n");
		}
		for (let i = 0; i < validationErrors.details.length; i++) { // Print helpful color-coded errors to console
			const error = validationErrors.details[i];
			console.log("\x1b[33m", "ERROR #" + i + ": " + error.message);
			console.log("\x1b[32m", "- Invalid Value: " + error.context.value);
			console.log("\x1b[32m", "- Should Be Type: " + error.type);
			if (i !== validationErrors.details.length) {
				console.log("\x1b[36m", "");
			}
		};
		throw new Error("Couldn't validate config.json"); // Kill the process here
	}
	// ... If no errors were found, return the validated config
	return validationResult.value;
}

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
	if (config.noCliGui) {
		return;
	}
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
	console.log("\x1b[30m", "");
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
	let timestamp = new Date();
	timestamp = timestamp.toLocaleString();
	return timestamp.replace(/\//g, "-") // Replace forward-slash with hyphen
		.replace(",", ""); // Remove comma
}

// ===============
// Joi To Markdown
// ===============

/**
 * Generate markdown documentation from Joi schema.
 * @param {object} schema
 * @param {boolean} includeAnchors
 */
function joiToMarkdown(schema, includeAnchors) {
	let output = "";
	// Convert to JSON
	schema = schema.describe();
	// Get value from path (https://stackoverflow.com/a/70356013)
	const get = (record, path) => path.reduce((record, item) => record[item], record);
	// Traverse configSchema
	for (let [key, value, path, parent] of traverse(schema.keys)) {
		const level = path.length;
		const flags = get(schema.keys, path).flags;
		if (flags && key !== "empty" && key !== "0") { // Don't proceed if the object doesn't have any flags or is empty
			const info = { // Important information about the entry
				"type": get(schema.keys, path).type,
				"default": flags.default,
				"description": flags.description
			};
			if (level !== 1) { // Indent nested entries
				output += indent(level) + "- "
			} else { // Add a newlines in-between top-level entries to stop GitHub's markdown interpreter from merging everything into one giant list
				output += "\n"
			}
			if (includeAnchors) {
				const anchor = path.join("-").replace(/-keys-/g, "-").toLowerCase(); // Create a unique and URL-friendly anchor for the entry
				output += "<span id='" + anchor + "'></span>"; // Add the anchor to an invisible pair of <span> tags
				output += "**[" + key + "](#user-content-" + anchor + ")**"; // Output the entry's name
			} else {
				output += "**" + key + "**"; // Output the entry's name
			}
			output += " <samp>`{type: " + info.type + "}`</samp>"; // Output the entry's type
			if (typeof info.default !== "undefined" && info.default.special !== "deep") { // If provided, output the entry's default value(s)
				output += " <samp>`{default: " + JSON.stringify(info.default) + "}`</samp>";
			}
			if (typeof info.description !== "undefined") { // If provided, output the entry's description
				output += " : " + info.description;
			}
			output += "\n";
		}
	}
	return output;
	/**
	 * Traverse through an object (https://stackoverflow.com/a/45628445)
	 * @param {object} o
	 * @param {object} path
	 */
	function* traverse(o, path = []) {
		for (let i in o) {
			const itemPath = path.concat(i);
			yield [i, o[i], itemPath, o];
			if (o[i] !== null && typeof (o[i]) == "object") {
				yield* traverse(o[i], itemPath);
			}
		}
	}
	/**
	 * Return indent for creating nested markdown list
	 * @param {number} level
	 */
	function indent(level) {
		let output = "";
		for (let i = 1; i < level; i++) {
			output += " ";
		}
		return output;
	}
}

// =======
// Exports
// =======

module.exports = {
	config,
	status,
	updateStatus,
	updateCoordinatorStatus,
	configSchema
};