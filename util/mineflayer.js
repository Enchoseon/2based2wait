// =======
// Imports
// =======

const autoeat = require("mineflayer-auto-eat");

const { config, status } = require("./config.js");
const mcData = require("minecraft-data")(config.server.version);

// ===
// Bot
// ===

function initialize(bot) {
    // Don't proceed if Mineflayer isn't active
    if (!config.mineflayer.active) {
        return;
    }
    // Load plugins
    bot.loadPlugin(autoeat);
    // Create bot
    bot.once("login", () => {
        // ==========
        // Auto-Totem
        // ==========
        const totem = mcData.itemsByName.totem_of_undying;
        if (totem) {
            setInterval(() => {
                if (status.mineflayer === "true" && status.inQueue === "false") {
                    const totemInInventory = bot.inventory.findInventoryItem(totem.id, null)
                    if (totemInInventory) {
                        bot.equip(totemInInventory, "off-hand")
                    }
                }
            }, 690)
        }
        // ===============
        // Auto-Queue Main
        // ===============
        if (config.server.host === "connect.2b2t.org") { // (only on 2b2t)
            const autoQueueMain = setInterval(function () {
                if (status.inQueue === "true") {
                    bot.chat("/queue main");
                } else {
                    clearInterval(autoQueueMain);
                }
            }, config.mineflayer.autoQueueMainInterval * 1000);
        }
        // =========
        // Kill Aura
        // =========
        setInterval(() => {
            if (status.mineflayer === "true" && status.inQueue === "false") {
                // Target hostile mobs within 3.5 blocks not in config.mineflayer.killAura.blacklist
                const mobFilter = e => (e.type === "mob") && (e.category === "Hostile mobs") && (e.position.distanceTo(bot.entity.position) < 3.5) && (config.mineflayer.killAura.blacklist.findIndex(e.name) === -1);
                const victim = bot.nearestEntity(mobFilter);
                if (victim) {
                    bot.lookAt(victim.position); // For some reason using the promise doesn't work
                    bot.attack(victim);
                }
            }
        }, config.mineflayer.killAura.interval * 1000);
        // ========
        // Auto Eat
        // ========
        bot.autoEat.options = config.mineflayer.autoEat;
        bot.autoEat.enable();
        // =====
        // Jesus
        // =====
        bot.on("breath", () => {
            if (status.mineflayer === "true" && status.inQueue === "false") {
                if (bot.oxygenLevel < 20) {
                    bot.setControlState("jump", true);
                } else {
                    bot.setControlState("jump", false);
                }
            }
        })
    });
}

// =======
// Exports
// =======

module.exports = {
    initialize
};
