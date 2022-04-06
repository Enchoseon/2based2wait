// =======
// Imports
// =======

const autoeat = require("mineflayer-auto-eat");
const pathfinder = require("mineflayer-pathfinder").pathfinder;
const Movements = require("mineflayer-pathfinder").Movements;
const { GoalNear } = require("mineflayer-pathfinder").goals;
const Vec3 = require("vec3");

const { config, status } = require("./config.js");
const mcData = require("minecraft-data")(config.server.version);

// ===========
// Global Vars
// ===========

var safetyPathfinderFlag = false; // God this is so messy. Make this variable true during runtime to begin pathfinding to the nearest safety waypoint.

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
    bot.loadPlugin(pathfinder);
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
        // =================
        // Safety Pathfinder
        // =================
        bot.on("physicTick", () => {
            if (safetyPathfinderFlag) {
                safetyPathfinderFlag = false;
                // Apply movement configs
                const movementConfig = new Movements(bot, mcData);
                movementConfig.digCost = 75;
                movementConfig.placeCost = 50;
                bot.pathfinder.setMovements(movementConfig);
                // Filter thru waypoints to find nearest valid waypoint
                var nearestWaypoint;
                const waypoints = config.mineflayer.safetyWaypoints.waypoints;
                for (var key in waypoints) {
                    const check = waypoints[key];
                    if (bot.game.dimension === check.dimension) { // Check if in correct dimension
                        // Calculate distance and store in object so that it doesn't have to be calculated again
                        const waypointVec3 = new Vec3(check.coordinates[0], check.coordinates[1], check.coordinates[2]);
                        check.distance = bot.entity.position.distanceTo(waypointVec3);
                        // Check if in range
                        if (check.distance <= config.mineflayer.safetyWaypoints.maxDistance) {
                            // Assign to nearestWaypoint...
                            if (nearestWaypoint !== undefined) { // ... if is closer than the existing nearestWaypoint
                                if (check.distance < nearestWaypoint.distance) {
                                    nearestWaypoint = check;
                                }
                            } else { // ... if it's the first eligible waypoint
                                nearestWaypoint = check;
                            }
                        }
                    }
                }
                if (nearestWaypoint !== undefined) {
                    bot.pathfinder.setGoal(new GoalNear(nearestWaypoint.coordinates[0], nearestWaypoint.coordinates[1], nearestWaypoint.coordinates[2], 1));
                }
            }
        })
    });
}

// =========
// Functions
// =========
function checkSafetyPathfinder() {
    if (status.mineflayer === "true") {
        safetyPathfinderFlag = true;
    }
}

// =======
// Exports
// =======

module.exports = {
    initialize,
    checkSafetyPathfinder
};
