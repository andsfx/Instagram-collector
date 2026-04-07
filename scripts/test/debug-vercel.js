const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`[PAGE_ERROR] ${error.message}`));
  page.on('requestfailed', request => {
    console.log(`[NETWORK_FAILED] ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to https://instagram-tracker-dashboard.vercel.app/ ...');
  await page.goto('https://instagram-tracker-dashboard.vercel.app/', { waitUntil: 'networkidle' });
  
  console.log('Waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
