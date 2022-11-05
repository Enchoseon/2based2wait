// =======
// Imports
// =======

const fs = require("fs");
const zlib = require("zlib");
const { Transform } = require("stream");

const nbt = require("prismarine-nbt");

const { config } = require("./../util/config.js");
const downloader = require("./../util/downloader.js");

const Anvil = new (require("prismarine-provider-anvil").Anvil(config.server.version))(downloader.createOutputDir("default"));
const Chunk = require("prismarine-chunk")(config.server.version);

// =======
// Classes
// =======

/** Stream from a file in chunks (https://stackoverflow.com/a/44931499) */
class Delimited extends Transform {
	constructor(delimiter) {
		super({ objectMode: true });
		this._delimiter = delimiter instanceof RegExp ? delimiter : new RegExp(delimiter, "g");
		this._encoding = "utf8";
		this._buffer = "";
		this._first = true;
	}
	_transform(chunk, encoding, callback) {
		if (encoding === "buffer") {
			this._buffer += chunk.toString(this._encoding);
		} else if (encoding === this._encoding) {
			this._buffer += chunk;
		} else {
			this._buffer += Buffer.from(chunk, encoding).toString(this._encoding);
		}
		if (this._delimiter.test(this._buffer)) {
			let sections = this._buffer.split(this._delimiter);
			this._buffer = sections.pop();
			sections.forEach(this.push, this);
		}
		callback();
	}
}

// =========
// Functions
// =========

/**
 * Convert a packet.gz archive into .mca files
 * @param {string} inputDirectory
 * @param {number} stoppingDate
 */
async function packetsToAnvil(inputDirectory, stoppingDate) {
	// Get all files in the directory to convert
	let files = fs.readdirSync(inputDirectory, {
		"withFileTypes": true
	}).filter(f => f.name.endsWith(".packets.gz")); // (Check the extension to make sure)
	// Process each file in sequential order
	while (files.length > 0) {
		console.log("\t", "Now Reading:", files[0].name);
		await streamFile(inputDirectory + "/" + files[0].name);
		files.shift();
	}
	// Stream an archive file
	async function streamFile(inputFile) {
		const fileStream = fs.createReadStream(inputFile);
		const transform = new Delimited(/\u0D9E/gu);
		transform.on("data", (chunk) => handleChunk(chunk));
		transform.on("end", () => {
			console.log("Complete.");
			process.kill(0);
		});
		fileStream.pipe(zlib.createGunzip()).pipe(transform);
	}
	// Handle each line
	async function handleChunk(line) {
		const parsed = JSON.parse(line);
		const packetData = {
			"timestamp": new Date(parsed[0] * 1000),
			"x": parsed[1],
			"z": parsed[2],
			"groundUp": Boolean(parsed[3]),
			"bitMap": parsed[4],
			"chunkData": Buffer.from(parsed[5]),
			"blockEntities": parsed[6]
		}
		// Check if we've passed the stopping date
		if (stoppingDate > 0 && stoppingDate < packetData.timestamp.getTime()) {
			console.log("\t", "Reached Stopping Date On Packet Dated:", packetData.timestamp.toUTCString());
			console.log("Complete.");
			process.kill(0);
			return;
		}
		// Convert to prismarine-chunk format
		console.log("\t\t", "Converting Chunk:", packetData.x, packetData.z, "\n\t\t\t", "Recorded At:", packetData.timestamp.toUTCString());
		const chunk = new Chunk();
		chunk.load(packetData.chunkData, packetData.bitMap, { // Load chunks
			"minecraft:end": 1,
			"minecraft:overworld": 0,
			"minecraft:nether": -1
		}, packetData.groundUp);
		if (packetData.blockEntities.length > 0) { // Load block entities
			const simplified = packetData.blockEntities.map((entity) => nbt.simplify(entity));
			await chunk.loadBlockEntities(simplified);
		}
		// Save to anvil
		await Anvil.save(packetData.x, packetData.z, chunk);
	}
}

/** Lazy Package.json hook */
if (process.argv.length >= 3) {
	// Get arguments
	const inputDirectory = process.argv[2];
	const stoppingDate = Date.parse(process.argv[3]);
	console.log("Processing Archive:", inputDirectory, "Stopping Date:", stoppingDate || "None");
	if (fs.existsSync(inputDirectory)) {
		packetsToAnvil(inputDirectory, stoppingDate);
	} else {
		throw new Error(path + "could not be found. Are you sure you have the correct path?");
	}
}

// =======
// Exports
// =======

module.exports = {
	packetsToAnvil
};
