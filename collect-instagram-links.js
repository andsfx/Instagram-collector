const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
const account = 'metmalbekasi';
const profileDir = path.join(os.homedir(), 'instagram-collector', 'profile-default');
const output = path.join(os.homedir(), 'instagram-collector', `${account}-latest12.json`);

const result = {
account,
collected_at: new Date().toISOString(),
source: 'playwright-persistent-profile-collector',
post_links: [],
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

await page.waitForTimeout(20000);

result.final_url = page.url();
result.title = await page.title();

const body = await page.locator('body').innerText().catch(() => '');
result.body_preview = body.slice(0, 2000);

const links = await page.locator("a[href*='/p/'], a[href*='/reel/']").evaluateAll(els =>
els.map(a => a.getAttribute('href')).filter(Boolean)
);

const clean = [];
const seen = new Set();

for (let href of links) {
if (href.startsWith('/')) href = 'https://www.instagram.com' + href;
href = href.split('?')[0];

if (
!href.startsWith(`https://www.instagram.com/${account}/p/`) &&
!href.startsWith(`https://www.instagram.com/${account}/reel/`)
) {
continue;
}

if (!seen.has(href)) {
seen.add(href);
clean.push(href);
}

if (clean.length >= 12) break;
}

result.post_link_count = clean.length;
result.post_links = clean;

if (clean.length === 0) {
result.warnings.push('No post links found.');
}
} finally {
await context.close();
}

fs.writeFileSync(output, JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify(result, null, 2));
})();
