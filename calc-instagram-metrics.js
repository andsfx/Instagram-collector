const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Validation helpers ---

/**
 * Check if a value is a valid numeric entry (finite, non-negative number).
 */
function isValidNumeric(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

/**
 * Check if followers is a positive finite integer.
 */
function isValidFollowers(f) {
  return typeof f === 'number' && Number.isFinite(f) && f > 0 && Number.isInteger(f);
}

/**
 * Round a number to 2 decimals using half-up rounding.
 * Uses exponential notation to avoid JavaScript's floating point issues.
 */
function roundHalfUp(num) {
  return Number(Math.round(num + 'e2') + 'e-2');
}

// --- Core computation helpers ---

/**
 * Compute mean of valid numeric values from an array of posts for a given field.
 * Returns null if no valid entries exist.
 */
function safeMean(posts, field) {
  const vals = posts
    .map((p) => p[field])
    .filter(isValidNumeric);
  if (vals.length === 0) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return roundHalfUp(sum / vals.length);
}

/**
 * Compute total sum of valid numeric values from an array of posts for a given field.
 * Returns 0 if no valid entries (sum of nothing is 0).
 */
function safeTotal(posts, field) {
  const vals = posts
    .map((p) => p[field])
    .filter(isValidNumeric);
  return vals.reduce((a, b) => a + b, 0);
}

/**
 * Compute engagement rate: ((avgLikes + avgComments) / followers) * 100
 * Returns null if followers invalid or avgLikes/avgComments are null.
 */
function computeEngagementRate(avgLikes, avgComments, followers) {
  if (!isValidFollowers(followers)) return null;
  if (avgLikes == null || avgComments == null) return null;
  const rate = ((avgLikes + avgComments) / followers) * 100;
  return roundHalfUp(rate);
}

// --- Known post types ---
const KNOWN_TYPES = new Set(['reels', 'carousel', 'image', 'video']);

/**
 * Classify a post type into normalized category name.
 * Known types: reels → reels, carousel → carousels, image → images, video → videos
 * Unknown types log a warning and classify as 'unknown'.
 */
function classifyPostType(post) {
  const type = post.type;
  if (type === 'reels') return 'reels';
  if (type === 'carousel') return 'carousels';
  if (type === 'image') return 'images';
  if (type === 'video') return 'videos';
  // Unknown type
  process.stderr.write(`Warning: unknown post type "${type}" for post ${post.url || '(no url)'}\n`);
  return 'unknown';
}

/**
 * Use a stable key sort replacer for deterministic JSON output.
 * Sorts object keys alphabetically at every nesting level.
 */
function stableStringify(obj, indent) {
  return JSON.stringify(obj, function (key, value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const sorted = {};
      Object.keys(value).sort().forEach((k) => {
        sorted[k] = value[k];
      });
      return sorted;
    }
    return value;
  }, indent);
}

// --- File system helpers ---

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveInputPath(repoRoot, account) {
  const candidates = [
    path.join(repoRoot, 'data', 'raw', 'posts', `${account}-latest12-full.json`),
    path.join(repoRoot, `${account}-latest12-full.json`),
    path.join(repoRoot, 'artifacts', 'instagram', `${account}-latest12-full.json`),
    path.join(os.homedir(), 'instagram-collector', `${account}-latest12-full.json`)
  ];

  return candidates.find((p) => fs.existsSync(p));
}

/**
 * Compute metrics from posts array and followers count.
 * This is the core computation function, separated from CLI for testability.
 */
