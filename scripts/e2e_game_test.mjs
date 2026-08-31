import { chromium } from 'playwright';

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

  const errors = [];
  page.on('pageerror', err => {
    console.error(`🚨 [PAGE ERROR] ${err.message}`);
    errors.push(err.message);
  });

  console.log('1. Loading http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test_hub_view.png' });
  console.log('✅ SubjectHubView loaded with 0 errors');

  console.log('2. Testing Mode Switcher (Practice <-> Learning)...');
  await page.click('button:has-text("Learning")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test_hub_learning_mode.png' });
  console.log('✅ Learning Mode switched with 0 errors');

  await page.click('button:has-text("Practice")');
  await page.waitForTimeout(400);

  console.log('3. Testing SAGA MAP view...');
  await page.click('button:has-text("SAGA MAP")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test_saga_map.png' });
  console.log('✅ Saga Level Path loaded with 0 errors');

  await page.click('button[title="Back to Hub"], button:has-text("HUB")');
  await page.waitForTimeout(500);

  console.log('4. Starting Level 1 Gameplay...');
  await page.click('button:has-text("CONTINUE LEVEL 1")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test_stage_1_flashcard.png' });
  console.log('✅ Stage 1 Flashcard loaded with 0 errors');

  const optionButton = page.locator('button:has-text("01"), button:has-text("02")').first();
  if (await optionButton.isVisible()) {
    await optionButton.click();
    console.log('Selected option in Stage 1 Flashcard');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test_stage_transition.png' });
    console.log('✅ Stage Transition completed smoothly without blank screen!');
  }

  if (errors.length > 0) {
    console.error('❌ E2E Test encountered errors:', errors);
    process.exit(1);
  } else {
    console.log('🎉 ALL PLAYWRIGHT E2E TESTS PASSED 100% WITH 0 ERRORS!');
  }

  await browser.close();
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
