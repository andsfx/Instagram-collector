const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function run(cmd, args, options = {}) {
  const label = [cmd, ...args].join(' ');
  console.log(`\n>>> ${label}`);
  const out = execFileSync(cmd, args, {
    cwd: options.cwd,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (out && out.trim()) console.log(out.trim());
  return out;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const accounts = readJson(path.join(repoRoot, 'config', 'accounts.json')).filter((a) => a.enabled);

  if (!process.env.APIFY_TOKEN) {
    throw new Error('APIFY_TOKEN is required for hybrid master run');
  }

  const summary = {
    socialblade: { processed: 0, errors: 0, accounts: [] },
    followerHistory: null,
    apifyBatch: null,
    sheetSync: null,
  };

  // 1) SocialBlade stats per account
  for (const account of accounts) {
    try {
      const out = run('python3', [path.join(repoRoot, 'scripts', 'socialblade', 'collect-socialblade-stats.py'), account.username], { cwd: repoRoot });
      summary.socialblade.processed += 1;
      summary.socialblade.accounts.push({ username: account.username, status: 'processed', output: JSON.parse(out) });
    } catch (error) {
      summary.socialblade.errors += 1;
      summary.socialblade.accounts.push({ username: account.username, status: 'error', reason: error.message });
    }
  }

  // 2) Update Follower History from collected stats
  try {
    const out = run('node', [path.join(repoRoot, 'scripts', 'socialblade', 'update-follower-history.js')], { cwd: repoRoot });
    summary.followerHistory = JSON.parse(out);
  } catch (error) {
    summary.followerHistory = { status: 'error', reason: error.message };
  }

  // 3) Run Apify batch
  try {
    const out = run('node', [path.join(repoRoot, 'scripts', 'apify', 'run-apify-batch.js')], { cwd: repoRoot });
    summary.apifyBatch = JSON.parse(out);
  } catch (error) {
    summary.apifyBatch = { status: 'error', reason: error.message };
  }

  // 4) Sync Engagement + Content Breakdown
  try {
    const out = run('node', [path.join(repoRoot, 'scripts', 'sync', 'update-google-sheet.js'), '--all'], {
      cwd: repoRoot,
      env: process.env.GOG_KEYRING_PASSWORD ? { GOG_KEYRING_PASSWORD: process.env.GOG_KEYRING_PASSWORD } : {}
    });
    summary.sheetSync = JSON.parse(out);
  } catch (error) {
    summary.sheetSync = { status: 'error', reason: error.message };
  }

  console.log('\n=== HYBRID MASTER SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
}

main();
