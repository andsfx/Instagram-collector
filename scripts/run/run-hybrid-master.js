const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function run(cmd, args, options = {}) {
  const label = [cmd, ...args].join(' ');
  const timeout = options.timeout || 120000; // default 2 min per step
  console.log(`\n>>> ${label} (timeout: ${timeout / 1000}s)`);
  const out = execFileSync(cmd, args, {
    cwd: options.cwd,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024,
    timeout
  });
  if (out && out.trim()) console.log(out.trim());
  return out;
}

function extractTrailingJson(output) {
  const text = String(output || '').trim();
  if (!text) return null;
  
  // Find last complete JSON object by scanning backwards
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === '}') {
      // Found potential end, now find matching opening brace
      let depth = 0;
      let start = -1;
      for (let j = i; j >= 0; j--) {
        if (text[j] === '}') depth++;
        if (text[j] === '{') {
          depth--;
          if (depth === 0) {
            start = j;
            break;
          }
        }
      }
      if (start >= 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch (_) {}
      }
    }
  }
  return null;
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
      const out = run('/usr/bin/python3', [path.join(repoRoot, 'scripts', 'socialblade', 'collect-socialblade-stats.py'), account.username], { cwd: repoRoot });
      summary.socialblade.processed += 1;
      const parsed = extractTrailingJson(out);
      summary.socialblade.accounts.push({ username: account.username, status: 'processed', output: parsed || {} });
    } catch (error) {
      summary.socialblade.errors += 1;
      summary.socialblade.accounts.push({ username: account.username, status: 'error', reason: error.message });
    }
  }

  // 2) Update Follower History from collected stats
  try {
    const out = run('node', [path.join(repoRoot, 'scripts', 'socialblade', 'update-follower-history-supabase.js')], { cwd: repoRoot });
    summary.followerHistory = extractTrailingJson(out) || { status: 'unknown' };
  } catch (error) {
    summary.followerHistory = { status: 'error', reason: error.message };
  }

  // 3) Run Apify batch
  try {
    const out = run('node', [path.join(repoRoot, 'scripts', 'apify', 'run-apify-batch.js')], { cwd: repoRoot });
    summary.apifyBatch = extractTrailingJson(out) || { status: 'unknown' };
  } catch (error) {
    summary.apifyBatch = { status: 'error', reason: error.message };
  }

  // 4) Sync Engagement + Content Breakdown
  try {
    const out = run('node', [path.join(repoRoot, 'scripts', 'sync', 'update-supabase.js'), '--all'], {
      cwd: repoRoot
    });
    summary.sheetSync = extractTrailingJson(out) || { status: 'unknown' };
  } catch (error) {
    summary.sheetSync = { status: 'error', reason: error.message };
  }

  console.log('\n=== HYBRID MASTER SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
}

main();
