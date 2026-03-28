const { execFileSync } = require('child_process');
const fs = require('fs');

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ACTOR_ID = process.env.APIFY_ACTOR_ID || 'apify~instagram-scraper';

function runCmd(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function getProfile(username) {
  const payload = {
    directUrls: [`https://www.instagram.com/${username}/`],
    resultsType: 'details'
  };

  const out = runCmd('curl', [
    '-sS',
    '-X', 'POST',
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}&waitForFinish=180`,
    '-H', 'Content-Type: application/json',
    '--data', JSON.stringify(payload)
  ]);

  const parsed = JSON.parse(out);
  const data = parsed.data || {};
  if (!data.defaultDatasetId || data.status !== 'SUCCEEDED') {
    throw new Error(`Apify run failed for ${username}: ${data.status || parsed.error?.message || 'unknown error'}`);
  }

  const datasetOut = runCmd('curl', [
    '-sS',
    `https://api.apify.com/v2/datasets/${data.defaultDatasetId}/items?token=${APIFY_TOKEN}&clean=true`
  ]);
  const items = JSON.parse(datasetOut || '[]');
  return items[0];
}

const accounts = ['metmalbekasi', 'grandmetropolitan', 'metmalcileungsi', 'summareconmal.bekasi', 'pakuwonmallbekasi'];
const results = {};

for (const acc of accounts) {
  try {
    console.log(`Scraping profile for ${acc}...`);
    const profile = getProfile(acc);
    results[acc] = {
      followers: profile?.followersCount,
      following: profile?.followsCount,
      posts: profile?.postsCount
    };
    console.log(`  -> ${results[acc].followers} followers`);
  } catch (err) {
    console.error(`Error scraping ${acc}:`, err.message);
  }
}

fs.writeFileSync('/root/.openclaw/workspace/incoming/Instagram-collector/apify-profiles.json', JSON.stringify(results, null, 2));
console.log('Saved to apify-profiles.json');
