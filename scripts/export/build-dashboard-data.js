const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function gogBin() {
  if (process.env.GOG_BIN) return process.env.GOG_BIN;
  return process.platform === 'win32' ? 'gog' : '/root/.local/bin/gog';
}

function runGog(args) {
  const env = { ...process.env };
  if (!env.GOG_ACCOUNT) env.GOG_ACCOUNT = 'andysafii9@gmail.com';
  return execFileSync(gogBin(), args, {
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function getSheetRows(spreadsheetId, range) {
  const out = runGog(['sheets', 'get', spreadsheetId, range, '--json', '--results-only', '--no-input']);
  return JSON.parse(out || '[]');
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

function buildFollowerHistoryMap(rows, accounts) {
  if (!rows.length) return [];
  const header = rows[0] || [];
  const dataRows = rows.slice(1);
  const indices = {};
  for (const username of accounts) {
    indices[username] = {
      followers: header.indexOf(`${username}_followers`),
      following: header.indexOf(`${username}_following`),
      posts: header.indexOf(`${username}_posts`),
    };
  }
  return dataRows.map((row) => {
    const item = { date: row[0] || '' };
    for (const username of accounts) {
      const idx = indices[username];
      item[username] = {
        followers: idx.followers >= 0 ? Number(row[idx.followers] || 0) || null : null,
        following: idx.following >= 0 ? Number(row[idx.following] || 0) || null : null,
        posts: idx.posts >= 0 ? Number(row[idx.posts] || 0) || null : null,
      };
    }
    return item;
  }).filter((x) => x.date);
}

function buildEngagementMap(rows) {
  const map = new Map();
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const date = row[0];
    const username = row[1];
    if (!date || !username) continue;
    if (!map.has(date)) map.set(date, {});
    map.get(date)[username] = {
      avg_likes: Number(row[3] || 0) || 0,
      avg_comments: Number(row[4] || 0) || 0,
      engagement_rate: Number(row[5] || 0) || 0,
      posts_analyzed: Number(row[2] || 0) || 0,
      total_likes: Number(row[6] || 0) || 0,
      total_comments: Number(row[7] || 0) || 0,
    };
  }
  return map;
}

function buildContentBreakdownMap(rows) {
  const map = new Map();
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const date = row[0];
    const username = row[1];
    if (!date || !username) continue;
    map.set(username, {
      date,
      reels: Number(row[2] || 0) || 0,
      carousel: Number(row[3] || 0) || 0,
      image: Number(row[4] || 0) || 0,
      video: Number(row[5] || 0) || 0,
      total_posts_analyzed: Number(row[6] || 0) || 0,
      avg_likes: Number(row[7] || 0) || 0,
      avg_comments: Number(row[8] || 0) || 0,
      engagement_rate: Number(row[9] || 0) || 0,
      reels_avg_likes: row[10] === '' ? null : Number(row[10]),
      reels_avg_comments: row[11] === '' ? null : Number(row[11]),
      reels_er: row[12] === '' ? null : Number(row[12]),
      carousel_avg_likes: row[13] === '' ? null : Number(row[13]),
      carousel_avg_comments: row[14] === '' ? null : Number(row[14]),
      carousel_er: row[15] === '' ? null : Number(row[15]),
      image_avg_likes: row[16] === '' ? null : Number(row[16]),
      image_avg_comments: row[17] === '' ? null : Number(row[17]),
      image_er: row[18] === '' ? null : Number(row[18]),
      best_post_url: row[19] || null,
      best_post_type: row[20] || null,
      best_post_likes: row[21] === '' ? null : Number(row[21]),
      best_post_comments: row[22] === '' ? null : Number(row[22]),
    });
  }
  return map;
}

const HASHTAG_REGEX = /#[\p{L}0-9_]+/gu;
const POST_CAMPAIGN_TERMS = ['promo', 'diskon', 'event', 'grand opening', 'new tenant', 'launch', 'special', 'giveaway', 'limited', 'opening', 'promo menarik'];

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

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const accountsCfg = readJson(path.join(repoRoot, 'config', 'accounts.json')).filter((a) => a.enabled);
  const accounts = accountsCfg.map((a) => a.username);
  const sheets = readJson(path.join(repoRoot, 'config', 'sheets.json'));
  const spreadsheetId = sheets.spreadsheetId;

  const followerRows = getSheetRows(spreadsheetId, 'Follower History!A1:ZZ');
  const engagementRows = getSheetRows(spreadsheetId, 'Engagement!A1:H');
  const contentRows = getSheetRows(spreadsheetId, 'Content Breakdown!A1:W');

  const historyBase = buildFollowerHistoryMap(followerRows, accounts);
  const engagementByDate = buildEngagementMap(engagementRows);
  const contentByUser = buildContentBreakdownMap(contentRows);

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
  const latest = { date: latestDate };
  const growth = {};
  const rankings = { by_followers: [], by_engagement_rate: [], by_avg_likes: [] };
  const latestAccounts = [];

  for (const accountCfg of accountsCfg) {
    const username = accountCfg.username;
    const last = latestDate ? history.find((h) => h.date === latestDate)?.[username] || {} : {};
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
    .map((a, i) => ({ rank: i + 1, account: a.username, engagement_rate: a.engagement_rate ?? null }));
  rankings.by_avg_likes = [...latestAccounts]
    .sort((a, b) => ((b.avg_likes ?? -1) - (a.avg_likes ?? -1)))
    .map((a, i) => ({ rank: i + 1, account: a.username, avg_likes: a.avg_likes ?? null }));

  const content_breakdown = {};
  for (const username of accounts) {
    content_breakdown[username] = contentByUser.get(username) || null;
  }

  const post_insights = {};
for (const username of accounts) {
  const rawPosts = loadLatestPostData(repoRoot, username);
  const followers = latest[username] && Number.isFinite(latest[username].followers) ? latest[username].followers : null;
  post_insights[username] = buildPostInsight(rawPosts, followers);
}

const now = new Date();
  const output = {
    generated_at: now.toISOString(),
    generated_at_wib: formatWib(now.toISOString()),
    version: 2,
    sources: { stats: 'socialblade', engagement: 'apify' },
    accounts,
    latest,
    history,
    growth,
    rankings,
    content_breakdown,
    post_insights,
    meta: {
      brand_account: accounts[0] || null,
      history_days: history.length,
    },
  };

  const outPath = path.join(repoRoot, 'dashboard', 'data.json');
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(JSON.stringify({ outPath, generated_at: output.generated_at, history_days: output.meta.history_days, accounts }, null, 2));
}

main();
