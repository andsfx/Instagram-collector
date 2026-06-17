const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

// Supabase credentials loaded from .env by scripts/lib/supabase.js

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
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024
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

function checkSupabaseAuth() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const err = new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    err.code = 'MISSING_SUPABASE_CREDENTIALS';
    err.stage = 'preflight';
    throw err;
  }
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

function githubPushEnv() {
  const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  if (!token) return {};
  const fs = require('fs');
  const os = require('os');
  const askpass = path.join(os.tmpdir(), `git-askpass-dashboard-${process.pid}.sh`);
  fs.writeFileSync(askpass, `#!/bin/sh\ncase "$1" in\n  *Username*) echo "x-access-token" ;;\n  *Password*) echo "${token}" ;;\n  *) echo "" ;;\nesac\n`, { mode: 0o700 });

  // Register cleanup to remove the askpass file when the process exits
  function cleanupAskpass() {
    try { fs.unlinkSync(askpass); } catch (_) { /* ignore if already removed */ }
  }
  process.on('exit', cleanupAskpass);
  process.on('SIGINT', () => { cleanupAskpass(); process.exit(130); });
  process.on('SIGTERM', () => { cleanupAskpass(); process.exit(143); });

  return {
    GIT_ASKPASS: askpass,
    GIT_TERMINAL_PROMPT: '0'
  };
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
        SUPABASE_URL: false,
        SUPABASE_SERVICE_ROLE_KEY: false,
      },
      supabaseAuth: false,
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
    requireEnv('SUPABASE_URL');
    summary.preflight.env.SUPABASE_URL = true;
    requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    summary.preflight.env.SUPABASE_SERVICE_ROLE_KEY = true;

    checkSupabaseAuth();
    summary.preflight.supabaseAuth = true;
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

    const trackedPaths = ['dashboard/data.json', 'data/dashboard-snapshot.json', 'incoming/apify/datasets'];
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
      const pushEnv = githubPushEnv();
      const maxPushAttempts = 3;
      for (let attempt = 1; attempt <= maxPushAttempts; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`\n>>> push attempt ${attempt}/${maxPushAttempts}`);
          }
          // Post-merge safety: validate dashboard/data.json parses before push
          const dataJsonPath = path.join(repoRoot, 'dashboard', 'data.json');
          if (fs.existsSync(dataJsonPath)) {
            try {
              const dj = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
              if (!dj || typeof dj !== 'object' || !dj.generated_at) {
                throw new Error('missing required field: generated_at');
              }
              if (attempt > 1) {
                console.log('>>> data.json validation OK (parsed, generated_at present)');
              }
            } catch (parseErr) {
              // data.json corrupt — abort rebase if in progress, then fail hard
              try { execFileSync('git', ['rebase', '--abort'], { cwd: repoRoot }); } catch (_) {}
              const err = new Error(`dashboard/data.json invalid JSON after rebase: ${parseErr.message}`);
              err.stage = 'git';
              err.code = 'GIT_DATA_JSON_CORRUPT';
              throw err;
            }
          }
          run('git', ['push', 'origin', 'HEAD:main'], { cwd: repoRoot, env: pushEnv });
          summary.git.pushed = true;
          break;
        } catch (pushError) {
          if (attempt >= maxPushAttempts) {
            pushError.stage = 'git';
            pushError.code = pushError.code || 'GIT_PUSH_FAILED';
            throw pushError;
          }
          // Pull rebase and retry
          console.log('\n>>> push rejected, pulling with rebase...');
          try {
            run('git', ['pull', '--rebase', 'origin', 'main'], { cwd: repoRoot, env: pushEnv });
          } catch (pullError) {
            // Check if rebase conflict on index.html (asset version)
            const conflictFiles = execFileSync('git', ['diff', '--name-only', '--diff-filter=U'], {
              cwd: repoRoot, encoding: 'utf8'
            }).trim();
            if (conflictFiles === 'dashboard/index.html' || conflictFiles.includes('dashboard/index.html')) {
              console.log('\n>>> auto-resolving index.html conflict (accept theirs + version bump)');
              execFileSync('git', ['checkout', '--theirs', 'dashboard/index.html'], { cwd: repoRoot });
              // Re-apply current asset version from data.json build
              const dataJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'dashboard', 'data.json'), 'utf8'));
              const assetVersion = dataJson.generated_at
                ? dataJson.generated_at.replace(/[-:T]/g, '').slice(0, 15).replace(/(\d{8})(\d{6})/, '$1_$2')
                : new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15).replace(/(\d{8})(\d{6})/, '$1_$2');
              const indexPath = path.join(repoRoot, 'dashboard', 'index.html');
              let indexHtml = fs.readFileSync(indexPath, 'utf8');
              indexHtml = indexHtml.replace(/\?v=\d{8}_\d{6}/g, `?v=${assetVersion}`);
              fs.writeFileSync(indexPath, indexHtml);
              execFileSync('git', ['add', 'dashboard/index.html'], { cwd: repoRoot });
              execFileSync('git', ['-c', 'core.editor=true', 'rebase', '--continue'], { cwd: repoRoot });
            } else if (/^incoming\/apify\/datasets\/.*\.json$/.test(conflictFiles) || conflictFiles.split('\n').every(f => /^incoming\/apify\/datasets\/.*\.json$/.test(f))) {
              // Apify dataset JSON conflict: accept theirs, validate, then continue
              console.log('\n>>> auto-resolving Apify dataset conflict (accept theirs + JSON validate)');
              const conflicted = conflictFiles.split('\n').filter(Boolean);
              for (const f of conflicted) {
                execFileSync('git', ['checkout', '--theirs', f], { cwd: repoRoot });
                // Validate JSON after checkout
                try {
                  JSON.parse(fs.readFileSync(path.join(repoRoot, f), 'utf8'));
                } catch (parseErr) {
                  console.error(`\n>>> FATAL: ${f} still invalid JSON after theirs checkout — aborting rebase`);
                  try { execFileSync('git', ['rebase', '--abort'], { cwd: repoRoot }); } catch (_) {}
                  pullError.stage = 'git';
                  pullError.code = 'GIT_DATASET_INVALID_JSON';
                  pullError.message = `Apify dataset ${f} is invalid JSON after taking theirs version. Aborted rebase. Manual fix: cd ~/Instagram-collector && git rebase --abort; check origin/main for valid ${f} and merge manually.`;
                  throw pullError;
                }
                execFileSync('git', ['add', f], { cwd: repoRoot });
              }
              execFileSync('git', ['-c', 'core.editor=true', 'rebase', '--continue'], { cwd: repoRoot });
            } else if (conflictFiles.split('\n').every(f => f && /\.json$/.test(f))) {
              // Generic JSON file conflict (non-dataset, e.g. dashboard/data.json): take theirs + JSON validate
              console.log('\n>>> auto-resolving generic JSON conflict (accept theirs + validate)');
              const conflicted = conflictFiles.split('\n').filter(Boolean);
              for (const f of conflicted) {
                execFileSync('git', ['checkout', '--theirs', f], { cwd: repoRoot });
                try {
                  JSON.parse(fs.readFileSync(path.join(repoRoot, f), 'utf8'));
                } catch (parseErr) {
                  console.error(`\n>>> FATAL: ${f} still invalid JSON after theirs checkout — aborting rebase`);
                  try { execFileSync('git', ['rebase', '--abort'], { cwd: repoRoot }); } catch (_) {}
                  pullError.stage = 'git';
                  pullError.code = 'GIT_JSON_INVALID_AFTER_THEIRS';
                  pullError.message = `${f} is invalid JSON after taking theirs version. Aborted rebase. Manual fix: cd ~/Instagram-collector && git rebase --abort; check origin/main for valid ${f} and merge manually.`;
                  throw pullError;
                }
                execFileSync('git', ['add', f], { cwd: repoRoot });
              }
              execFileSync('git', ['-c', 'core.editor=true', 'rebase', '--continue'], { cwd: repoRoot });
            } else {
              // Non-JSON or mixed conflict: conservative abort (safer than silent overwrite)
              try { execFileSync('git', ['rebase', '--abort'], { cwd: repoRoot }); } catch (_) {}
              pullError.stage = 'git';
              pullError.code = 'GIT_PULL_REBASE_CONFLICT';
              pullError.message = `Unresolvable rebase conflict on non-JSON or mixed files: ${conflictFiles.replace(/\n/g, ', ')}. Manual fix: cd ~/Instagram-collector && git rebase --abort; resolve ${conflictFiles.split('\n')[0]} manually.`;
              throw pullError;
            }
          }
        }
      }
    } else if (skipPush) {
      console.log('\n>>> skip push (--skip-push)');
    }

    summary.workflowStatus = 'success';
    summary.message = summary.git.changed
      ? 'Daily dashboard automation completed successfully.'
      : 'Daily dashboard automation completed successfully with no dashboard asset changes.';

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
