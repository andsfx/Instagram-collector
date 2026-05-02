const fs = require('fs');
const path = require('path');
const { supabase } = require('../lib/supabase');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const accounts = readJson(path.join(repoRoot, 'config', 'accounts.json')).filter((a) => a.enabled);
  const statsDir = path.join(repoRoot, 'data', 'raw', 'stats');
  const orderedUsers = accounts.map((a) => a.username);

  const results = [];
  let date = null;

  for (const username of orderedUsers) {
    const statsPath = path.join(statsDir, `${username}-stats.json`);
    if (!fs.existsSync(statsPath)) {
      results.push({ username, status: 'skipped', reason: 'stats file missing' });
      continue;
    }

    const stats = readJson(statsPath);
    if (!date && stats.date) date = stats.date;

    // Ensure account exists
    const { error: accountError } = await supabase
      .from('accounts')
      .upsert({
        username,
        followers: Number(stats.followers || 0),
        enabled: true,
      }, { onConflict: 'username' });

    if (accountError) {
      results.push({ username, status: 'error', reason: `Account upsert: ${accountError.message}` });
      continue;
    }

    // Upsert follower history
    const { error: historyError } = await supabase
      .from('follower_history')
      .upsert({
        date: stats.date,
        username,
        followers: Number(stats.followers || 0) || null,
        following: Number(stats.following || 0) || null,
        posts: Number(stats.posts_count || 0) || null,
      }, { onConflict: 'date,username' });

    if (historyError) {
      results.push({ username, status: 'error', reason: `History upsert: ${historyError.message}` });
      continue;
    }

    results.push({ username, status: 'processed', date: stats.date });
  }

  if (!date) {
    console.error('No stats files found in data/raw/stats');
    process.exit(1);
  }

  const summary = {
    action: results.some((r) => r.status === 'processed') ? 'upsert' : 'none',
    date,
    processed: results.filter((r) => r.status === 'processed').length,
    errors: results.filter((r) => r.status === 'error').length,
    accounts: results,
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.errors > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
