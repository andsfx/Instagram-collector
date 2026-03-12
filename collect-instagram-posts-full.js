const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

function randomMs(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function classifyType(url, html, text) {
  const u = url.toLowerCase();
  if (u.includes('/reel/')) return 'reels';
  if (html.toLowerCase().includes('sidecar') || text.toLowerCase().includes('carousel')) return 'carousel';
  if (html.toLowerCase().includes('<video')) return 'video';
  return 'image';
}

function extractNumber(text, label) {
  const patterns = [
    new RegExp(`([\\d.,]+)\\s+${label}`, 'i'),
    new RegExp(`${label}\\s+([\\d.,]+)`, 'i'),
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const raw = m[1].replace(/,/g, '');
      const n = Number(raw);
      if (!Number.isNaN(n)) return Math.trunc(n);
    }
  }
  return null;
}

(async () => {
  const account = process.argv[2];
  if (!account) {
    console.error('Usage: node collect-instagram-posts-full.js <account>');
    process.exit(1);
  }

  const profileDir = path.join(os.homedir(), 'instagram-collector', 'profile-default');
  const output = path.join(os.homedir(), 'instagram-collector', `${account}-latest12-full.json`);

  const result = {
    account,
    collected_at: new Date().toISOString(),
    source: 'playwright-persistent-profile-full-collector',
    posts: [],
    warnings: []
  };

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    viewport: { width: 1440, height: 900 }
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    await page.goto(`https://www.instagram.com/${account}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    await page.waitForTimeout(randomMs(35000, 45000));
    result.final_url = page.url();
    result.title = await page.title();

    const body = await page.locator('body').innerText().catch(() => '');
    result.body_preview = body.slice(0, 2000);

    if (page.url().includes('/accounts/login')) {
      result.warnings.push('Redirected to login page.');
      fs.writeFileSync(output, JSON.stringify(result, null, 2), 'utf8');
      console.log(JSON.stringify(result, null, 2));
      await context.close();
      return;
    }

    if (page.url().toLowerCase().includes('challenge')) {
      result.warnings.push(`Challenge/checkpoint detected: ${page.url()}`);
      fs.writeFileSync(output, JSON.stringify(result, null, 2), 'utf8');
      console.log(JSON.stringify(result, null, 2));
      await context.close();
      return;
    }

    const clean = [];
    const seen = new Set();

    for (let round = 0; round < 8; round++) {
      const rawLinks = await page
        .locator("a[href*='/p/'], a[href*='/reel/']")
        .evaluateAll(els => els.map(a => a.getAttribute('href')).filter(Boolean));

      for (let href of rawLinks) {
        if (href.startsWith('/')) href = 'https://www.instagram.com' + href;
        href = href.split('?')[0];

        if (
          !href.startsWith(`https://www.instagram.com/${account}/p/`) &&
          !href.startsWith(`https://www.instagram.com/${account}/reel/`)
        ) continue;

        if (!seen.has(href)) {
          seen.add(href);
          clean.push(href);
        }
        if (clean.length >= 12) break;
      }

      if (clean.length >= 12) break;
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(10000 + Math.floor(Math.random() * 5000));
    }

    result.post_link_count = clean.length;
    result.post_links = clean;
    if (clean.length === 0) result.warnings.push('No valid post links found.');
    else if (clean.length < 12) result.warnings.push(`Only found ${clean.length} valid post links.`);

    for (const link of clean) {
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await page.waitForTimeout(randomMs(15000, 35000));

        const postBody = await page.locator('body').innerText().catch(() => '');
        const html = await page.content();
        const shortcode = link.replace(/\/$/, '').split('/').pop();

        let publishedAt = null;
        try {
          publishedAt = await page.locator('time').first().getAttribute('datetime', { timeout: 5000 });
        } catch {}

        let caption = null;
        try {
          caption = await page.locator('meta[property="og:description"]').getAttribute('content', { timeout: 3000 });
        } catch {}

        let likes = extractNumber(postBody, 'likes');
        let comments = extractNumber(postBody, 'comments');
        if ((likes === null || comments === null) && caption) {
          const likesMatch = caption.match(/(\d+)\s+likes/i);
          const commentsMatch = caption.match(/(\d+)\s+comments/i);
          if (likes === null && likesMatch) likes = Number(likesMatch[1]);
          if (comments === null && commentsMatch) comments = Number(commentsMatch[1]);
        }

        result.posts.push({
          shortcode,
          url: link,
          type: classifyType(link, html, postBody),
          caption,
          likes,
          comments,
          published_at: publishedAt,
          is_pinned: false
        });
      } catch (err) {
        result.warnings.push(`Failed extracting ${link}: ${err.message}`);
      }
    }
  } finally {
    await context.close();
  }

  fs.writeFileSync(output, JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify({ output, posts: result.posts.length, warnings: result.warnings }, null, 2));
})();
