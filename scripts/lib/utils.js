/**
 * Shared utility functions for pipeline scripts.
 * Centralised here to avoid copy-paste duplication across scripts.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/**
 * Read and parse a JSON file. Throws a descriptive error if the file
 * is missing or contains malformed JSON.
 */
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Failed to read JSON from ${filePath}: ${err.message}`);
  }
}

/**
 * Read and parse a JSON file, returning null if the file does not exist.
 */
function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

/**
 * Recursively create a directory if it does not exist.
 */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Write data as pretty-printed JSON, creating parent directories as needed.
 */
function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Resolve the path to the `gog` CLI binary.
 */
function gogBin() {
  if (process.env.GOG_BIN) return process.env.GOG_BIN;
  return process.platform === 'win32' ? 'gog' : '/home/ubuntu/.local/bin/gog';
}

/**
 * Run the `gog` CLI with the given arguments.
 */
function runGog(args, options = {}) {
  const env = { ...process.env };
  return execFileSync(gogBin(), args, {
    cwd: options.cwd,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/**
 * Resolve the repository root directory (two levels up from scripts/lib/).
 */
function repoRoot() {
  return path.resolve(__dirname, '..', '..');
}

module.exports = {
  readJson,
  safeReadJson,
  ensureDir,
  writeJson,
  gogBin,
  runGog,
  repoRoot,
};
