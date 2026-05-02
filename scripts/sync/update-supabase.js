const fs = require("fs");
const path = require("path");
const { supabase } = require("../lib/supabase");

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConfig(repoRoot) {
  const accounts = safeReadJson(path.join(repoRoot, "config", "accounts.json")) || [];
  return { accounts };
}

function isMergedDataUsable(merged, metrics) {
  if (!merged || typeof merged !== "object") return false;
  if (!merged.username || !merged.date) return false;
  if (!metrics || typeof metrics !== "object") return false;
  return true;
}

function buildEngagementRow(merged, metrics) {
  return {
    date: merged.date,
    username: merged.username,
    posts_analyzed: Number(metrics.posts_analyzed ?? merged.metrics?.analyzed_posts ?? 0) || 0,
    avg_likes: Number(metrics.avg_likes ?? merged.metrics?.avg_likes ?? 0) || 0,
    avg_comments: Number(metrics.avg_comments ?? merged.metrics?.avg_comments ?? 0) || 0,
    engagement_rate: Number(metrics.engagement_rate ?? merged.metrics?.engagement_rate ?? 0) || 0,
    total_likes_last12: Number(metrics.total_likes ?? metrics.engagement?.total_likes_last12 ?? merged.metrics?.total_likes ?? 0) || 0,
    total_comments_last12: Number(metrics.total_comments ?? metrics.engagement?.total_comments_last12 ?? merged.metrics?.total_comments ?? 0) || 0,
  };
}

function buildContentBreakdownRow(merged, metrics) {
  const cb = metrics.content_breakdown || {};
  return {
    date: merged.date,
    username: merged.username,
    reels: Number(cb.reels ?? 0) || 0,
    carousel: Number(cb.carousel ?? 0) || 0,
    image: Number(cb.image ?? 0) || 0,
    video: Number(cb.video ?? 0) || 0,
    total_posts_analyzed: Number(cb.total_posts_analyzed ?? metrics.posts_analyzed ?? 0) || 0,
    avg_likes: Number(cb.avg_likes ?? metrics.avg_likes ?? 0) || 0,
    avg_comments: Number(cb.avg_comments ?? metrics.avg_comments ?? 0) || 0,
    engagement_rate: Number(cb.engagement_rate ?? metrics.engagement_rate ?? 0) || 0,
    reels_avg_likes: cb.reels_avg_likes != null ? Number(cb.reels_avg_likes) : null,
    reels_avg_comments: cb.reels_avg_comments != null ? Number(cb.reels_avg_comments) : null,
    reels_er: cb.reels_er != null ? Number(cb.reels_er) : null,
    carousel_avg_likes: cb.carousel_avg_likes != null ? Number(cb.carousel_avg_likes) : null,
    carousel_avg_comments: cb.carousel_avg_comments != null ? Number(cb.carousel_avg_comments) : null,
    carousel_er: cb.carousel_er != null ? Number(cb.carousel_er) : null,
    image_avg_likes: cb.image_avg_likes != null ? Number(cb.image_avg_likes) : null,
    image_avg_comments: cb.image_avg_comments != null ? Number(cb.image_avg_comments) : null,
    image_er: cb.image_er != null ? Number(cb.image_er) : null,
    best_post_url: cb.best_post_url || null,
    best_post_type: cb.best_post_type || null,
    best_post_likes: cb.best_post_likes != null ? Number(cb.best_post_likes) : null,
    best_post_comments: cb.best_post_comments != null ? Number(cb.best_post_comments) : null,
  };
}

async function processOne(repoRoot, username) {
  const mergedPath = path.join(repoRoot, "data", "processed", "merged", `${username}.json`);
  const metricsPath = path.join(repoRoot, "data", "processed", "metrics", `${username}-metrics.json`);
  const merged = safeReadJson(mergedPath);
  const metrics = safeReadJson(metricsPath);

  if (!merged || !metrics) {
    return { username, ok: false, skipped: true, reason: "Merged or metrics file missing" };
  }
  if (!isMergedDataUsable(merged, metrics)) {
    return { username, ok: false, skipped: true, reason: "Merged/metrics data not usable" };
  }

  const engagementRow = buildEngagementRow(merged, metrics);
  const contentRow = buildContentBreakdownRow(merged, metrics);

  // Upsert engagement
  const { error: engError } = await supabase
    .from("engagement")
    .upsert(engagementRow, { onConflict: "date,username" });

  if (engError) {
    return { username, ok: false, skipped: false, reason: `Engagement upsert failed: ${engError.message}` };
  }

  // Upsert content breakdown
  const { error: cbError } = await supabase
    .from("content_breakdown")
    .upsert(contentRow, { onConflict: "date,username" });

  if (cbError) {
    return { username, ok: false, skipped: false, reason: `Content breakdown upsert failed: ${cbError.message}` };
  }

  return {
    username,
    ok: true,
    skipped: false,
    engagement: { action: "upsert" },
    contentBreakdown: { action: "upsert" },
  };
}

async function main() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  const { accounts } = loadConfig(repoRoot);
  const arg = process.argv[2];

  if (!arg) {
    console.error("Usage: node scripts/sync/update-supabase.js <username|--all>");
    process.exit(1);
  }

  if (arg === "--all") {
    const enabled = accounts.filter((a) => a.enabled).map((a) => a.username);
    const results = [];
    for (const username of enabled) {
      results.push(await processOne(repoRoot, username));
    }
    console.log(JSON.stringify(results, null, 2));
    const hasFailure = results.some((r) => !r.ok && !r.skipped);
    process.exit(hasFailure ? 2 : 0);
  }

  const result = await processOne(repoRoot, arg);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 2);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
