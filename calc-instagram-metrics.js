const fs = require('fs');
const path = require('path');
const os = require('os');

function mean(arr) {
  if (!arr.length) return null;
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
}

function er(avgLikes, avgComments, followers) {
  if (!followers || avgLikes == null || avgComments == null) return null;
  return Number((((avgLikes + avgComments) / followers) * 100).toFixed(2));
}

function safeMean(posts, field) {
  const vals = posts.map((p) => p[field]).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  return mean(vals);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveInputPath(repoRoot, account) {
  const candidates = [
    path.join(repoRoot, 'data', 'raw', 'posts', `${account}-latest12-full.json`),
    path.join(repoRoot, `${account}-latest12-full.json`),
    path.join(os.homedir(), 'instagram-collector', `${account}-latest12-full.json`)
  ];

  return candidates.find((p) => fs.existsSync(p));
}

const repoRoot = __dirname;
const account = process.argv[2];
const followers = Number(process.argv[3]);
if (!account || !followers) {
  console.error('Usage: node calc-instagram-metrics.js <account> <followers>');
  process.exit(1);
}

const input = resolveInputPath(repoRoot, account);
if (!input) {
  console.error(`Input JSON not found for account: ${account}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
const posts = (raw.posts || []).slice(0, 12);
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

const result = {
  account: raw.account || account,
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

const outputDir = path.join(repoRoot, 'data', 'processed', 'metrics');
ensureDir(outputDir);
const outputPath = path.join(outputDir, `${account}-metrics.json`);
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
