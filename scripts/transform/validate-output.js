const fs = require('fs');
const path = require('path');

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const username = process.argv[2];
  if (!username) {
    console.error('Usage: node scripts/transform/validate-output.js <username>');
    process.exit(1);
  }

  const repoRoot = path.resolve(__dirname, '..', '..');
  const rawPath = path.join(repoRoot, 'data', 'raw', 'posts', `${username}-latest12-full.json`);
  const metricsPath = path.join(repoRoot, 'data', 'processed', 'metrics', `${username}-metrics.json`);
  const mergedPath = path.join(repoRoot, 'data', 'processed', 'merged', `${username}.json`);

  const raw = safeReadJson(rawPath);
  const metrics = safeReadJson(metricsPath);
  const merged = safeReadJson(mergedPath);
  const issues = [];

  if (!raw) issues.push(`Missing raw posts file: ${rawPath}`);
  if (!metrics) issues.push(`Missing metrics file: ${metricsPath}`);
  if (!merged) issues.push(`Missing merged file: ${mergedPath}`);

  if (raw && !Array.isArray(raw.posts)) {
    issues.push('Raw posts file has no posts array');
  }
  if (raw && Array.isArray(raw.posts) && raw.posts.length === 0) {
    issues.push('Raw posts file contains zero posts');
  }
  if (metrics && typeof metrics.avg_likes !== 'number' && typeof metrics.engagement?.avg_likes !== 'number') {
    issues.push('Metrics file missing avg_likes');
  }
  if (merged && !merged.profile) {
    issues.push('Merged file missing profile block');
  }
  if (merged && !merged.metrics) {
    issues.push('Merged file missing metrics block');
  }

  const ok = issues.length === 0;
  console.log(JSON.stringify({ ok, username, issues }, null, 2));
  process.exit(ok ? 0 : 2);
}

main();
