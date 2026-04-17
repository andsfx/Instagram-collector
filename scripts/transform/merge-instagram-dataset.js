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

function pickProfileStats(profileData, socialBladeStats = null) {
  const socialFollowers = socialBladeStats?.followers ?? null;
  const socialFollowing = socialBladeStats?.following ?? null;
  const socialPosts = socialBladeStats?.posts_count ?? null;

  if (!profileData || typeof profileData !== "object") {
    return {
      followers: socialFollowers,
      following: socialFollowing,
      posts_count: socialPosts
    };
  }

  return {
    followers:
      socialFollowers ??
      profileData.followers ??
      profileData.followers_count ??
      profileData.edge_followed_by?.count ??
      null,
    following:
      socialFollowing ??
      profileData.following ??
      profileData.following_count ??
      profileData.edge_follow?.count ??
      null,
    posts_count:
      socialPosts ??
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
  accounts.find((a) => a.username === username) || null;

  const profilePath = path.join(rawProfilesDir, `${username}.json`);
  const metricsPath = path.join(processedMetricsDir, `${username}-metrics.json`);
  const socialBladeStatsPath = path.join(repoRoot, "data", "raw", "stats", `${username}-stats.json`);

  const profileData = safeReadJson(profilePath);
  const metricsData = safeReadJson(metricsPath);
  const socialBladeStats = safeReadJson(socialBladeStatsPath);

  if (!socialBladeStats || socialBladeStats.ok === false) {
    console.error(`SocialBlade raw stats missing or invalid for ${username}`);
    process.exit(2);
  }

  const merged = {
    date: todayUtc(),
    username,
    profile: pickProfileStats(profileData, socialBladeStats),
    metrics: pickMetrics(metricsData),
    sources: {
      profile_stats: profileData ? "scrapling+socialblade" : "socialblade-raw-stats",
      post_metrics: metricsData ? "json" : "missing"
    }
  };

  const outputPath = path.join(mergedDir, `${username}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`Merged dataset written to ${outputPath}`);
}

main();
