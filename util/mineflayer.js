// =======
// Imports
// =======

const autoeat = require("mineflayer-auto-eat");
const antiafk = require("mineflayer-antiafk");
const { config, status } = require("./config.js");
const webserver = require("./webserver.js");
const io = require('./webserver.js').io();
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
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
    bot.loadPlugin(antiafk);
    // Set plugin options
    bot.autoEat.options = config.mineflayer.autoEat;
    bot.afk.setOptions(config.mineflayer.antiAfk);
    bot.afk.setOptions({ 
        "killauraEnabled": false,
        "autoEatEnabled": false
    });
    // Create bot
    bot.once("login", () => {
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
    });
    bot.once("spawn", () => {
        // =========
        // Kill Aura
        // =========
        setInterval(() => {
            if (status.mineflayer === "true" && status.inQueue === "false") {
                // Target hostile mobs within 3.5 blocks
                const mobFilter = e => (e.kind === "Hostile mobs") && (e.position.distanceTo(bot.entity.position) < 3.5)
                const victim = bot.nearestEntity(mobFilter);
                if (victim && config.mineflayer.killAura.blacklist.indexOf(victim.name) === -1) { // Don't target mobs in config.mineflayer.killAura.blacklist
                    bot.lookAt(victim.position); // For some reason using the promise doesn't work
                    bot.attack(victim);
                }
            }
        }, config.mineflayer.killAura.interval * 1000);
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
            
        });
        bot.on("health", () => {
            webserver.site.playerHunger = bot.food;
            webserver.site.playerHealth = bot.health;
            webserver.updatewebUI();
        })

    });
    io.on('connection', function(client) {
        client.on('chat message', (msg) => {
            bot.chat(msg);
        });
        
    });
    
}
// =======
// Exports
// =======

module.exports = {
    initialize
};
