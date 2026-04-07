const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let attempts = 0;
  while (attempts < 15) {
    await page.goto('https://instagram-tracker-dashboard.vercel.app/', { waitUntil: 'networkidle' });
    const isFixed = await page.evaluate(() => {
      const el = document.querySelector('.twrap');
      if (!el) return false;
      const styles = window.getComputedStyle(el);
      return styles.maxHeight === 'none';
    });
    if (isFixed) {
      console.log('NEW BUILD DETECTED WITH FIXED MAX-HEIGHT');
      break;
    }
    console.log('Waiting for new build... (' + (attempts + 1) + ')');
    await new Promise(r => setTimeout(r, 5000));
    attempts++;
  }
  await browser.close();
})();
