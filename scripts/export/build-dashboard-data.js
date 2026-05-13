const fs = require('fs');
const path = require('path');
const { supabase } = require('../lib/supabase');
const { z } = require('zod');

// ---------------------------------------------------------------------------
// Schema Validation (mirrors dashboard-react/src/data/schema.ts)
// ---------------------------------------------------------------------------

const SUPPORTED_VERSIONS = [2];

const metricSchemaLocal = z.object({
  followers: z.number().nullable(),
  following: z.number().nullable(),
  posts: z.number().nullable(),
  avg_likes: z.number().nullable(),
  avg_comments: z.number().nullable(),
  engagement_rate: z.number().nullable(),
}).passthrough();

const strictContentBreakdownAccountSchemaLocal = z.object({
  reels: z.number().optional(),
  carousels: z.number().optional(),
  images: z.number().optional(),
  videos: z.number().optional(),
  unknown: z.number().optional(),
  total_posts_analyzed: z.number().optional(),
  posts: z.number().optional(),
  followers: z.number().optional(),
  bestPost: z.object({
    url: z.string().optional(),
    type: z.string().optional(),
    interactions: z.number().optional(),
    comments: z.number().optional(),
    timestamp: z.string().optional(),
    id: z.string().optional(),
    caption: z.string().optional(),
  }).optional(),
}).strict();

const dashboardSchemaLocal = z.object({
  generated_at: z.string(),
  generated_at_wib: z.string(),
  version: z.number().refine(
    (v) => SUPPORTED_VERSIONS.includes(v),
    { message: `Unsupported version. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}` },
  ),
  sources: z.object({
    stats: z.string(),
    engagement: z.string(),
  }),
  accounts: z.array(z.string()),
  latest: z.object({
    date: z.string(),
  }).catchall(metricSchemaLocal),
  growth: z.record(z.object({
    followers_change_1d: z.number(),
    followers_change_7d: z.number(),
    pct_change_7d: z.number(),
  })),
  rankings: z.object({
    by_followers: z.array(z.object({ rank: z.number(), account: z.string(), followers: z.number() })),
    by_engagement_rate: z.array(z.object({ rank: z.number(), account: z.string(), engagement_rate: z.number() })),
  }),
  history: z.array(z.object({ date: z.string() }).passthrough()),
  content_breakdown: z.record(strictContentBreakdownAccountSchemaLocal).optional(),
  post_insights: z.record(z.object({
    followers: z.number().optional(),
    posts: z.array(z.object({}).passthrough()).optional(),
    top_interactions: z.array(z.object({}).passthrough()).optional(),
    average_likes: z.number().optional(),
    average_comments: z.number().optional(),
    average_post_er: z.number().optional(),
    dominant_type: z.string().optional(),
    top_hashtags: z.array(z.string()).optional(),
    campaign_terms: z.array(z.string()).optional(),
    viral_posts: z.number().optional(),
    underperform_posts: z.number().optional(),
  }).passthrough()).optional(),
  presentation_report: z.object({
    executiveSummary: z.object({
      kpis: z.array(z.object({ key: z.string(), label: z.string(), account: z.string().nullable(), value: z.string() })),
      bullets: z.array(z.string()),
    }),
  }),
  meta: z.object({
    brand_account: z.string().nullable().optional(),
    history_days: z.number().optional(),
  }).optional(),
});

/**
 * Validate payload against schema kanonik.
 * Returns { success: true, data } or { success: false, errors: [...] }
 */
function validatePayload(payload) {
  const result = dashboardSchemaLocal.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join('.') : '(root)',
    message: issue.message,
    code: issue.code,
  }));
  return { success: false, errors };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toAssetVersion(isoUtc) {
  const d = new Date(isoUtc);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
}

function updateHtmlAssetVersion(repoRoot, assetVersion) {
  const htmlPath = path.join(repoRoot, 'dashboard', 'index.html');
  if (!fs.existsSync(htmlPath)) return { updated: false, assetVersion, htmlPath };
  const original = fs.readFileSync(htmlPath, 'utf8');
  const updated = original.replace(
    /(<script src="\.\/js\/[^"]+\.js)(\?v=[^"]+)?("?><\/script>)/g,
    `$1?v=${assetVersion}$3`
  );
  if (updated === original) return { updated: false, assetVersion, htmlPath };
  fs.writeFileSync(htmlPath, updated);
  return { updated: true, assetVersion, htmlPath };
}



