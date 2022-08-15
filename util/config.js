// =======
// Imports
// =======

const fs = require("fs");

const merge = require("deepmerge");
const JSON5 = require("json5");
const joi = require("joi");

// ===========
// Global Vars
// ===========

var config = {}; // Stores parsed and validated user configuration
var status = { // Stores pertinent information (to-do: set up setters and getters)
	"position": "CHECKING...",
	"eta": "CHECKING...",
	"restart": "None",
	"mineflayer": "CHECKING...",
	"inQueue": "true",
	"ngrokUrl": "None",
	"livechatRelay": "false",
	"controller": "None"
};

// =======
// Schemas
// =======

// Schema used to validate Minecraft usernames (between 3 and 16 characters, containing only a-z, A-Z, 0-9, and _)
const usernameSchema = joi.string().min(3).max(16).token(); 

// Schema used to validate packet names (lowercase, consisting only of a-z and underscores)
const packetSchema = joi.string().pattern(/^[a-z_]*$/).lowercase();

// Schema used to validate config.json
const configSchema = joi.object({
	"account": joi.object({
		"username": usernameSchema,
		"password": joi.string().empty("").default(""), // to-do: add a mojang password regex
		"auth": joi.string().valid("microsoft", "mojang").default("microsoft")
	}),
	"discord": joi.object({
		"active": joi.boolean().default(false),
		"webhook": joi.object({
			"spam": joi.string().empty("").default(""),
			"livechat": joi.string().empty("").default(""),
			"status": joi.string().empty("").default("")
		}),
		"color": joi.number().integer().min(0).max(16777215).default(2123412),
		"id": joi.string().default(0) // although this can be an number for users, it can be a string for roles!
	}),
	"queueThreshold": joi.number().integer().min(0).default(21),
	"reconnectInterval": joi.number().positive().default(69),
	"uncleanDisconnectInterval": joi.number().positive().default(420),
	"log": joi.object({
		"active": joi.object({
			"error": joi.boolean().default(true),
			"proxy": joi.boolean().default(true),
			"chat": joi.boolean().default(true),
			"bridgeClientPackets": joi.boolean().default(true),
			"serverPackets": joi.boolean().default(true),
		}),
		"cutoff": joi.number().integer().positive().default(42069), // Not setting a minimum for this seems dangerous...
		"packetFilters": joi.object({
			"server": joi.array().items(packetSchema).default(["map", "map_chunk", "player_info", "entity_metadata", "entity_velocity", "entity_move_look", "entity_look", "update_time", "world_particles", "unload_chunk", "teams", "rel_entity_move", "entity_head_rotation", "entity_update_attributes", "block_change"]),
			"bridgeClient": joi.array().items(packetSchema).default(["position", "look", "position_look", "arm_animation"])
		}),
	}),
	"server": joi.object({
		"host": joi.string().hostname().default("connect.2b2t.org"),
		"version": joi.string().default("1.12.2"), // to-do: regex idea: must start with a number and contain only numbers & decimals?
		"port": joi.number().port().default(25565)
	}),
	"proxy": joi.object({
		"whitelist": joi.array().items(usernameSchema),
		"onlineMode": joi.boolean().default(true),
		"port": joi.number().port().default(25565)
	}),
	"ngrok": joi.object({
		"active": joi.boolean().default(false),
		"authtoken": joi.string().empty("").pattern(/[A-Za-z0-9\-\._~\+\/]+=*/).default(""), // (Bearer Token Regex) From: https://www.regextester.com/95017
		"region": joi.string().valid("us", "eu", "au", "ap", "sa", "jp", "in").default("us"), // From: https://ngrok.com/docs/ngrok-agent/ (under "--region string")
	}),
	"mineflayer": joi.object({
		"active": joi.boolean().default(true),
		"autoQueueMainInterval": joi.number().positive().default(690), // Not setting a minimum for this seems dangerous...
		"killAura": joi.object({
			"interval": joi.number().positive().default(0.69),
			"blacklist": joi.array().items(packetSchema).default(["zombie_pigman", "enderman"])
		}),
		"autoEat": joi.object({
			"priority": joi.string().valid("saturation", "foodPoints", "effectiveQuality").default("saturation"), // From: https://github.com/link-discord/mineflayer-auto-eat#botautoeatoptionspriority
			"startAt": joi.number().integer().min(0).default(19),
			"bannedFood": joi.array().items(packetSchema).default(["rotten_flesh", "pufferfish", "chorus_fruit", "poisonous_potato", "spider_eye"])
		}),
		"antiAfk": joi.object({
			"actions": joi.array().items(joi.string().valid("rotate", "walk", "jump", "jumpWalk", "swingArm", "breakBlock")).default(["rotate"]),
			"fishing": joi.boolean().default(false),
			"chatting": joi.boolean().default(false),
			"chatMessages": joi.array().items(joi.string().min(1).max(256)).default(["!pt", "!queue"]), // to-do: find out any other chat limits
			"chatInterval": joi.number().integer().positive().default(690420) // Not setting a minimum for this seems dangerous...
		})
	}),
	"experimental": joi.object({
		"spoofPlayerInfo": joi.object({
			"active": joi.boolean().default(true),
			"texture": joi.object({
				"value": joi.string().empty("").base64({ urlSafe: true, paddingRequired: true }).default(""),
				"signature": joi.string().empty("").base64({ paddingRequired: true }).default(""),
			})
		})
	}),
	"waitForControllerBeforeConnect": joi.boolean().default(false),
	"notify": joi.object({
		"whenJoining": joi.boolean().default(true),
		"whenBelowQueueThreshold": joi.boolean().default(true),
	}),
	"coordination": joi.object({
		"active": joi.boolean().default(false),
		"path": joi.string().default("./../")
	})
});

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

// Validate config
config = validate(config);

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

/**
 * Validate config object
 * @param {object} config
 */
function validate() {
	const result = configSchema.validate(config, { // Validate schema
		"abortEarly": false, // (find all errors)
		"allowUnknown": true // (allow undefined values (we'll just set defaults where we can))
	});
	const errors = result.error;
	if (errors) { // If error found, print error to console and kill process
		if (errors.details.length === 1) {
			console.log("\x1b[36m", "Stopped proxy, encountered an error in config.json (you must fix it): \n");
		} else {
			console.log("\x1b[36m", "Stopped proxy, encountered " + errors.details.length + " errors in config.json (you must fix them): \n");
		}
		for (var i = 0; i < errors.details.length; i++) { // Print errors to console
			const error = errors.details[i];
			console.log("\x1b[33m", "ERROR #" + i + ": " + error.message);
			console.log("\x1b[32m", "- Invalid Value: " + error.context.value);
			console.log("\x1b[32m", "- Should Be Type: " + error.type);
			if (i !== errors.details.length) {
				console.log("");
			}
		};
		process.exit(0); // Kill process with code 0 so that supervisor won't restart it
	}
	return result.value;

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
