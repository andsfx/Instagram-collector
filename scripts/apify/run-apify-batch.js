const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ACTOR_ID = process.env.APIFY_ACTOR_ID || 'apify~instagram-scraper';

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
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function loadAccounts(repoRoot) {
  return readJson(path.join(repoRoot, 'config', 'accounts.json')).filter((a) => a.enabled);
}

function getRun(runId) {
  const out = runCmd('curl', [
    '-sS',
    `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
  ]);

  const parsed = JSON.parse(out);
  return parsed.data || {};
}

function waitForRunCompletion(runId, username, options = {}) {
  const maxAttempts = options.maxAttempts || 12;
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
      sleep(delayMs);
    }
  }

  const finalRun = getRun(runId);
  throw new Error(
    `Apify run did not finish in time for ${username}: status=${finalRun.status || 'unknown'} runId=${runId} message=${finalRun.statusMessage || 'no status message'}`
  );
}

function callApifyRun(username, resultsLimit = 12) {
  if (!APIFY_TOKEN) {
    throw new Error('APIFY_TOKEN is required');
  }

  const payload = {
    directUrls: [`https://www.instagram.com/${username}/`],
    resultsLimit,
    resultsType: 'posts'
  };

  const out = runCmd('curl', [
    '-sS',
    '-X', 'POST',
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}&waitForFinish=180`,
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
    data = waitForRunCompletion(data.id, username, {
      maxAttempts: 12,
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
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true`
  ]);
  const items = JSON.parse(out || '[]');
  if (!Array.isArray(items)) throw new Error('Apify dataset items response is not an array');
  return items;
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const accounts = loadAccounts(repoRoot);
  const outDir = path.join(repoRoot, 'incoming', 'apify');
  const datasetsDir = path.join(outDir, 'datasets');
  ensureDir(datasetsDir);

  const results = [];

  for (const account of accounts) {
    const username = account.username;
    try {
      const run = callApifyRun(username, 12);
      const items = fetchDatasetItems(run.defaultDatasetId);
      const datasetPath = path.join(datasetsDir, `${username}.json`);
      writeJson(datasetPath, items);

      const transformSummary = JSON.parse(runCmd('node', [
        path.join(repoRoot, 'scripts', 'apify', 'transform-apify-posts.js'),
        username,
        datasetPath,
        String(account.followers)
      ]));

      results.push({
        username,
        status: 'processed',
        apifyRunId: run.id,
        datasetId: run.defaultDatasetId,
        items: items.length,
        transform: transformSummary
      });
    } catch (error) {
      results.push({
        username,
        status: 'error',
        reason: error.message
      });
    }
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

main();
