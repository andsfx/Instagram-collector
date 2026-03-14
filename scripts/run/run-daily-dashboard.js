const path = require('path');
const { execFileSync } = require('child_process');

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

function hasChanges(repoRoot, paths) {
  const out = execFileSync('git', ['status', '--porcelain', '--', ...paths], {
    cwd: repoRoot,
    encoding: 'utf8'
  }).trim();
  return out.length > 0;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const today = new Date().toISOString().slice(0, 10);
  const skipCollect = process.argv.includes('--skip-collect');
  const skipCommit = process.argv.includes('--skip-commit');
  const skipPush = process.argv.includes('--skip-push');

  const summary = {
    date: today,
    hybridMaster: null,
    dashboardBuild: null,
    git: {
      changed: false,
      committed: false,
      pushed: false,
      commitMessage: null
    }
  };

  if (!skipCollect) {
    summary.hybridMaster = JSON.parse(run('node', [path.join(repoRoot, 'scripts', 'run', 'run-hybrid-master.js')], { cwd: repoRoot }).split('\n').slice(-1)[0] || '{}');
  } else {
    console.log('\n>>> skip hybrid master (--skip-collect)');
    summary.hybridMaster = { status: 'skipped' };
  }

  summary.dashboardBuild = JSON.parse(run('node', [path.join(repoRoot, 'scripts', 'export', 'build-dashboard-data.js')], { cwd: repoRoot }));

  const trackedPaths = ['dashboard/data.json'];
  summary.git.changed = hasChanges(repoRoot, trackedPaths);

  if (summary.git.changed && !skipCommit) {
    run('git', ['add', ...trackedPaths], { cwd: repoRoot });
    const commitMessage = `Update daily dashboard data (${today})`;
    run('git', ['commit', '-m', commitMessage], { cwd: repoRoot });
    summary.git.committed = true;
    summary.git.commitMessage = commitMessage;
  } else if (!summary.git.changed) {
    console.log('\n>>> no dashboard/data.json changes detected');
  } else {
    console.log('\n>>> skip commit (--skip-commit)');
  }

  if ((summary.git.changed || summary.git.committed) && !skipPush) {
    run('git', ['push', 'origin', 'HEAD:main'], { cwd: repoRoot });
    summary.git.pushed = true;
  } else if (skipPush) {
    console.log('\n>>> skip push (--skip-push)');
  }

  console.log('\n=== DAILY DASHBOARD SUMMARY ===');
  console.log(JSON.stringify(summary, null, 2));
}

main();
