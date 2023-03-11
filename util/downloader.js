// =======
// Imports
// =======

const fs = require("fs");
const zlib = require("zlib");

const { config } = require("./config.js");
const logger = require("./logger.js");

// =========
// Functions
// =========

/**
 * Extremely unstable world downloader
 * @param {any} packetData
 */
function mapChunkPacketHandler(packetData) {
	if (!config.experimental.worldDownloader.active) { // Don't proceed if world downloader isn't enabled
		return;
	}
	const serialized = JSON.stringify([ // Serialize the data we want to save
		Math.floor(Date.now() / 1000),
		packetData.x,
		packetData.z,
		packetData.groundUp ? 1 : 0,
		packetData.bitMap,
		packetData.chunkData,
		packetData.blockEntities,
	]);
	const packetFile = createOutputDir("default") + logger.getTimestamp(true) + ".packets.gz"; // Save to log
	let stream = fs.createWriteStream(packetFile, { flags: "a" });
	stream.write(zlib.gzipSync(serialized + "\u{0D9E}", { // Gzip
		"level": config.experimental.worldDownloader.compression.level,
		"memLevel": config.experimental.worldDownloader.compression.memLevel,
		"windowBits": config.experimental.worldDownloader.compression.windowBits,
		"strategy": 1
	}));
	// stream.write(serialized + "\u{0D9E}");
	stream.end();
}

/**
 * Create output folder if it doesn't exist
 * @param {string} worldName
 */
function createOutputDir(worldName) {
	const outputDir = "./log/worldDownloader/" + config.server.host + "/" + worldName.replace(/:/g, "_") + "/";
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, {
			"recursive": true
		});
	}
	return outputDir;
}

// =======
// Exports
// =======

module.exports = {
	mapChunkPacketHandler,
	createOutputDir
};
