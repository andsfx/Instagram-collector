const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\\r?\\n/);
  for (const line of lines) {
    if (!line || /^\\s*#/.test(line)) continue;
    const m = line.match(/^\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.*)\\s*$/);
    if (!m) continue;
    let [, key, value] = m;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const REPO_ROOT = path.resolve(__dirname, '..', '..');
loadEnvFile(path.join(REPO_ROOT, '.env.daily-dashboard'));
loadEnvFile(path.join(REPO_ROOT, '.env'));

const ACTOR_ID = process.env.APIFY_ACTOR_ID || 'apify~instagram-scraper';
const TOKEN_STATE_FILE = path.join(REPO_ROOT, 'data', '.apify-active-token');

// --- Token rotation (auto-rotate on monthly usage limit) ---
// Supports APIFY_TOKEN (primary) and APIFY_TOKEN_BACKUP (secondary).
// Persists the active token between runs so we don't keep hitting an exhausted one.
const ALL_TOKENS = [process.env.APIFY_TOKEN, process.env.APIFY_TOKEN_BACKUP].filter(Boolean);
let _activeToken = null;
let _knownExhausted = new Set();

function _resetRunState() {
  _knownExhausted = new Set();
}

function _loadActiveToken() {
  if (_activeToken) return;
  // try saved state first
  try {
    const saved = fs.readFileSync(TOKEN_STATE_FILE, 'utf8').trim();
    if (ALL_TOKENS.includes(saved)) { _activeToken = saved; return; }
  } catch (e) { /* ignore */ }
  _activeToken = ALL_TOKENS[0] || '';
}

function _saveActiveToken() {
  try {
    const dir = path.dirname(TOKEN_STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TOKEN_STATE_FILE, _activeToken, 'utf8');
  } catch (e) { /* ignore */ }
}

function getActiveToken() {
  _loadActiveToken();
  return _activeToken;
}

function isHardLimitError(err) {
  const msg = String((err && err.message) || '');
  return /monthly usage hard limit|usage limit|limit exceeded|monthly.*lim|quota|429|402|payment.*required/i.test(msg);
}

function rotateToken() {
  _loadActiveToken();
  // exclude current token from candidates (it's exhausted)
  const candidates = ALL_TOKENS.filter(t => t !== _activeToken && !_knownExhausted.has(t));
  if (candidates.length === 0) {
    // fallback: try any other token
    const others = ALL_TOKENS.filter(t => t !== _activeToken);
    if (others.length === 0) return false;
    _activeToken = others[0];
  } else {
    _activeToken = candidates[0];
  }
  _saveActiveToken();
  return true;
}

function markTokenExhausted() {
  _loadActiveToken();
  _knownExhausted.add(_activeToken);
}
// --- end token rotation ---

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function runCmd(bin, args, options = {}) {
  return execFileSync(bin, args, {
    cwd: options.cwd,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function sleep(ms) {
  return new Promise(function(resolve){ setTimeout(resolve, ms); });
}

function loadAccounts(repoRoot) {
  return readJson(path.join(repoRoot, 'config', 'accounts.json')).filter((a) => a.enabled);
}

function getRun(runId) {
  const out = runCmd('curl', [
    '-sS',
    '-H', `Authorization: Bearer ${getActiveToken()}`,
    `https://api.apify.com/v2/actor-runs/${runId}`
  ]);

  const parsed = JSON.parse(out);
  return parsed.data || {};
}

async function waitForRunCompletion(runId, username, options) {
  options = options || {};
  const maxAttempts = options.maxAttempts || 30;
  const delayMs = options.delayMs || 10000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const run = getRun(runId);
    const status = run.status;

    if (status === 'SUCCEEDED') {
      return run;
    }

    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(
        `Apify run failed for ${username}: status=${status} runId=${runId} message=${run.statusMessage || 'no status message'}`
      );
    }

    if (!['READY', 'RUNNING'].includes(status)) {
      throw new Error(
        `Apify run unexpected status for ${username}: status=${status || 'unknown'} runId=${runId}`
      );
    }

    if (attempt < maxAttempts) {
      const backoff = Math.min(delayMs * Math.pow(2, attempt - 1), 60000);
      console.error('[' + username + '] Poll ' + attempt + '/' + maxAttempts + ' - status=' + status + ' - retry in ' + (backoff/1000) + 's');
      await sleep(backoff);
    }
  }

  const finalRun = getRun(runId);
  throw new Error(
    `Apify run did not finish in time for ${username}: status=${finalRun.status || 'unknown'} runId=${runId} message=${finalRun.statusMessage || 'no status message'}`
  );
}

async function callApifyRun(username, resultsLimit) {
  resultsLimit = resultsLimit || 12;
  const token = getActiveToken();
  if (!token) {
    throw new Error('No Apify token available (both APIFY_TOKEN and APIFY_TOKEN_BACKUP are empty)');
  }

  const payload = {
    directUrls: [`https://www.instagram.com/${username}/`],
    resultsLimit,
    resultsType: 'posts'
  };

  const out = runCmd('curl', [
    '-sS',
    '-X', 'POST',
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?waitForFinish=600`,
    '-H', `Authorization: Bearer ${token}`,
    '-H', 'Content-Type: application/json',
    '--data', JSON.stringify(payload)
  ]);

  const parsed = JSON.parse(out);
  let data = parsed.data || {};
  const status = data.status;

  if (status === 'SUCCEEDED' && data.defaultDatasetId) {
    return data;
  }

  if (['READY', 'RUNNING'].includes(status) && data.id) {
    data = await waitForRunCompletion(data.id, username, {
      maxAttempts: 50,
      delayMs: 10000
    });

    if (data.status === 'SUCCEEDED' && data.defaultDatasetId) {
      return data;
    }
  }

  if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(data.status)) {
    throw new Error(
      `Apify run failed for ${username}: status=${data.status} runId=${data.id || 'unknown'} message=${data.statusMessage || parsed.error?.message || 'unknown error'}`
    );
  }

  throw new Error(
    `Apify run failed for ${username}: status=${data.status || 'unknown'} runId=${data.id || 'unknown'} message=${data.statusMessage || parsed.error?.message || 'unknown error'}`
  );
}

function fetchDatasetItems(datasetId) {
  const out = runCmd('curl', [
    '-sS',
    '-H', `Authorization: Bearer ${getActiveToken()}`,
    `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`
  ]);
  const items = JSON.parse(out || '[]');
  if (!Array.isArray(items)) throw new Error('Apify dataset items response is not an array');
  return items;
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const accounts = loadAccounts(repoRoot);
  const outDir = path.join(repoRoot, 'incoming', 'apify');
  const datasetsDir = path.join(outDir, 'datasets');
  ensureDir(datasetsDir);

  _resetRunState();
  const results = [];

  for (const account of accounts) {
    const username = account.username;
    const maxTokenAttempts = ALL_TOKENS.length;
    let result = null;

    for (let attempt = 0; attempt < maxTokenAttempts; attempt++) {
      try {
        // Apify occasionally returns SUCCEEDED with an EMPTY dataset (Instagram
        // flakiness). Retry with backoff to get FRESH posts instead of falling
        // back to stale data. Never accept an empty dataset silently.
        let run = null;
        let items = [];
        const maxEmptyRetries = 3;
        const emptyRetryDelayMs = 30000;
        for (let emptyRetry = 1; emptyRetry <= maxEmptyRetries; emptyRetry++) {
          run = await callApifyRun(username, 12);
          items = fetchDatasetItems(run.defaultDatasetId);
          if (items.length > 0) break;
          if (emptyRetry < maxEmptyRetries) {
            console.error(`[${username}] empty dataset (attempt ${emptyRetry}/${maxEmptyRetries}) - retry in ${emptyRetryDelayMs / 1000}s`);
            await sleep(emptyRetryDelayMs);
          }
        }
        // Still empty after all retries: DO NOT overwrite the previous good
        // dataset/latest12 file with empty data. Throw so the account is marked
        // error and yesterday's fresh data is preserved.
        if (items.length === 0) {
          throw new Error(`Apify returned an empty dataset for ${username} after ${maxEmptyRetries} retries - keeping previous data`);
        }

        const datasetPath = path.join(datasetsDir, `${username}.json`);
        writeJson(datasetPath, items);

        const transformSummary = JSON.parse(runCmd('node', [
          path.join(repoRoot, 'scripts', 'apify', 'transform-apify-posts.js'),
          username,
          datasetPath,
          String(account.followers)
        ]));

        result = {
          username,
          status: 'processed',
          apifyRunId: run.id,
          datasetId: run.defaultDatasetId,
          items: items.length,
          transform: transformSummary
        };
        break; // success, exit token retry loop
      } catch (error) {
        if (isHardLimitError(error) && attempt + 1 < maxTokenAttempts) {
          markTokenExhausted();
          if (rotateToken()) {
            console.error(`[${username}] token exhausted - rotating, retry ${attempt + 2}/${maxTokenAttempts}`);
            continue;
          }
        }
        result = { username, status: 'error', reason: error.message };
        break;
      }
    }

    results.push(result);
  }

  const summary = {
    actor: ACTOR_ID,
    processed: results.filter((r) => r.status === 'processed').length,
    errors: results.filter((r) => r.status === 'error').length,
    accounts: results
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.errors > 0 ? 2 : 0);
}

main().catch(function(err){
  console.error('Fatal error:', err.message);
  process.exit(1);
});