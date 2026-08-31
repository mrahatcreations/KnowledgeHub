import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`🚨 [PAGE ERROR] ${err.stack || err.message}`);
  });

  page.on('requestfailed', req => {
    console.warn(`⚠️ [REQUEST FAILED] ${req.url()} (${req.failure()?.errorText})`);
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 }).catch(e => console.error('Goto error:', e.message));

  await page.waitForTimeout(2000);

  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('Root element innerHTML length:', rootHtml?.length || 0);
  console.log('Root element preview:', rootHtml?.substring(0, 300));

  await page.screenshot({ path: 'browser_screenshot.png' });
  console.log('Saved screenshot to browser_screenshot.png');

  await browser.close();
}

run().catch(console.error);