function formatWib(isoUtc) {
  const d = new Date(isoUtc);
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = wib.getUTCFullYear();
  const mm = String(wib.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(wib.getUTCDate()).padStart(2, '0');
  const hh = String(wib.getUTCHours()).padStart(2, '0');
  const mi = String(wib.getUTCMinutes()).padStart(2, '0');
  const ss = String(wib.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+07:00`;
}

function ratio(followers, following) {
  if (!followers || !following) return null;
  return Number((followers / following).toFixed(2));
}

function parseHistoryDays(value, fallback = 90) {
  const days = Number.parseInt(value, 10);
  return Number.isFinite(days) && days > 0 ? days : fallback;
}

function toDateOnlyUtc(date) {
  return date.toISOString().slice(0, 10);
}

function getWindowStartDate(anchorDate, historyDays) {
  const d = new Date(`${anchorDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - Math.max(historyDays - 1, 0));
  return toDateOnlyUtc(d);
}

function buildFollowerHistoryFromSupabase(rows, accounts) {
  if (!rows || !rows.length) return [];
  const dateMap = new Map();
  for (const row of rows) {
    if (!row.date) continue;
    if (!dateMap.has(row.date)) {
      const item = { date: row.date };
      for (const username of accounts) {
        item[username] = { followers: null, following: null, posts: null };
      }
      dateMap.set(row.date, item);
    }
    const item = dateMap.get(row.date);
    if (accounts.includes(row.username)) {
      item[row.username] = {
        followers: row.followers ?? null,
        following: row.following ?? null,
        posts: row.posts ?? null,
      };
    }
  }
  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function buildEngagementFromSupabase(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!row.date || !row.username) continue;
    if (!map.has(row.date)) map.set(row.date, {});
    map.get(row.date)[row.username] = {
      avg_likes: Number(row.avg_likes || 0) || 0,
      avg_comments: Number(row.avg_comments || 0) || 0,
      engagement_rate: Number(row.engagement_rate || 0) || 0,
      posts_analyzed: Number(row.posts_analyzed || 0) || 0,
      total_likes: Number(row.total_likes_last12 || 0) || 0,
      total_comments: Number(row.total_comments_last12 || 0) || 0,
    };
  }
  return map;
}

function buildContentBreakdownFromSupabase(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!row.username) continue;
    if (map.has(row.username)) continue;
    map.set(row.username, {
      date: row.date,
      reels: Number(row.reels || 0) || 0,
      carousel: Number(row.carousel || 0) || 0,
      image: Number(row.image || 0) || 0,
      video: Number(row.video || 0) || 0,
      total_posts_analyzed: Number(row.total_posts_analyzed || 0) || 0,
      avg_likes: Number(row.avg_likes || 0) || 0,
      avg_comments: Number(row.avg_comments || 0) || 0,
      engagement_rate: Number(row.engagement_rate || 0) || 0,
      reels_avg_likes: row.reels_avg_likes != null ? Number(row.reels_avg_likes) : null,
      reels_avg_comments: row.reels_avg_comments != null ? Number(row.reels_avg_comments) : null,
      reels_er: row.reels_er != null ? Number(row.reels_er) : null,
      carousel_avg_likes: row.carousel_avg_likes != null ? Number(row.carousel_avg_likes) : null,
      carousel_avg_comments: row.carousel_avg_comments != null ? Number(row.carousel_avg_comments) : null,
      carousel_er: row.carousel_er != null ? Number(row.carousel_er) : null,
      image_avg_likes: row.image_avg_likes != null ? Number(row.image_avg_likes) : null,
      image_avg_comments: row.image_avg_comments != null ? Number(row.image_avg_comments) : null,
      image_er: row.image_er != null ? Number(row.image_er) : null,
      best_post_url: row.best_post_url || null,
      best_post_type: row.best_post_type || null,
      best_post_likes: row.best_post_likes != null ? Number(row.best_post_likes) : null,
      best_post_comments: row.best_post_comments != null ? Number(row.best_post_comments) : null,
    });
  }
  return map;
}

const HASHTAG_REGEX = /#[\p{L}0-9_]+/gu;
const POST_CAMPAIGN_TERMS = [
  // Promo & diskon
  'promo', 'diskon', 'sale', 'cashback', 'buy 1 get 1', 'buy 1 free', 'buy more', 'flash sale',
  'late night sale', 'weekend deals', 'shopping guide', 'free',
  // Event & aktivitas
  'event', 'giveaway', 'contest', 'workshop', 'festival', 'bazaar', 'exhibition',
  'urban fest', 'crave market', 'got talent', 'trial class',
  // Tenant & opening
  'grand opening', 'new tenant', 'now open', 'coming soon', 'launch', 'opening',
  'officially open', 'is here', 'is back',
  // Seasonal & thematic
  'ramadan', 'lebaran', 'idul fitri', 'natal', 'tahun baru', 'imlek',
  'hari buruh', 'hari ibu', 'valentine', 'anniversary',
  // Mall-specific
  'shop till you win', 'belanja', 'reward', 'voucher', 'grand prize',
  'special offer', 'limited', 'promo menarik', 'hemat',
];

