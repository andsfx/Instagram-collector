const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

(async () => {
const profileDir = path.join(os.homedir(), 'instagram-collector', 'profile-default');

const context = await chromium.launchPersistentContext(profileDir, {
headless: false,
viewport: { width: 1440, height: 900 }
});

const page = context.pages()[0] || await context.newPage();
await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

console.log('Profile dir:', profileDir);
console.log('Login manual dulu, lalu tekan Enter di terminal.');

process.stdin.resume();
process.stdin.once('data', async () => {
await context.close();
process.exit(0);
});
})();
