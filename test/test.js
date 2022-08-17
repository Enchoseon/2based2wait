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
        it("Can perform login sequence", async function () {
            this.timeout(13000);
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

/** Send packets that'll test a couple aspects of the proxy. Note that this is currently not version agnostic and only works for 1.12.2. */
function waitForLogin() {
    return new Promise((resolve) => {
        server.on("login", function (client) { // This is not an accurate login sequence.
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