function computeMetrics(posts, followers, account) {
  // Guard empty posts
  let avgLikes = null;
  let avgComments = null;
  let engagementRate = null;
  let totalLikes = 0;
  let totalComments = 0;

  if (posts.length > 0) {
    // Compute totals from valid entries only
    totalLikes = safeTotal(posts, 'likes');
    totalComments = safeTotal(posts, 'comments');

    // Compute averages from valid entries only
    avgLikes = safeMean(posts, 'likes');
    avgComments = safeMean(posts, 'comments');

    // Compute engagement rate (guarded against invalid followers)
    engagementRate = computeEngagementRate(avgLikes, avgComments, followers);
  }

  // --- Content breakdown with normalized keys ---
  const breakdown = { reels: 0, carousels: 0, images: 0, videos: 0, unknown: 0 };
  const byCategory = { reels: [], carousels: [], images: [], videos: [], unknown: [] };

  for (const post of posts) {
    const category = classifyPostType(post);
    breakdown[category]++;
    byCategory[category].push(post);
  }

  const postsAnalyzed = posts.length;

  // --- Best post (from valid likes entries) ---
  const bestPost = [...posts]
    .filter((p) => isValidNumeric(p.likes))
    .sort((a, b) => (b.likes - a.likes) || ((b.comments || 0) - (a.comments || 0)))[0] || null;

  // --- Build deterministic output with stable key ordering ---
  const result = {
    account: account,
    avg_comments: avgComments,
    avg_likes: avgLikes,
    content_breakdown: {
      best_post_comments: bestPost ? bestPost.comments : null,
      best_post_likes: bestPost ? bestPost.likes : null,
      best_post_type: bestPost ? bestPost.type : null,
      best_post_url: bestPost ? bestPost.url : null,
      carousels: breakdown.carousels,
      carousels_avg_comments: safeMean(byCategory.carousels, 'comments'),
      carousels_avg_likes: safeMean(byCategory.carousels, 'likes'),
      carousels_er: computeEngagementRate(safeMean(byCategory.carousels, 'likes'), safeMean(byCategory.carousels, 'comments'), followers),
      images: breakdown.images,
      images_avg_comments: safeMean(byCategory.images, 'comments'),
      images_avg_likes: safeMean(byCategory.images, 'likes'),
      images_er: computeEngagementRate(safeMean(byCategory.images, 'likes'), safeMean(byCategory.images, 'comments'), followers),
      reels: breakdown.reels,
      reels_avg_comments: safeMean(byCategory.reels, 'comments'),
      reels_avg_likes: safeMean(byCategory.reels, 'likes'),
      reels_er: computeEngagementRate(safeMean(byCategory.reels, 'likes'), safeMean(byCategory.reels, 'comments'), followers),
      total_posts_analyzed: postsAnalyzed,
      unknown: breakdown.unknown,
      videos: breakdown.videos,
      videos_avg_comments: safeMean(byCategory.videos, 'comments'),
      videos_avg_likes: safeMean(byCategory.videos, 'likes'),
      videos_er: computeEngagementRate(safeMean(byCategory.videos, 'likes'), safeMean(byCategory.videos, 'comments'), followers)
    },
    engagement: {
      avg_comments: avgComments,
      avg_likes: avgLikes,
      engagement_rate: engagementRate,
      total_comments_last12: totalComments,
      total_likes_last12: totalLikes
    },
    engagement_rate: engagementRate,
    followers: followers,
    posts_analyzed: postsAnalyzed,
    total_comments: totalComments,
    total_likes: totalLikes
  };

  return result;
}

// --- CLI execution (only when run directly) ---

if (require.main === module) {
  const repoRoot = __dirname;
  const account = process.argv[2];
  const followersArg = process.argv[3];

  // Validate account: must be a non-empty string
  if (!account || typeof account !== 'string' || account.trim() === '') {
    process.stderr.write('Usage: node calc-instagram-metrics.js <account> <followers>\n');
    process.stderr.write('Error: <account> must be a non-empty string.\n');
    process.exit(1);
  }

  // Validate followers: must be a positive finite integer
  const followers = Number(followersArg);
  if (!isValidFollowers(followers)) {
    process.stderr.write('Usage: node calc-instagram-metrics.js <account> <followers>\n');
    process.stderr.write('Error: <followers> must be a positive finite integer.\n');
    process.exit(1);
  }

  // --- Input file resolution ---
  const input = resolveInputPath(repoRoot, account);
  if (!input) {
    process.stderr.write(`Input JSON not found for account: ${account}\n`);
    process.exit(1);
  }

  // --- Main computation ---
  const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
  const posts = (raw.posts || []).slice(0, 12);

  const result = computeMetrics(posts, followers, raw.account || account);

  // --- Write output ---
  const outputDir = path.join(repoRoot, 'data', 'processed', 'metrics');
  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `${account}-metrics.json`);

  const outputJson = stableStringify(result, 2);
  fs.writeFileSync(outputPath, outputJson);
  console.log(outputJson);
}

// Export functions for testing
module.exports = {
  isValidNumeric,
  isValidFollowers,
  roundHalfUp,
  safeMean,
  safeTotal,
  computeEngagementRate,
  classifyPostType,
  stableStringify,
  computeMetrics
};
