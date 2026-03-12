const fs = require("fs");
const path = require("path");

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function pickProfileStats(profileData, fallbackFollowers = null) {
  if (!profileData || typeof profileData !== "object") {
    return {
      followers: fallbackFollowers,
      following: null,
      posts_count: null
    };
  }

  return {
    followers:
      profileData.followers ??
      profileData.followers_count ??
      profileData.edge_followed_by?.count ??
      fallbackFollowers ??
      null,
    following:
      profileData.following ??
      profileData.following_count ??
      profileData.edge_follow?.count ??
      null,
    posts_count:
      profileData.posts_count ??
      profileData.posts ??
      profileData.edge_owner_to_timeline_media?.count ??
      null
  };
}

function pickMetrics(metricsData) {
  if (!metricsData || typeof metricsData !== "object") {
    return {
      analyzed_posts: null,
      total_likes: null,
      total_comments: null,
      avg_likes: null,
      avg_comments: null,
      engagement_rate: null
    };
  }

  return {
    analyzed_posts:
      metricsData.analyzed_posts ??
      metricsData.posts_analyzed ??
      metricsData.total_posts ??
      null,
    total_likes: metricsData.total_likes ?? null,
    total_comments: metricsData.total_comments ?? null,
    avg_likes: metricsData.avg_likes ?? null,
    avg_comments: metricsData.avg_comments ?? null,
    engagement_rate:
      metricsData.engagement_rate ??
      metricsData.er ??
      null
  };
}

function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: node scripts/transform/merge-instagram-dataset.js <username>");
    process.exit(1);
  }

  const repoRoot = path.resolve(__dirname, "..", "..");
  const accountsPath = path.join(repoRoot, "config", "accounts.json");
  const rawProfilesDir = path.join(repoRoot, "data", "raw", "profiles");
  const processedMetricsDir = path.join(repoRoot, "data", "processed", "metrics");
  const mergedDir = path.join(repoRoot, "data", "processed", "merged");

  ensureDir(mergedDir);

  const accounts = safeReadJson(accountsPath) || [];
  const accountConfig = accounts.find((a) => a.username === username) || null;
  const fallbackFollowers = accountConfig?.followers ?? null;

  const profilePath = path.join(rawProfilesDir, `${username}.json`);
  const metricsPath = path.join(processedMetricsDir, `${username}-metrics.json`);

  const profileData = safeReadJson(profilePath);
  const metricsData = safeReadJson(metricsPath);

  const merged = {
    date: todayUtc(),
    username,
    profile: pickProfileStats(profileData, fallbackFollowers),
    metrics: pickMetrics(metricsData),
    sources: {
      profile_stats: profileData ? "scrapling" : "fallback-config",
      post_metrics: metricsData ? "json" : "missing"
    }
  };

  const outputPath = path.join(mergedDir, `${username}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`Merged dataset written to ${outputPath}`);
}

main();
