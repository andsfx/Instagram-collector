const path = require('path');
const { execFileSync } = require('child_process');

const SHEET_ID = '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U';

function loadEnvFile(filePath) {
  const fs = require('fs');
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, key, value] = m;
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
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

function extractTrailingJson(output) {
  const text = String(output || '').trim();
  for (let i = text.lastIndexOf('{'); i >= 0; i = text.lastIndexOf('{', i - 1)) {
    const candidate = text.slice(i);
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }
  return null;
}

function hasChanges(repoRoot, paths) {
  const out = execFileSync('git', ['status', '--porcelain', '--', ...paths], {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim();
  return out.length > 0;
}

function requireEnv(name) {
  if (!process.env[name] || !String(process.env[name]).trim()) {
    const err = new Error(`${name} is required`);
    err.code = `MISSING_${name}`;
    err.stage = 'preflight';
    throw err;
  }
}

function gogBin() {
  if (process.env.GOG_BIN) return process.env.GOG_BIN;
  return process.platform === 'win32' ? 'gog' : '/root/.local/bin/gog';
}

function checkGogSheetsAuth(repoRoot) {
  run(gogBin(), [
    'sheets', 'get',
    SHEET_ID,
    'Follower History!A1:A2',
    '--json',
    '--results-only',
    '--no-input'
  ], { cwd: repoRoot });
}

function assertHybridSummaryHealthy(summary) {
  if (!summary || typeof summary !== 'object') {
    const err = new Error('Hybrid master summary missing or invalid');
    err.code = 'HYBRID_SUMMARY_INVALID';
    err.stage = 'hybrid';
    throw err;
  }

  const failures = [];
  if (summary?.socialblade?.errors > 0) {
    failures.push(`SocialBlade errors: ${summary.socialblade.errors}`);
  }
  if (summary?.followerHistory?.status === 'error') {
    failures.push(`Follower History: ${summary.followerHistory.reason || 'unknown error'}`);
  }
  if (summary?.apifyBatch?.status === 'error') {
    failures.push(`Apify batch: ${summary.apifyBatch.reason || 'unknown error'}`);
  }
  if (summary?.sheetSync?.status === 'error') {
    failures.push(`Sheet sync: ${summary.sheetSync.reason || 'unknown error'}`);
  }

  if (failures.length) {
    const err = new Error(failures.join(' | '));
    err.code = 'HYBRID_FAILED';
    err.stage = 'hybrid';
    throw err;
  }
}

function mappedExitCode(error) {
  if (!error) return 1;
  if (error.stage === 'preflight') return 2;
  if (error.stage === 'hybrid' || error.stage === 'build') return 3;
  if (error.stage === 'git') return 4;
  return 1;
}

function ensureGitIdentity(repoRoot) {
  const name = process.env.GIT_AUTHOR_NAME || process.env.GIT_COMMITTER_NAME || 'andsfx';
  const email = process.env.GIT_AUTHOR_EMAIL || process.env.GIT_COMMITTER_EMAIL || '79969685+andsfx@users.noreply.github.com';
  run('git', ['config', 'user.name', name], { cwd: repoRoot });
  run('git', ['config', 'user.email', email], { cwd: repoRoot });
  return { name, email };
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  loadEnvFile(path.join(repoRoot, '.env.daily-dashboard'));
  loadEnvFile(path.join(repoRoot, '.env'));

  const today = new Date().toISOString().slice(0, 10);
  const skipCollect = process.argv.includes('--skip-collect');
  const skipCommit = process.argv.includes('--skip-commit');
  const skipPush = process.argv.includes('--skip-push');

  const summary = {
    date: today,
    workflowStatus: 'running',
    errorStage: null,
    errorCode: null,
    message: null,
    preflight: {
      ok: false,
      env: {
        APIFY_TOKEN: false,
        GOG_KEYRING_PASSWORD: false,
        GOG_ACCOUNT: false,
      },
      gogSheetsAuth: false,
    },
    hybridMaster: null,
    dashboardBuild: null,
    git: {
      identity: null,
      changed: false,
      committed: false,
      pushed: false,
      commitMessage: null
    }
  };

  try {
    requireEnv('APIFY_TOKEN');
    summary.preflight.env.APIFY_TOKEN = true;
    requireEnv('GOG_KEYRING_PASSWORD');
    summary.preflight.env.GOG_KEYRING_PASSWORD = true;
    requireEnv('GOG_ACCOUNT');
    summary.preflight.env.GOG_ACCOUNT = true;

    checkGogSheetsAuth(repoRoot);
    summary.preflight.gogSheetsAuth = true;
    summary.preflight.ok = true;

    if (!skipCollect) {
      const hybridOut = run('node', [path.join(repoRoot, 'scripts', 'run', 'run-hybrid-master.js')], { cwd: repoRoot });
      summary.hybridMaster = extractTrailingJson(hybridOut) || { status: 'unknown' };
      assertHybridSummaryHealthy(summary.hybridMaster);
    } else {
      console.log('\n>>> skip hybrid master (--skip-collect)');
      summary.hybridMaster = { status: 'skipped' };
    }

    const buildOut = run('node', [path.join(repoRoot, 'scripts', 'export', 'build-dashboard-data.js')], { cwd: repoRoot });
    summary.dashboardBuild = extractTrailingJson(buildOut) || { status: 'unknown' };

    const trackedPaths = ['dashboard/data.json'];
    summary.git.changed = hasChanges(repoRoot, trackedPaths);

    if (summary.git.changed && !skipCommit) {
      try {
        summary.git.identity = ensureGitIdentity(repoRoot);
        run('git', ['add', ...trackedPaths], { cwd: repoRoot });
        const commitMessage = `Update daily dashboard data (${today})`;
        run('git', ['commit', '-m', commitMessage], { cwd: repoRoot });
        summary.git.committed = true;
        summary.git.commitMessage = commitMessage;
      } catch (error) {
        error.stage = 'git';
        error.code = error.code || 'GIT_COMMIT_FAILED';
        throw error;
      }
    } else if (!summary.git.changed) {
      console.log('\n>>> no dashboard/data.json changes detected');
    } else {
      console.log('\n>>> skip commit (--skip-commit)');
    }

    if ((summary.git.changed || summary.git.committed) && !skipPush) {
      try {
        run('git', ['push', 'origin', 'HEAD:main'], { cwd: repoRoot });
        summary.git.pushed = true;
      } catch (error) {
        error.stage = 'git';
        error.code = error.code || 'GIT_PUSH_FAILED';
        throw error;
      }
    } else if (skipPush) {
      console.log('\n>>> skip push (--skip-push)');
    }

    summary.workflowStatus = 'success';
    summary.message = summary.git.changed
      ? 'Daily dashboard automation completed successfully.'
      : 'Daily dashboard automation completed successfully with no dashboard/data.json changes.';

    console.log('\n=== DAILY DASHBOARD SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  } catch (error) {
    summary.workflowStatus = 'error';
    summary.errorStage = error.stage || 'unknown';
    summary.errorCode = error.code || 'UNHANDLED_ERROR';
    summary.message = error.message || 'Unknown error';

    console.log('\n=== DAILY DASHBOARD SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));
    process.exit(mappedExitCode(error));
  }
}

main();