function loadLatestPostData(repoRoot, username) {
  const candidates = [
    path.join(repoRoot, 'data', 'raw', 'posts', `${username}-latest12-full.json`),
    path.join(repoRoot, `${username}-latest12-full.json`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        return readJson(candidate);
      } catch (err) {
        console.warn(`failed to read ${candidate}: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}

function extractHashtags(text) {
  if (!text) return [];
  const matches = [...(text.matchAll(HASHTAG_REGEX))].map((m) => m[0].toLowerCase());
  return matches;
}

function formatCaptionSnippet(text) {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 90) return normalized;
  return `${normalized.slice(0, 90).trim()}...`;
}

function buildPostInsight(raw, followers) {
  if (!raw || !Array.isArray(raw.posts) || !raw.posts.length) return null;
  const rawPosts = raw.posts.slice(0, 12);

  const hashtagCounts = {};
  const campaignTermHits = new Set();
  rawPosts.forEach((post) => {
    const caption = String(post.caption || '');
    extractHashtags(caption).forEach((tag) => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
    const lcCaption = caption.toLowerCase();
    POST_CAMPAIGN_TERMS.forEach((term) => {
      if (lcCaption.includes(term)) campaignTermHits.add(term);
    });
  });

  const posts = rawPosts.map((post) => {
    const caption = post.caption || '';
    return {
      shortcode: post.shortcode || null,
      url: post.url || null,
      type: post.type || post.apify_type || 'unknown',
      likes: Number(post.likes || 0),
      comments: Number(post.comments || 0),
      published_at: post.published_at || null,
      caption_snippet: formatCaptionSnippet(caption),
    };
  }).map((post) => {
    const interactions = Number(post.likes || 0) + Number(post.comments || 0);
    const post_er = followers && followers > 0 ? Number(((interactions / followers) * 100).toFixed(4)) : null;
    return { ...post, interactions, post_er, performance_label: 'normal' };
  });
  if (!posts.length) return null;
  const average_likes = Number((posts.reduce((sum, item) => sum + item.likes, 0) / posts.length).toFixed(2));
  const average_comments = Number((posts.reduce((sum, item) => sum + item.comments, 0) / posts.length).toFixed(2));
  const typeCounts = posts.reduce((acc, item) => {
    const key = item.type || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const dominant_type = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
  const top_hashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
  const campaign_terms = Array.from(campaignTermHits);

  const erValues = posts.map((post) => post.post_er).filter((value) => Number.isFinite(value));
  let q1 = null;
  let q3 = null;
  if (erValues.length >= 4) {
    const sorted = [...erValues].sort((a, b) => a - b);
    q1 = sorted[Math.floor((sorted.length - 1) * 0.25)];
    q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
  }

  const labeledPosts = posts.map((post) => {
    if (!Number.isFinite(post.post_er) || q1 == null || q3 == null || q1 === q3) {
      return { ...post, performance_label: 'normal' };
    }
    if (post.post_er >= q3) return { ...post, performance_label: 'viral' };
    if (post.post_er <= q1) return { ...post, performance_label: 'underperform' };
    return { ...post, performance_label: 'normal' };
  });

  const avg_post_er = erValues.length ? Number((erValues.reduce((sum, item) => sum + item, 0) / erValues.length).toFixed(4)) : null;
  const viral_posts = labeledPosts.filter((post) => post.performance_label === 'viral').length;
  const underperform_posts = labeledPosts.filter((post) => post.performance_label === 'underperform').length;

  return {
    posts: labeledPosts,
    average_likes,
    average_comments,
    average_post_er: avg_post_er,
    dominant_type,
    top_hashtags,
    campaign_terms: [...new Set(campaign_terms)],
    viral_posts,
    underperform_posts,
  };
}


function computeGrowth(history, username) {
  if (history.length < 2) {
    return { followers_change_1d: 0, followers_change_7d: 0, pct_change_7d: 0, anomaly_detected: false, notes: [] };
  }
  const latest = history[history.length - 1]?.[username]?.followers || 0;
  const prev = history[history.length - 2]?.[username]?.followers || 0;
  const idx7 = Math.max(0, history.length - 7);
  const weekBase = history[idx7]?.[username]?.followers || prev || 0;
  const change1d = latest - prev;
  const change7d = latest - weekBase;
  const pct7d = weekBase > 0 ? Number(((change7d / weekBase) * 100).toFixed(2)) : 0;
  return {
    followers_change_1d: change1d,
    followers_change_7d: change7d,
    pct_change_7d: pct7d,
    anomaly_detected: false,
    notes: [],
  };
}

function formatCompactNumber(value) {
  if (value == null || !Number.isFinite(value)) return '-';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(value * 100) / 100);
}

function formatSignedPercent(value) {
  if (value == null || !Number.isFinite(value)) return '-';
  return `${value > 0 ? '+' : ''}${Number(value).toFixed(2).replace(/\.00$/, '')}%`;
}

function formatPercent(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return '-';
  return `${Number(value).toFixed(digits).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')}%`;
}

function formatDateLabel(isoOrDate) {
  if (!isoOrDate) return '-';
  const d = new Date(isoOrDate);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function titleCase(value) {
  if (!value) return '-';
  return String(value).split(/[_\s-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function countTerms(postInsights, selector) {
  const counts = {};
  Object.values(postInsights || {}).forEach((insight) => {
    if (!insight) return;
    (selector(insight) || []).forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
  });
  return counts;
}

function pickTopEntry(counts) {
  const entries = Object.entries(counts || {}).sort((a, b) => b[1] - a[1]);
  return entries.length ? { key: entries[0][0], count: entries[0][1] } : null;
}

function deriveMetrics(data) {
  const accounts = data.accounts || [];
  const latest = data.latest || {};
  const growth = data.growth || {};
  const postInsights = data.post_insights || {};

  const accountRows = accounts.map((username) => {
    const latestRow = latest[username] || {};
    const post = postInsights[username] || {};
    return {
      account: username,
      followers: Number(latestRow.followers || 0),
      growthPct: Number(growth[username]?.pct_change_7d || 0),
      engagementRate: Number(latestRow.engagement_rate || 0),
      avgLikes: Number(latestRow.avg_likes || 0),
      avgComments: Number(latestRow.avg_comments || 0),
      avgPostEr: Number(post.average_post_er || 0),
      viralPosts: Number(post.viral_posts || 0),
      underperformPosts: Number(post.underperform_posts || 0),
      dominantType: post.dominant_type || 'unknown',
      campaignTerms: post.campaign_terms || [],
      topHashtags: post.top_hashtags || [],
      posts: post.posts || []
    };
  });

  const rankings = {
    followers: [...accountRows].sort((a, b) => b.followers - a.followers),
    growth: [...accountRows].sort((a, b) => b.growthPct - a.growthPct),
    engagement: [...accountRows].sort((a, b) => b.engagementRate - a.engagementRate),
    avgPostEr: [...accountRows].sort((a, b) => b.avgPostEr - a.avgPostEr),
    viralPosts: [...accountRows].sort((a, b) => b.viralPosts - a.viralPosts),
    underperformPosts: [...accountRows].sort((a, b) => b.underperformPosts - a.underperformPosts),
  };

  const formatCounts = accountRows.reduce((acc, row) => {
    const key = row.dominantType || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const campaignCounts = countTerms(postInsights, (insight) => insight.campaign_terms);
  const hashtagCounts = countTerms(postInsights, (insight) => insight.top_hashtags);

  const winners = {
    topFollowers: rankings.followers[0] || null,
    topEngagement: rankings.engagement[0] || null,
    fastestGrowth: rankings.growth[0] || null,
    bestAvgPostEr: rankings.avgPostEr[0] || null,
    mostViralAccount: rankings.viralPosts[0] || null,
    topFormat: pickTopEntry(formatCounts),
    topCampaign: pickTopEntry(campaignCounts),
    topHashtag: pickTopEntry(hashtagCounts),
  };

  const allPosts = accountRows.flatMap((row) => (row.posts || []).map((post) => ({ ...post, account: row.account, campaignTerms: row.campaignTerms || [] })));
  const viralPosts = allPosts.filter((post) => post.performance_label === 'viral').sort((a, b) => (b.post_er || 0) - (a.post_er || 0) || (b.likes || 0) - (a.likes || 0));

  return {
    generatedAt: data.generated_at,
    generatedAtWib: data.generated_at_wib,
    accountRows,
    rankings,
    winners,
    globalCounts: {
      totalPosts: allPosts.length,
      totalViral: viralPosts.length,
      totalUnderperform: accountRows.reduce((sum, row) => sum + row.underperformPosts, 0),
      topCampaignTerm: winners.topCampaign?.key || null,
      topHashtag: winners.topHashtag?.key || null,
      topFormat: winners.topFormat?.key || null,
    },
    viralHighlights: viralPosts.slice(0, 5),
    formatCounts,
    campaignCounts,
    hashtagCounts,
  };
}

function buildExecutiveSummary(metrics) {
  const kpis = [
    metrics.winners.topFollowers && { key: 'top_followers', label: 'Top Followers', account: metrics.winners.topFollowers.account, value: formatCompactNumber(metrics.winners.topFollowers.followers) },
    metrics.winners.topEngagement && { key: 'top_engagement', label: 'Top Engagement', account: metrics.winners.topEngagement.account, value: formatPercent(metrics.winners.topEngagement.engagementRate) },
    metrics.winners.fastestGrowth && { key: 'fastest_growth', label: 'Fastest Growth', account: metrics.winners.fastestGrowth.account, value: formatSignedPercent(metrics.winners.fastestGrowth.growthPct) },
    metrics.winners.topFormat && { key: 'top_content_format', label: 'Top Content Format', account: null, value: titleCase(metrics.winners.topFormat.key) },
    { key: 'top_campaign', label: 'Tema Campaign Teratas', account: null, value: metrics.globalCounts.topCampaignTerm || 'Belum dominan' },
    metrics.winners.mostViralAccount && { key: 'most_viral_account', label: 'Akun Paling Viral', account: metrics.winners.mostViralAccount.account, value: `${metrics.winners.mostViralAccount.viralPosts} post viral` },
    metrics.winners.bestAvgPostEr && { key: 'best_avg_post_er', label: 'Avg Post ER Tertinggi', account: metrics.winners.bestAvgPostEr.account, value: formatPercent(metrics.winners.bestAvgPostEr.avgPostEr) },
  ].filter(Boolean);

  const bullets = [];
  if (metrics.winners.topFollowers) bullets.push(`@${metrics.winners.topFollowers.account} masih memimpin dari sisi ukuran audiens dan menjadi patokan awareness di periode ini.`);
  if (metrics.winners.bestAvgPostEr) {
    const account = metrics.winners.bestAvgPostEr.account;
    if (metrics.winners.topFollowers && account !== metrics.winners.topFollowers.account) bullets.push(`Meski skalanya tidak terbesar, @${account} mencatat kualitas interaksi terbaik di periode ini.`);
    else bullets.push(`@${account} unggul dari sisi kualitas interaksi dan efisiensi konten.`);
  }
  if (metrics.globalCounts.topCampaignTerm || metrics.globalCounts.topFormat) bullets.push(`Tema ${metrics.globalCounts.topCampaignTerm || 'campaign'} paling sering muncul, dengan format ${titleCase(metrics.globalCounts.topFormat || 'konten')} terlihat paling konsisten dipakai.`);

  return { kpis, bullets: bullets.slice(0, 3) };
}

function buildCompetitiveOverview(metrics) {
  return metrics.accountRows.map((row) => ({
    account: row.account,
    followers: row.followers,
    followersLabel: formatCompactNumber(row.followers),
    growth: row.growthPct,
    growthLabel: formatSignedPercent(row.growthPct),
    engagementRate: row.engagementRate,
    engagementRateLabel: formatPercent(row.engagementRate),
    avgPostEr: row.avgPostEr,
    avgPostErLabel: formatPercent(row.avgPostEr),
    dominantType: row.dominantType,
    viralPosts: row.viralPosts,
    positioningTag: 'Stable Player'
  }));
}

function buildGrowthPositioning(metrics, overviewRows) {
  const topFollowersAccount = metrics.winners.topFollowers?.account;
  const topGrowthAccount = metrics.winners.fastestGrowth?.account;
  const topEngagementAccount = metrics.winners.topEngagement?.account;
  const watchlistAccount = metrics.rankings.underperformPosts.find((row) => row.underperformPosts >= 3 && row.account !== topFollowersAccount && row.account !== topGrowthAccount && row.account !== topEngagementAccount)?.account
    || metrics.rankings.viralPosts.find((row) => row.viralPosts >= 3 && row.account !== topFollowersAccount && row.account !== topGrowthAccount && row.account !== topEngagementAccount)?.account;

  const roles = overviewRows.map((row) => {
    let role = 'Stable Player';
    let reason = 'Performa relatif stabil dan konsisten di periode ini.';
    if (topFollowersAccount && row.account === topFollowersAccount) {
      role = 'Leader';
      reason = 'Memimpin dari sisi ukuran audiens dan tetap menjadi acuan awareness.';
    } else if (topGrowthAccount && row.account === topGrowthAccount) {
      role = 'Challenger';
      reason = 'Mencatat pertumbuhan paling cepat dan berpotensi meningkatkan tekanan kompetitif.';
    } else if (topEngagementAccount && row.account === topEngagementAccount) {
      role = 'High Engagement';
      reason = 'Memiliki kualitas interaksi paling kuat dibanding akun lain.';
    } else if (watchlistAccount && row.account === watchlistAccount) {
      role = 'Watchlist';
      reason = 'Layak dipantau lebih dekat karena menunjukkan sinyal performa yang menonjol atau belum stabil.';
    }
    return { account: row.account, role, reason };
  });

  const updatedRows = overviewRows.map((row) => ({ ...row, positioningTag: roles.find((item) => item.account === row.account)?.role || row.positioningTag }));

  return {
    followersRanking: metrics.rankings.followers.slice(0, 5).map((row) => ({ account: row.account, value: row.followers, label: formatCompactNumber(row.followers) })),
    growthRanking: metrics.rankings.growth.slice(0, 5).map((row) => ({ account: row.account, value: row.growthPct, label: formatSignedPercent(row.growthPct) })),
    roles,
    overviewRows: updatedRows,
  };
}

function buildPresentationReport(data) {
  const metrics = deriveMetrics(data);
  const executiveSummary = buildExecutiveSummary(metrics);
  const competitiveOverview = buildCompetitiveOverview(metrics);
  const growthPositioning = buildGrowthPositioning(metrics, competitiveOverview);

  return {
    meta: {
      generatedAt: metrics.generatedAt,
      generatedAtWib: metrics.generatedAtWib,
      accountCount: data.accounts.length,
      historyDays: data.meta?.history_days || 0,
      source: ['SocialBlade', 'Apify', 'Supabase'],
      version: 'presentation-v1'
    },
    cover: {
      title: 'Instagram Competitor Performance Report',
      subtitle: 'Laporan ringkas performa kompetitor Instagram',
      periodLabel: `Update: ${formatDateLabel(metrics.generatedAtWib || metrics.generatedAt)}`,
      scopeLabel: `${data.accounts.length} akun dipantau · ${data.meta?.history_days || 0} hari histori`,
      brand: {
        name: 'Metropolitan Mall Bekasi',
        theme: { primary: '#21beb0', accent: '#e1306c' },
        logoPath: 'dashboard/assets/metropolitan-mall-logo.png'
      }
    },
    executiveSummary,
    competitiveOverview: growthPositioning.overviewRows,
    growthPositioning,
    campaignAnalysis: {
      topCampaignTerm: metrics.globalCounts.topCampaignTerm,
      topHashtag: metrics.globalCounts.topHashtag,
      topContentFormat: metrics.globalCounts.topFormat,
      accounts: metrics.accountRows.map((row) => ({ account: row.account, campaignTerms: row.campaignTerms.slice(0, 3), topHashtags: row.topHashtags.slice(0, 3), dominantType: row.dominantType, campaignIntensity: row.campaignTerms.length })),
      summary: [
        metrics.globalCounts.topCampaignTerm ? `Tema ${metrics.globalCounts.topCampaignTerm} muncul paling sering lintas akun.` : 'Belum ada satu tema campaign yang sangat dominan lintas akun.',
        metrics.globalCounts.topFormat ? `Format ${titleCase(metrics.globalCounts.topFormat)} menjadi format paling konsisten dipakai.` : 'Belum ada satu format yang benar-benar dominan lintas akun.'
      ]
    },
    contentSnapshot: metrics.accountRows.map((row) => ({ account: row.account, averageLikes: row.avgLikes, averageLikesLabel: formatCompactNumber(row.avgLikes), averageComments: row.avgComments, averageCommentsLabel: formatCompactNumber(row.avgComments), averagePostEr: row.avgPostEr, averagePostErLabel: formatPercent(row.avgPostEr), viralPosts: row.viralPosts, underperformPosts: row.underperformPosts, dominantType: row.dominantType, qualityTag: row.viralPosts > row.underperformPosts ? 'Strong' : row.underperformPosts >= 3 ? 'Needs Attention' : 'Mixed' })),
    viralHighlights: metrics.viralHighlights.map((post, index) => ({ rank: index + 1, account: post.account, captionSnippet: post.caption_snippet, type: post.type, likes: post.likes, comments: post.comments, postEr: post.post_er, postErLabel: formatPercent(post.post_er), publishedAt: post.published_at, publishedAtLabel: formatDateLabel(post.published_at), performanceLabel: post.performance_label, campaignTerms: post.campaignTerms || [], url: post.url })),
    opportunities: {
      accountsNeedingAttention: metrics.rankings.underperformPosts.slice(0, 2).filter((row) => row.underperformPosts > 0).map((row) => ({ account: row.account, reason: `Jumlah post perlu optimasi termasuk tinggi (${row.underperformPosts} post).` })),
      weakPatterns: [
        metrics.rankings.underperformPosts[0]?.underperformPosts >= 3 ? `@${metrics.rankings.underperformPosts[0].account} memiliki post perlu optimasi paling banyak di periode ini.` : null,
        metrics.globalCounts.topCampaignTerm && metrics.globalCounts.totalViral < metrics.globalCounts.totalPosts / 2 ? 'Intensitas campaign belum selalu diikuti performa interaksi yang kuat.' : null
      ].filter(Boolean),
      opportunityAreas: [
        metrics.globalCounts.topFormat ? `Perbanyak format ${titleCase(metrics.globalCounts.topFormat)} karena paling sering muncul pada konten dengan performa tinggi.` : null,
        metrics.winners.bestAvgPostEr ? `Gunakan @${metrics.winners.bestAvgPostEr.account} sebagai benchmark kualitas konten.` : null
      ].filter(Boolean)
    },
    strategicTakeaways: [
      metrics.winners.topFollowers && metrics.winners.topEngagement && metrics.winners.topFollowers.account !== metrics.winners.topEngagement.account ? { title: 'Awareness leader tidak otomatis jadi engagement leader', detail: 'Ukuran audiens besar belum tentu menghasilkan kualitas interaksi terbaik.' } : null,
      metrics.winners.fastestGrowth ? { title: 'Ada akun yang perlu dipantau dari sisi pertumbuhan', detail: `@${metrics.winners.fastestGrowth.account} mencatat pertumbuhan tercepat di periode ini.` } : null,
      metrics.globalCounts.topFormat ? { title: 'Ada format konten yang terlihat paling efektif', detail: `Format ${titleCase(metrics.globalCounts.topFormat)} paling konsisten muncul di performa konten saat ini.` } : null,
      metrics.globalCounts.topCampaignTerm ? { title: 'Tema campaign mulai terkonsentrasi', detail: `Tema ${metrics.globalCounts.topCampaignTerm} paling sering muncul lintas akun.` } : null,
    ].filter(Boolean),
    recommendations: {
      scale: [
        metrics.globalCounts.topFormat ? `Perbanyak format ${titleCase(metrics.globalCounts.topFormat)} karena paling sering muncul pada konten yang kuat.` : null,
        metrics.winners.bestAvgPostEr ? `Jadikan @${metrics.winners.bestAvgPostEr.account} sebagai benchmark kualitas engagement.` : null
      ].filter(Boolean),
      improve: [
        metrics.rankings.underperformPosts[0]?.underperformPosts > 0 ? `Prioritaskan evaluasi konten @${metrics.rankings.underperformPosts[0].account}.` : null,
        metrics.globalCounts.topCampaignTerm ? 'Pastikan campaign yang sering diulang juga punya hook interaksi yang kuat.' : null
      ].filter(Boolean),
      watchlist: [
        metrics.winners.fastestGrowth ? `Pantau @${metrics.winners.fastestGrowth.account} karena pertumbuhannya paling cepat.` : null,
        metrics.winners.mostViralAccount ? `Pantau pola konten @${metrics.winners.mostViralAccount.account} karena punya post viral terbanyak.` : null
      ].filter(Boolean)
    }
  };
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const accountsCfg = readJson(path.join(repoRoot, 'config', 'accounts.json')).filter((a) => a.enabled);
  const accounts = accountsCfg.map((a) => a.username);

  // Bounded date window: DASHBOARD_HISTORY_DAYS env var or default 90 days
  const historyDays = parseHistoryDays(process.env.DASHBOARD_HISTORY_DAYS, 90);

  const { data: latestDateRows, error: latestDateError } = await supabase
    .from('follower_history')
    .select('date')
    .in('username', accounts)
    .order('date', { ascending: false })
    .limit(1);
  if (latestDateError) throw new Error('Failed to fetch latest follower_history date: ' + latestDateError.message);

  const windowEnd = latestDateRows?.[0]?.date || toDateOnlyUtc(new Date());
  const windowStart = getWindowStartDate(windowEnd, historyDays);
  console.log(`Fetching Supabase data: window ${windowStart} → ${windowEnd} (${historyDays} days), accounts: ${accounts.join(', ')}`);

  // Fetch from Supabase — bounded by date window and account list
  const { data: followerData, error: fhError } = await supabase
    .from('follower_history')
    .select('date, username, followers, following, posts')
    .gte('date', windowStart)
    .lte('date', windowEnd)
    .in('username', accounts)
    .order('date', { ascending: true });
  if (fhError) throw new Error('Failed to fetch follower_history: ' + fhError.message);

  const { data: engagementData, error: engError } = await supabase
    .from('engagement')
    .select('*')
    .gte('date', windowStart)
    .lte('date', windowEnd)
    .in('username', accounts)
    .order('date', { ascending: true });
  if (engError) throw new Error('Failed to fetch engagement: ' + engError.message);

  // content_breakdown: latest row per account — fetch recent window, builder keeps first-seen per username
  const { data: contentData, error: cbError } = await supabase
    .from('content_breakdown')
    .select('*')
    .gte('date', windowStart)
    .lte('date', windowEnd)
    .in('username', accounts)
    .order('date', { ascending: false });
  if (cbError) throw new Error('Failed to fetch content_breakdown: ' + cbError.message);

  const historyBase = buildFollowerHistoryFromSupabase(followerData || [], accounts);
  const engagementByDate = buildEngagementFromSupabase(engagementData || []);
  const contentByUser = buildContentBreakdownFromSupabase(contentData || []);

  const history = historyBase.map((row) => {
    const date = row.date;
    const out = { date };
    for (const username of accounts) {
      const base = row[username] || {};
      const e = (engagementByDate.get(date) || {})[username] || {};
      out[username] = {
        followers: base.followers ?? null,
        following: base.following ?? null,
        posts: base.posts ?? null,
        avg_likes: e.avg_likes ?? null,
        avg_comments: e.avg_comments ?? null,
        engagement_rate: e.engagement_rate ?? null,
        anomaly: false,
      };
    }
    return out;
  });

  const latestDate = history.length ? history[history.length - 1].date : null;
  const latestRow = history.length ? history[history.length - 1] : null;
  const latest = { date: latestDate };
  const growth = {};
  const rankings = { by_followers: [], by_engagement_rate: [], by_avg_likes: [] };
  const latestAccounts = [];

  for (const accountCfg of accountsCfg) {
    const username = accountCfg.username;
    const last = latestRow?.[username] || {};
    latest[username] = {
      followers: last.followers ?? null,
      following: last.following ?? null,
      posts: last.posts ?? null,
      avg_likes: last.avg_likes ?? null,
      avg_comments: last.avg_comments ?? null,
      engagement_rate: last.engagement_rate ?? null,
      ff_ratio: ratio(last.followers, last.following),
      verified: !!accountCfg.verified,
      sources: { stats: 'socialblade', engagement: 'apify' },
    };
    growth[username] = computeGrowth(history, username);
    latestAccounts.push({ username, ...latest[username] });
  }

  rankings.by_followers = [...latestAccounts]
    .sort((a, b) => (b.followers || 0) - (a.followers || 0))
    .map((a, i) => ({ rank: i + 1, account: a.username, followers: a.followers || 0 }));
  rankings.by_engagement_rate = [...latestAccounts]
    .sort((a, b) => ((b.engagement_rate ?? -1) - (a.engagement_rate ?? -1)))
    .map((a, i) => ({ rank: i + 1, account: a.username, engagement_rate: Number(a.engagement_rate ?? 0) || 0 }));
  rankings.by_avg_likes = [...latestAccounts]
    .sort((a, b) => ((b.avg_likes ?? -1) - (a.avg_likes ?? -1)))
    .map((a, i) => ({ rank: i + 1, account: a.username, avg_likes: a.avg_likes ?? null }));

  const content_breakdown = {};
  for (const username of accounts) {
    content_breakdown[username] = contentByUser.get(username) || null;
  }

  // Fetch post insights from Supabase as fallback when local files are missing
  const { data: supabasePostInsights } = await supabase
    .from('post_insights')
    .select('*')
    .gte('date', windowStart)
    .lte('date', windowEnd)
    .in('username', accounts)
    .order('date', { ascending: false });

  const supabasePostsByUser = {};
  if (supabasePostInsights && supabasePostInsights.length) {
    for (const row of supabasePostInsights) {
      if (!row.username) continue;
      if (!supabasePostsByUser[row.username]) supabasePostsByUser[row.username] = [];
      supabasePostsByUser[row.username].push({
        shortcode: row.shortcode,
        url: row.url,
        type: row.post_type,
        likes: Number(row.likes || 0),
        comments: Number(row.comments || 0),
        published_at: row.published_at,
        caption_snippet: row.caption_snippet,
      });
    }
  }

  const post_insights = {};
  for (const username of accounts) {
    const rawPosts = loadLatestPostData(repoRoot, username);
    const followers = latest[username] && Number.isFinite(latest[username].followers) ? latest[username].followers : null;
    if (rawPosts) {
      post_insights[username] = buildPostInsight(rawPosts, followers);
    } else if (supabasePostsByUser[username] && supabasePostsByUser[username].length) {
      // Fallback: build from Supabase post_insights data
      post_insights[username] = buildPostInsight({ posts: supabasePostsByUser[username] }, followers);
    } else {
      post_insights[username] = null;
    }
  }

const now = new Date();
  const generatedAt = now.toISOString();
  const assetVersion = toAssetVersion(generatedAt);

  // Ensure all enabled accounts produce entries (handle failed accounts)
  for (const accountCfg of accountsCfg) {
    const username = accountCfg.username;
    if (!latest[username]) {
      console.warn(`[WARN] Account "${username}" has no data from pipeline — including with null engagement fields`);
      latest[username] = {
        followers: accountCfg.followers || null,
        following: null,
        posts: null,
        avg_likes: null,
        avg_comments: null,
        engagement_rate: null,
        ff_ratio: null,
        verified: !!accountCfg.verified,
        sources: { stats: 'socialblade', engagement: 'apify' },
      };
    }
    if (!growth[username]) {
      growth[username] = { followers_change_1d: 0, followers_change_7d: 0, pct_change_7d: 0, anomaly_detected: false, notes: [] };
    }
  }

  // Ensure accounts list includes all enabled accounts
  const accountsSet = new Set(accounts);
  for (const accountCfg of accountsCfg) {
    if (!accountsSet.has(accountCfg.username)) {
      accounts.push(accountCfg.username);
      accountsSet.add(accountCfg.username);
    }
  }

  const output = {
    generated_at: generatedAt,
    generated_at_wib: formatWib(generatedAt),
    version: 2,
    sources: { stats: 'socialblade', engagement: 'apify' },
    accounts,
    latest,
    history,
    growth,
    rankings,
    content_breakdown,
    post_insights,
    presentation_report: null,
    meta: {
      brand_account: accounts[0] || null,
      history_days: history.length,
    },
  };

  output.presentation_report = buildPresentationReport(output);

  // --- Schema validation pre-write ---
  const validation = validatePayload(output);
  if (!validation.success) {
    console.error('[ERROR] Dashboard payload failed schema validation. Previous payload preserved.');
    for (const err of validation.errors) {
      console.error(`  - ${err.path}: ${err.message} (${err.code})`);
    }
    process.exit(1);
  }

  // Write to new canonical location: data/dashboard-snapshot.json
  const snapshotPath = path.join(repoRoot, 'data', 'dashboard-snapshot.json');
  ensureDir(path.dirname(snapshotPath));
  fs.writeFileSync(snapshotPath, JSON.stringify(output, null, 2));

  // Also write to legacy location for backward compatibility during migration
  const legacyOutPath = path.join(repoRoot, 'dashboard', 'data.json');
  ensureDir(path.dirname(legacyOutPath));
  fs.writeFileSync(legacyOutPath, JSON.stringify(output, null, 2));

  // Cache in Supabase for the API endpoint
  // DISABLED: PostgREST body size limit (~64KB) rejects large payloads (PGRST102)
  // API route now uses GitHub raw directly (see dashboard-react/api/dashboard-data.ts)
  // const { error: cacheError } = await supabase
  //   .from('dashboard_cache')
  //   .insert({
  //     generated_at: output.generated_at,
  //     payload: output,
  //     version: output.version,
  //   });
  // if (cacheError) {
  //   console.warn('Warning: Failed to cache dashboard in Supabase:', cacheError.message);
  // }

  const assetUpdate = updateHtmlAssetVersion(repoRoot, assetVersion);
  console.log(JSON.stringify({ outPath: snapshotPath, legacyOutPath, generated_at: output.generated_at, history_days: output.meta.history_days, accounts, asset_version: assetVersion, index_html_updated: assetUpdate.updated, schema_valid: true }, null, 2));
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
