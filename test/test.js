"use strict";

// =======
// Imports
// =======

const assert = require("assert");
const mc = require("minecraft-protocol");

// ===========
// Global Vars
// ===========

var server;

// =====
// Mocha
// =====

describe("2Bored2Wait Testing", () => {
    before(() => {
        console.log("Creating testing server.");
        server = mc.createServer({
            "online-mode": false,
            encryption: true,
            version: "1.12.2"
        });
    });
    describe("config.js", () => {
        it("Can generate a valid config.json from bare-minimum information", () => {
            const { config } = require("./../util/config.js");
            console.log("Generated Config:", config);
            assert.equal(typeof config, "object");
        });
    });
    describe("proxy.js", () => {
        it("Can perform login sequence", async function() {
            const proxy = require("./../proxy.js");
            const username = await waitForLogin();
            console.log("Received Login:", username);
            assert.equal(username, "UnitTester");
        });
    });
});

// ==============
// Packet Testing
// ==============

/** Send packets that'll test lots of different aspects of the proxy. Note that this is currently not version agnostic and only works for 1.12.2. */
function waitForLogin() {
    return new Promise((resolve) => {
        server.on("login", function (client) { // note: I may have gotten a little too carried away, might want to scale this down to just a vanilla login sequence actually.
            // ============================
            // Simulate 2B2T Login Sequence
            // ============================
            client.write("chat", {
                "message": JSON.stringify({
                    "color": "gold",
                    "text": "Queued for server main."
                }),
                "position": 0
            });
            client.write("login", {
                "entityId": client.id,
                "gameMode": 3,
                "dimension": 1,
                "difficulty": 0,
                "maxPlayers": 48,
                "levelType": "default",
                "reducedDebugInfo": false
            });
            client.write("title", {
                "action": 5
            });
            client.write("custom_payload", {
                "channel": "MC|Brand",
                "data": Buffer.from("2b2t (Velocity)", "utf8")
            });
            client.write("difficulty", {
                "difficulty": 1
            });
            client.write("abilities", {
                "flags": 7,
                "flyingSpeed": 0.05000000074505806,
                "walkingSpeed": 0.10000000149011612
            });
            client.write("held_item_slot", {
                "slot": 0
            });
            client.write("entity_status", {
                "entityId": client.id,
                "entityStatus": 24
            });
            client.write("position", {
                "x": 0.5,
                "y": 64,
                "z": 0.5,
                "yaw": 0,
                "pitch": 0,
                "flags": 0,
                "teleportId": 1
            });
            client.write("player_info", {
                "action": 0,
                "data": [{
                    "UUID": client.uuid,
                    "name": client.username,
                    "properties": [],
                    "gamemode": 3,
                    "ping": 0
                }]
            });
            client.write("player_info", {
                "action": 0,
                "data": [{
                    "UUID": client.uuid,
                    "name": client.username,
                    "properties": [],
                    "gamemode": 3,
                    "ping": 420
                }]
            });
            client.write("entity_metadata", {
                "entityId": client.id,
                "metadata": [
                    { key: 0, type: 0, value: 0 },
                    { key: 2, type: 3, value: "" },
                    { key: 4, type: 6, value: false },
                    { key: 11, type: 2, value: 0 },
                    { key: 10, type: 1, value: 0 },
                    { key: 6, type: 0, value: 0 },
                    { key: 7, type: 2, value: 20 },
                    { key: 9, type: 6, value: false },
                    { key: 8, type: 1, value: 0 },
                    { key: 1, type: 1, value: 300 },
                    { key: 3, type: 6, value: false },
                    { key: 5, type: 6, value: false },
                    { key: 12, type: 1, value: 0 },
                    { key: 13, type: 0, value: 0 },
                    { key: 15, type: 13, value: { type: "compound", name: "", value: {} } },
                    { key: 14, type: 0, value: 1 },
                    { key: 16, type: 13, value: { type: "compound", name: "", value: {} } }
                ]
            });
            client.write("world_border", {
                "action": 3,
                "x": 0,
                "z": 0,
                "old_radius": 59999968,
                "new_radius": 59999968,
                "speed": 0,
                "portalBoundary": 29999984,
                "warning_time": 5,
                "warning_blocks": 15
            });
            client.write("update_time", {
                "age": 183939n,
                "time": 318135939n
            });
            client.write("spawn_position", {
                location: {
                    "x": 8,
                    "y": 64,
                    "z": 8
                }
            });
            client.write("window_items", {
                "windowId": 0,
                "items": [
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }, { blockId: -1 }, { blockId: -1 },
                    { blockId: -1 }, { blockId: -1 }
                ]
            });
            client.write("map_chunk", {
                "x": 0,
                "z": 0,
                "groundUp": true,
                "bitMap": 0,
                "chunkData": Buffer.from([
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
                    127, 127
                ], "utf8"),
                "blockEntities": []
            });
            client.write("playerlist_header", {
                "header": JSON.stringify({
                    "extra": [
                        {
                            "bold": true,
                            "italic": true,
                            "color": "gray",
                            "text": "2BUILDERS"
                        },
                        {
                            "text": "\n"
                        },
                        {
                            "bold": true,
                            "italic": true,
                            "color": "gray",
                            "text": "2TOOLS     \n"
                        },
                        {
                            "text": "\n"
                        },
                        {
                            "color": "gold",
                            "extra": [{
                                "bold": true,
                                "text": "232\n"   
                            }],
                            "text": "2b2t is full\nPosition in queue: "
                        },
                        {
                            "color": "gold",
                            "extra": [{
                                "bold": true,
                                "text": "6h49m24s\n"
                            }],
                            "text": "Estimated time: "
                        }
                    ],
                    "text": "                                                                                                                                 \n"
                }),
                "footer": JSON.stringify({
                    "extra": [{
                        "color": "gold",
                        "text": "You can purchase priority queue status to join the server faster, visit shop.2b2t.org\n\n"                        
                    }],
                    "text": "\n\n"
                })
            });
            client.write("title", {
                "action": 1,
                "text": JSON.stringify({
                    "color": "gold",
                    "text": "Position in queue: 232"
                })
            });
            client.write("title", {
                "action": 0,
                "text": JSON.stringify({
                    "text": ""
                })
            });
            client.write("chat", {
                "message": JSON.stringify({
                    "extra": [{
                        "color": "gold",
                        "extra": [{
                            "bold": true,
                            "clickEvent": {
                                "action": "open_url",
                                "value": "https://shop.2b2t.org/"
                            },
                            "text": "shop.2b2t.org"
                        }],
                        "text": "Position in queue: 232\nYou can purchase priority queue status to join the server faster, visit "   
                    }],
                    "text": "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
                }),
                "position": 0
            });
            // ===========
            // Leave Queue
            // ===========
            client.write("chat", {
                "message": JSON.stringify({
                    "color": "gold",
                    "text": "Connected to the server."
                }),
                "position": 0
            });
            client.write("playerlist_header", {
                "header": JSON.stringify({
                    "extra": [
                        {
                            "bold": true,
                            "italic": true,
                            "color": "gray",
                            "text": "2BUILDERS"
                        },
                        {
                            "text": "\n"
                        },
                        {
                            "bold": true,
                            "italic": true,
                            "color": "gray",
                            "text": "2TOOLS     \n"
                        },
                        {
                            "text": "\n"
                        },
                        {
                            "color": "gold",
                            "extra": [{
                                "bold": true,
                                "text": "1\n"
                            }],
                            "text": "2b2t is full\nPosition in queue: "
                        },
                        {
                            "color": "gold",
                            "extra": [{
                                "bold": true,
                                "text": "2m\n"
                            }],
                            "text": "Estimated time: "
                        }
                    ],
                    "text": "                                                                                                                                 \n"
                }),
                "footer": JSON.stringify({
                    "extra": [{
                        "color": "gold",
                        "text": "You can purchase priority queue status to join the server faster, visit shop.2b2t.org\n\n"
                    }],
                    "text": "\n\n"
                })
            });
            client.write("login", {
                "entityId": client.id,
                "gameMode": 0,
                "dimension": 0,
                "difficulty": 3,
                "maxPlayers": 48,
                "levelType": "default",
                "reducedDebugInfo": false
            });
            client.write("respawn", {
                "dimension": 1,
                "difficulty": 3,
                "gamemode": 0,
                "levelType": "default"
            });
            client.write("custom_payload", {
                "channel": "MC|Brand",
                "data": Buffer.from("2b2t (Velocity)", "utf8")
            });
            client.write("difficulty", {
                "difficulty": 3
            });
            client.write("abilities", {
                "flags": 7,
                "flyingSpeed": 0.05000000074505806,
                "walkingSpeed": 0.10000000149011612
            });
            client.write("world_border", {
                "action": 3,
                "x": 0,
                "z": 0,
                "old_radius": 60000000,
                "new_radius": 60000000,
                "speed": 0,
                "portalBoundary": 29999984,
                "warning_time": 5,
                "warning_blocks": 15
            });
            client.write("position", {
                "x": 0,
                "y": 64,
                "z": 0,
                "yaw": 0,
                "pitch": 0,
                "flags": 0,
                "teleportId": 1
            });
            client.write("spawn_position", {
                "location": {
                    "x": 0,
                    "y": 50,
                    "z": 0
                }
            });
            // ==============
            // Server Restart
            // ==============
            client.write("chat", {
                message: JSON.stringify({
                    "text": "[SERVER] Server restarting in 7 seconds..."
                }),
                position: 0
            });
            // ============
            // Chat Message
            // ============
            client.write("chat", {
                message: JSON.stringify({
                    "text": "<UnitTester> Chat message."
                }),
                position: 0
            });
            resolve(client.username);
        });
    })
}