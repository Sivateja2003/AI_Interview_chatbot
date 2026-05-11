import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', err => errors.push({ type: 'pageerror', message: err.message, stack: err.stack }));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', message: msg.text() });
    }
  });

  await page.goto('http://localhost:5173/dashboard/interview', { waitUntil: 'networkidle' });

  const html = await page.content();
  const bodyText = await page.evaluate(() => document.body.innerText);
  const bodyHtml = await page.evaluate(() => document.body.outerHTML);
  const screenshotPath = 'playwright_debug_interview.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log('URL:', page.url());
  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  console.log('BODY_TEXT_LENGTH:', bodyText.length);
  console.log('BODY_TEXT_SAMPLE:', bodyText.slice(0, 500));
  console.log('BODY_HTML_START:', bodyHtml.slice(0, 1000));
  console.log('SCREENSHOT:', screenshotPath);

  await browser.close();
})();