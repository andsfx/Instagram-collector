const fs = require('fs');
const path = require('path');
const { supabase } = require('../lib/supabase');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const dataPath = path.join(repoRoot, 'dashboard', 'data.json');

  if (!fs.existsSync(dataPath)) {
    console.error('dashboard/data.json not found');
    process.exit(1);
  }

  const data = readJson(dataPath);
  const accounts = data.accounts || [];

  console.log(`Seeding ${accounts.length} accounts...`);

  // 1. Seed accounts
  const accountRows = accounts.map((username) => {
    const latest = data.latest?.[username] || {};
    return {
      username,
      followers: Number(latest.followers || 0),
      enabled: true,
      verified: Boolean(latest.verified),
    };
  });

  const { error: accError } = await supabase
    .from('accounts')
    .upsert(accountRows, { onConflict: 'username' });
  if (accError) {
    console.error('Failed to seed accounts:', accError.message);
    process.exit(1);
  }
  console.log(`  accounts: ${accountRows.length} upserted`);

  // 2. Seed follower_history from history array
  const history = data.history || [];
  let historyCount = 0;
  for (const row of history) {
    const date = row.date;
    if (!date) continue;

    const batch = [];
    for (const username of accounts) {
      const entry = row[username];
      if (!entry) continue;
      batch.push({
        date,
        username,
        followers: entry.followers ?? null,
        following: entry.following ?? null,
        posts: entry.posts ?? null,
      });
    }

    if (batch.length) {
      const { error } = await supabase
        .from('follower_history')
        .upsert(batch, { onConflict: 'date,username' });
      if (error) {
        console.error(`  follower_history ${date}: ${error.message}`);
      } else {
        historyCount += batch.length;
      }
    }
  }
  console.log(`  follower_history: ${historyCount} rows upserted`);

  // 3. Seed engagement from history (where engagement data exists)
  let engagementCount = 0;
  for (const row of history) {
    const date = row.date;
    if (!date) continue;

    const batch = [];
    for (const username of accounts) {
      const entry = row[username];
      if (!entry || entry.avg_likes == null) continue;
      batch.push({
        date,
        username,
        avg_likes: entry.avg_likes ?? null,
        avg_comments: entry.avg_comments ?? null,
        engagement_rate: entry.engagement_rate ?? null,
      });
    }

    if (batch.length) {
      const { error } = await supabase
        .from('engagement')
        .upsert(batch, { onConflict: 'date,username' });
      if (error) {
        console.error(`  engagement ${date}: ${error.message}`);
      } else {
        engagementCount += batch.length;
      }
    }
  }
  console.log(`  engagement: ${engagementCount} rows upserted`);

  // 4. Seed content_breakdown
  const cb = data.content_breakdown || {};
  const cbBatch = [];
  const latestDate = data.latest?.date || new Date().toISOString().slice(0, 10);
  for (const username of accounts) {
    const entry = cb[username];
    if (!entry) continue;
    cbBatch.push({
      date: entry.date || latestDate,
      username,
      reels: Number(entry.reels || 0),
      carousel: Number(entry.carousel || 0),
      image: Number(entry.image || 0),
      video: Number(entry.video || 0),
      total_posts_analyzed: Number(entry.total_posts_analyzed || 0),
      avg_likes: entry.avg_likes != null ? Number(entry.avg_likes) : null,
      avg_comments: entry.avg_comments != null ? Number(entry.avg_comments) : null,
      engagement_rate: entry.engagement_rate != null ? Number(entry.engagement_rate) : null,
      reels_avg_likes: entry.reels_avg_likes != null ? Number(entry.reels_avg_likes) : null,
      reels_avg_comments: entry.reels_avg_comments != null ? Number(entry.reels_avg_comments) : null,
      reels_er: entry.reels_er != null ? Number(entry.reels_er) : null,
      carousel_avg_likes: entry.carousel_avg_likes != null ? Number(entry.carousel_avg_likes) : null,
      carousel_avg_comments: entry.carousel_avg_comments != null ? Number(entry.carousel_avg_comments) : null,
      carousel_er: entry.carousel_er != null ? Number(entry.carousel_er) : null,
      image_avg_likes: entry.image_avg_likes != null ? Number(entry.image_avg_likes) : null,
      image_avg_comments: entry.image_avg_comments != null ? Number(entry.image_avg_comments) : null,
      image_er: entry.image_er != null ? Number(entry.image_er) : null,
      best_post_url: entry.best_post_url || null,
      best_post_type: entry.best_post_type || null,
      best_post_likes: entry.best_post_likes != null ? Number(entry.best_post_likes) : null,
      best_post_comments: entry.best_post_comments != null ? Number(entry.best_post_comments) : null,
    });
  }

  if (cbBatch.length) {
    const { error } = await supabase
      .from('content_breakdown')
      .upsert(cbBatch, { onConflict: 'date,username' });
    if (error) {
      console.error('  content_breakdown:', error.message);
    } else {
      console.log(`  content_breakdown: ${cbBatch.length} rows upserted`);
    }
  }

  // 5. Seed post_insights
  const pi = data.post_insights || {};
  let postCount = 0;
  for (const username of accounts) {
    const insight = pi[username];
    if (!insight || !Array.isArray(insight.posts)) continue;

    const batch = insight.posts.map((post) => ({
      date: latestDate,
      username,
      shortcode: post.shortcode || null,
      url: post.url || null,
      post_type: post.type || null,
      likes: Number(post.likes || 0),
      comments: Number(post.comments || 0),
      interactions: Number(post.interactions || 0),
      published_at: post.published_at || null,
      caption_snippet: post.caption_snippet || null,
      post_er: post.post_er != null ? Number(post.post_er) : null,
      performance_label: post.performance_label || 'normal',
    }));

    if (batch.length) {
      const { error } = await supabase
        .from('post_insights')
        .upsert(batch, { onConflict: 'date,username,shortcode' });
      if (error) {
        console.error(`  post_insights ${username}: ${error.message}`);
      } else {
        postCount += batch.length;
      }
    }
  }
  console.log(`  post_insights: ${postCount} rows upserted`);

  // 6. Cache the full dashboard payload
  const { error: cacheError } = await supabase
    .from('dashboard_cache')
    .insert({
      generated_at: data.generated_at,
      payload: data,
      version: data.version || 2,
    });
  if (cacheError) {
    console.error('  dashboard_cache:', cacheError.message);
  } else {
    console.log('  dashboard_cache: 1 row inserted');
  }

  console.log('\nSeed complete!');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
