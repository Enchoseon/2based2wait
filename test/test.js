"use strict";

// =======
// Imports
// =======

const assert = require("assert");
const mc = require("minecraft-protocol");

// ===========
// Global Vars
// ===========

let server;

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
            const { configSchema } = require("./../util/config.js");
            const generated = configSchema.validate({
                account: {
                    username: "UnitTester"
                }
            });
            console.log("Generated Config:");
            console.dir(generated, { depth: null });
            assert.equal(typeof generated.error, "undefined"); // Check that schema validation returned no errors
        });
    });
    describe("proxy.js", () => {
        it("Can perform login sequence", async function () {
            this.timeout(13000);
            require("./../proxy.js"); // Start proxy
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
            // ===================
            // 2B2T Login Sequence
            // ===================
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
            client.write("custom_payload", {
                "channel": "MC|Brand",
                "data": Buffer.from("2b2t (Velocity)", "utf8")
            });
            client.write("difficulty", {
                "difficulty": 1
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
            // ===================
            // 2B2T Server Restart
            // ===================
            client.write("chat", {
                message: JSON.stringify({
                    "text": "[SERVER] Server restarting in 7 seconds..."
                }),
                position: 0
            });
            resolve(client.username);
        });
    })
}