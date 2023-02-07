// =======
// Imports
// =======

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execSync } = require("child_process");

const JSON5 = require("json5");

// ===============
// Get Information
// ===============

/** System Info */
const operatingSystem = os.type() + "_" + os.release() + "_" + os.arch(); // Operating system + CPU architecture
const memory = os.totalmem(); // Total memory
const nodeVersion = process.version; // Current node version

/** 2Based2Wait Information */
const currentCommitHash = getCurrentCommitHash(); // Current git commit hash
const packageJsonVersion = process.env.npm_package_version; // Current version in package.json
const filesToHash = [ // Paths of files to hash
	"./proxy.js",
	"./package.json",
	"./package-lock.json",
	"./util/chatty.js",
	"./util/config.js",
	"./util/downloader.js",
	"./util/logger.js",
	"./util/mineflayer.js",
	"./util/ngrok.js",
	"./util/notifier.js",
	"./util/queue.js",
	"./util/schemas.js",
	"./scripts/debugFetch.js",
	"./scripts/processArchives.js",
	"./scripts/updateNgrokBinary.js",
	"./test/test-config.json",
	"./test/test.js"
];
const lastModified = getLastModifiedFile(filesToHash);

/** Logs */
const logDirs = getDirectories("./log"); // Array of all directories in ./log

/** Tests*/
const isConfigValid = isValidJson5("./config.json"); // Whether ./config.json can be parsed
const passesMocha = passesMochaTests(); // Whether Mocha tests pass on this machine
const mochaInstalled = isMochaInstalled(); // Whether the optional Mocha dependency is even installed

/** Errors */
let errors;
if (!isConfigValid || (!passesMocha && mochaInstalled)) {
	errors = true;
}

// ==================
// Output Information
// ==================

/** System Info */
console.log("\x1b[36m%s\x1b[33m", "=== System Info ===");
console.log("OS:", operatingSystem);
console.log("Memory:", (memory / Math.pow(1024,3)).toString().slice(0,4) + "gb", "(" + memory + "b)");
console.log("Node Version:", nodeVersion);

/** 2Based2Wait Information */
console.log("\x1b[36m%s\x1b[33m", "=== 2Based2Wait Info ===");
console.log("Current Commit Hash:", currentCommitHash || "Couldn't find .git");
console.log("Package.json Version:", packageJsonVersion);
console.log("File Hashes:");
filesToHash.forEach((path) => {
	console.log("- " + path + ":", getFileHash(path) || "File wasn't found");
});
console.log("Last Modified File:", lastModified);

/** Logs */
console.log("\x1b[36m%s\x1b[33m", "=== Log Folders ===");
logDirs.forEach((path) => {
	console.log("- " + path.replace("log/", ""), "(" + fs.readdirSync(path).length + " files/folders)");
});

/** Tests */
console.log("\x1b[36m%s\x1b[33m", "=== Tests ===");
console.log("Config.json is Valid JSON5:", isConfigValid.toString());
console.log("Passes Mocha Tests:", passesMocha.toString());
console.log("Is Mocha Installed:", mochaInstalled.toString());
if (!mochaInstalled) {
	console.log("\x1b[32m", " ^ You can install mocha by running `npm ci`!");
}

/** User-Friendly Debugging */
if (errors) {
	console.log("\x1b[36m%s\x1b[32m", "\n=== Summary: Errors Found ===");
	if (!isConfigValid) {
		console.log("- Your config.json file is not valid Json5, probably due to syntax errors. Use a text editor or IDE with syntax highlighting to fix these mistakes faster.");
	}
	if (!passesMocha && mochaInstalled) {
		console.log("- The Mocha tests failed on your machine. If you didn't do anything to cause this (e.g. delete the test files, set up a super-strict firewall/container, etc.), then it probably means that there is a fatal bug that warrants investigation.");
	}
}

// =========
// Functions
// =========

/**
 * Returns the current git commit hash (https://stackoverflow.com/a/34518749)
 * @returns {string} Current git commit hash. Returns false if ./git/ can't be found
 */
function getCurrentCommitHash() {
	if (!fs.existsSync(".git/")) {
		return false;
	}
	let hash = fs.readFileSync(".git/HEAD").toString().trim();
	if (hash.indexOf(":") === -1) {
		return hash.slice(0, 7);
	} else {
		return fs.readFileSync(".git/" + hash.substring(5)).toString().trim().slice(0, 7);
	}
}

/**
 * Returns the git hash of the file at the path, returns false if the file wasn't found
 * @param {string} path Path to a file
 * @returns {string} Short 6-character hash
 */
function getFileHash(path) {
	if (!fs.existsSync(path)) { // Return false if file wasn't found
		return false;
	}
	const hashSum = crypto.createHash("sha1");
	hashSum.update("blob " + fs.statSync(path).size + "\0" + fs.readFileSync(path));
	return hashSum.digest("hex").slice(0, 7);
}

/**
 * Returns whether the file at path is valid Json5
 * @param {string} path Path to a file
 * @returns {boolean} Whether or not the file is valid Json5
 */
function isValidJson5(path) {
	try {
		JSON5.parse(fs.readFileSync(path));
	} catch (error) { // JSON5 Parsing Error
		return false;
	}
	return true;
}

/**
 * Returns whether Mocha test is successful
 * @returns {boolean} Whether `npm run test` is successful
 */
function passesMochaTests() {
	try {
		execSync("npm run test");
	} catch (error) { // The test fails
		return false;
	}
	return true;
}

/**
 * Returns whether optional Mocha dependency is installed
 * @returns {boolean} Whether Mocha is installed
 */
function isMochaInstalled() {
	try {
		require("mocha");
	} catch (error) { // The test fails
		return false;
	}
	return true;
}

/**
 * Returns (path of) most-recently modified file
 * @param {Array} paths Array of filepaths
 * @returns {string} Path of the last modified file
 */
function getLastModifiedFile(paths) {
	let newest = {
		"path": paths[0],
		"time": 0
	};
	paths.forEach((path) => {
		if (fs.existsSync(path)) {
			const time = fs.statSync(path).mtimeMs;
			if (time > newest.time) {
				newest.path = path;
				newest.time = time;
			}
		}
	});
	return newest.path;
}

/**
 * Returns array of directories in a given srcpath
 * @param {string} srcpath Path to a directory
 * @returns {Array} Array of directories
 * {@link https://stackoverflow.com/a/40896897}
 */
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath)
		.map(file => path.join(srcpath, file))
		.filter(path => fs.statSync(path).isDirectory());
}