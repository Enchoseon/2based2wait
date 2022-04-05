// =======
// Imports
// =======

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
    // Create bot
    bot.once("login", () => {
        // Auto-totem
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
        // Auto-queue main (only on 2b2t)
        if (config.server.host === "connect.2b2t.org") {
            const autoQueueMain = setInterval(function () {
                if (status.inQueue === "true") {
                    bot.chat("/queue main");
                } else {
                    clearInterval(autoQueueMain);
                }
            }, config.mineflayer.autoQueueMainInterval * 1000);
        }
    });
}

// =======
// Exports
// =======

module.exports = {
	initialize
};
