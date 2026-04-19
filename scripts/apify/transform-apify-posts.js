const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadSocialBladeStats(repoRoot, username) {
  const statsPath = path.join(repoRoot, 'data', 'raw', 'stats', `${username}-stats.json`);
  return safeReadJson(statsPath);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function avg(arr) {
  if (!arr.length) return null;
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
}

function er(avgLikes, avgComments, followers) {
  if (!followers || avgLikes == null || avgComments == null) return null;
  return Number((((avgLikes + avgComments) / followers) * 100).toFixed(2));
}

function normalizeType(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('sidecar') || t.includes('carousel')) return 'carousel';
  if (t.includes('reel')) return 'reels';
  if (t.includes('video')) return 'video';
  return 'image';
}

function safeMean(posts, field) {
  const vals = posts.map((p) => p[field]).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  return avg(vals);
}

function buildRawPosts(username, items) {
  return {
    account: username,
    collected_at: new Date().toISOString(),
    source: 'apify-instagram-scraper',
    posts: items.map((item) => ({
      shortcode: item.shortCode || null,
      url: item.url || null,
      type: normalizeType(item.type),
      caption: item.caption || null,
      likes: typeof item.likesCount === 'number' ? item.likesCount : null,
      comments: typeof item.commentsCount === 'number' ? item.commentsCount : null,
      published_at: item.timestamp || null,
      is_pinned: false,
      apify_type: item.type || null
    })),
    warnings: []
  };
}

function buildMetrics(username, followers, rawPosts) {
  const posts = (rawPosts.posts || []).slice(0, 12);
  const avgLikes = safeMean(posts, 'likes');
  const avgComments = safeMean(posts, 'comments');
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments || 0), 0);
  const engagementRate = er(avgLikes, avgComments, followers);
  const byType = {
    reels: posts.filter((p) => p.type === 'reels'),
    carousel: posts.filter((p) => p.type === 'carousel'),
    image: posts.filter((p) => p.type === 'image'),
    video: posts.filter((p) => p.type === 'video')
  };
  const bestPost = [...posts]
    .filter((p) => typeof p.likes === 'number')
    .sort((a, b) => ((b.likes || 0) - (a.likes || 0)) || ((b.comments || 0) - (a.comments || 0)))[0] || null;

  return {
    account: username,
    posts_analyzed: posts.length,
    followers,
    total_likes: totalLikes,
    total_comments: totalComments,
    avg_likes: avgLikes,
    avg_comments: avgComments,
    engagement_rate: engagementRate,
    engagement: {
      avg_likes: avgLikes,
      avg_comments: avgComments,
      engagement_rate: engagementRate,
      total_likes_last12: totalLikes,
      total_comments_last12: totalComments
    },
    content_breakdown: {
      reels: byType.reels.length,
      carousel: byType.carousel.length,
      image: byType.image.length,
      video: byType.video.length,
      total_posts_analyzed: posts.length,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      engagement_rate: engagementRate,
      reels_avg_likes: safeMean(byType.reels, 'likes'),
      reels_avg_comments: safeMean(byType.reels, 'comments'),
      reels_er: er(safeMean(byType.reels, 'likes'), safeMean(byType.reels, 'comments'), followers),
      carousel_avg_likes: safeMean(byType.carousel, 'likes'),
      carousel_avg_comments: safeMean(byType.carousel, 'comments'),
      carousel_er: er(safeMean(byType.carousel, 'likes'), safeMean(byType.carousel, 'comments'), followers),
      image_avg_likes: safeMean(byType.image, 'likes'),
      image_avg_comments: safeMean(byType.image, 'comments'),
      image_er: er(safeMean(byType.image, 'likes'), safeMean(byType.image, 'comments'), followers),
      video_avg_likes: safeMean(byType.video, 'likes'),
      video_avg_comments: safeMean(byType.video, 'comments'),
      video_er: er(safeMean(byType.video, 'likes'), safeMean(byType.video, 'comments'), followers),
      best_post_url: bestPost ? bestPost.url : null,
      best_post_type: bestPost ? bestPost.type : null,
      best_post_likes: bestPost ? bestPost.likes : null,
      best_post_comments: bestPost ? bestPost.comments : null
    }
  };
}

function buildMerged(username, socialBladeStats, metrics) {
  return {
    date: new Date().toISOString().slice(0, 10),
    username,
    profile: {
      followers: socialBladeStats?.followers ?? metrics.followers ?? null,
      following: socialBladeStats?.following ?? null,
      posts_count: socialBladeStats?.posts_count ?? null
    },
    metrics: {
      analyzed_posts: metrics.posts_analyzed,
      total_likes: metrics.total_likes,
      total_comments: metrics.total_comments,
      avg_likes: metrics.avg_likes,
      avg_comments: metrics.avg_comments,
      engagement_rate: metrics.engagement_rate
    },
    sources: {
      profile_stats: socialBladeStats ? 'socialblade-raw-stats' : 'missing-socialblade-stats',
      post_metrics: 'apify'
    }
  };
}

function main() {
  const username = process.argv[2];
  const inputPath = process.argv[3];
  const fallbackFollowers = Number(process.argv[4]);
  if (!username || !inputPath) {
    console.error('Usage: node scripts/apify/transform-apify-posts.js <username> <inputJsonPath> [fallbackFollowers]');
    process.exit(1);
  }

  const repoRoot = path.resolve(__dirname, '..', '..');
  const items = readJson(inputPath);
  const socialBladeStats = loadSocialBladeStats(repoRoot, username);
  const followers = Number(socialBladeStats?.followers ?? fallbackFollowers);

  if (!Number.isFinite(followers) || followers <= 0) {
    console.error(`Fresh follower count missing for ${username}. Expected SocialBlade raw stats or valid fallback.`);
    process.exit(2);
  }

  if (!socialBladeStats || socialBladeStats.ok === false) {
    console.error(`SocialBlade raw stats missing or invalid for ${username}. Refusing stale config fallback.`);
    process.exit(2);
  }

  if (!Array.isArray(items)) {
    console.error('Input JSON must be an array of Apify dataset items');
    process.exit(1);
  }

  const rawDir = path.join(repoRoot, 'data', 'raw', 'posts');
  const metricsDir = path.join(repoRoot, 'data', 'processed', 'metrics');
  const mergedDir = path.join(repoRoot, 'data', 'processed', 'merged');
  ensureDir(rawDir);
  ensureDir(metricsDir);
  ensureDir(mergedDir);

  const rawPosts = buildRawPosts(username, items);
  const metrics = buildMetrics(username, followers, rawPosts);
  const merged = buildMerged(username, socialBladeStats, metrics);

  fs.writeFileSync(path.join(rawDir, `${username}-latest12-full.json`), JSON.stringify(rawPosts, null, 2));
  fs.writeFileSync(path.join(metricsDir, `${username}-metrics.json`), JSON.stringify(metrics, null, 2));
  fs.writeFileSync(path.join(mergedDir, `${username}.json`), JSON.stringify(merged, null, 2));

  console.log(JSON.stringify({
    username,
    items: items.length,
    posts_analyzed: metrics.posts_analyzed,
    avg_likes: metrics.avg_likes,
    avg_comments: metrics.avg_comments,
    engagement_rate: metrics.engagement_rate,
    follower_source: merged.sources.profile_stats,
    followers
  }, null, 2));
}

main();
