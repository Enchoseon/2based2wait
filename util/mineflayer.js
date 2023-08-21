// =======
// Imports
// =======

const autoeat = require("mineflayer-auto-eat").plugin;
const antiafk = require("mineflayer-antiafk");

const { config, status } = require("./config.js");
const logger = require("./logger.js");

// ===
// Bot
// ===

/**
 * Create the Mineflayer bot
 * @param {object} bot Mineflayer bot
 */
function initialize(bot) {
	// Don't proceed if Mineflayer isn't active
	if (!config.mineflayer.active) return;
	// Load plugins
	bot.loadPlugin(autoeat);
	bot.loadPlugin(antiafk);
	// Create bot
	bot.once("login", () => {
		// ===============
		// Auto-Queue Main
		// ===============
		if (config.server.host === "connect.2b2t.org") { // (only on 2b2t)
			const autoQueueMain = setInterval(function () {
				status.inQueue ? bot.chat("/queue main") : clearInterval(autoQueueMain);
			}, config.mineflayer.autoQueueMainInterval * 1000);
		}
	});
	bot.once("spawn", () => {
		// =======
		// Antiafk
		// =======
		// Set plugin options
		bot.afk.setOptions(config.mineflayer.antiAfk);
		bot.afk.setOptions({
			"killauraEnabled": false,
			"autoEatEnabled": false
		});
		// =======
		// Autoeat
		// =======
		bot.autoEat.options = config.mineflayer.autoEat; // Load autoeat options
		// =========
		// Kill Aura
		// =========
		setInterval(() => {
			if (status.mineflayer === "true" && status.inQueue === "false") {
				// Target hostile mobs within 3.5 blocks
				const mobFilter = e => (e.kind === "Hostile mobs") && (e.position.distanceTo(bot.entity.position) < 3.5);
				const victim = bot.nearestEntity(mobFilter);
				if (victim && config.mineflayer.killAura.blacklist.indexOf(victim.name) === -1) { // Don't target mobs in config.mineflayer.killAura.blacklist
					bot.lookAt(victim.position); // For some reason using the promise doesn't work
					bot.attack(victim);
				}
			}
		}, config.mineflayer.killAura.interval * 1000);
		// ==========
		// Auto Totem
		// ==========
		setInterval(() => {
			if (status.mineflayer === "true" && status.inQueue === "false") {
				const totem = bot.inventory.findInventoryItem("totem_of_undying", null);
				if (totem) {
					bot.equip(totem, "off-hand");
				}
			}
		}, config.mineflayer.autoTotem.interval * 1000);
		// =====
		// Jesus
		// =====
		bot.on("breath", () => {
			if (status.mineflayer === "true" && status.inQueue === "false") {
				bot.setControlState("jump", bot.oxygenLevel < 20);
			}
		});
		// ======
		// Logger
		// ======
		// Events to listen to
		if (config.log.active.mineflayer) {
			bot.on("entitySpawn", (entity) => entityLogger(entity, "entered render distance"));
			bot.on("entityGone", (entity) => entityLogger(entity, "left render distance"));
			bot.on("playerJoined", (player) => playerLogger(player, "joined server"));
			bot.on("playerLeft", (player) => playerLogger(player, "left server"));
		}
		// Log all players that were already here in our render distance when we joined
		Object.values(bot.entities).filter(e => e.type === 'player' && e.username !== bot.username).forEach((entity) => {
			entityLogger(entity, "was already in render distance when we joined")
		});
		/**
		 * Log entities
		 * @param {object} entity Mineflayer entity objec
		 * @param {object} action One-word description of the event being logged
		 */
		function entityLogger(entity, action) {
			// Only log player entities
			if (entity.type !== "player") return;
			logger.log(action, `${entity.username} (${entity.uuid})`, "mineflayer");
		}
		/**
		 * Log player events
		 * @param {object} player Mineflayer Player object
		 * @param {object} action One-word description of the event being logged
		 */
		function playerLogger(player, action) {
			logger.log(action, `${player.username} (${player.uuid})`, "mineflayer");
		}
	});
}

// =======
// Exports
// =======

module.exports = {
	initialize
};
