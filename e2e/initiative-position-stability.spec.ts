import { test, expect } from '@playwright/test';

test('Initiative remains in same vertical row during drag', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser');

  // Need at least two initiatives in the same asset that overlap or are close
  // Let's use "Passkey Rollout" and "SSO Consolidation" in "Customer IAM (CIAM)"
  const init1 = page.locator('div[data-initiative-id="i-ciam-passkey"]').first();
  const init2 = page.locator('div[data-initiative-id="i-ciam-sso"]').first();

  await expect(init1).toBeVisible();
  await expect(init2).toBeVisible();

  const box1Initial = await init1.boundingBox();
  const box2Initial = await init2.boundingBox();

  if (!box1Initial || !box2Initial) throw new Error("Could not find initiatives");

  // Record initial tops relative to their container
  const top1Initial = parseFloat(await init1.evaluate(el => el.style.top));
  const top2Initial = parseFloat(await init2.evaluate(el => el.style.top));

  console.log(`Initial tops: init1=${top1Initial}, init2=${top2Initial}`);

  // Drag init1 horizontally
  const centerX = box1Initial.x + box1Initial.width / 2;
  const centerY = box1Initial.y + box1Initial.height / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  
  // Move right significantly to pass init2 if necessary
  // We'll move in steps and check the top
  for (let i = 1; i <= 5; i++) {
    await page.mouse.move(centerX + (i * 100), centerY, { steps: 5 });
    
    const top1During = parseFloat(await init1.evaluate(el => el.style.top));
    const top2During = parseFloat(await init2.evaluate(el => el.style.top));
    
    console.log(`Step ${i} tops: init1=${top1During}, init2=${top2During}`);
    
    // THE ASSERTION: tops should stay the same as initial
    expect(top1During).toBe(top1Initial);
    expect(top2During).toBe(top2Initial);
  }

  await page.mouse.up();
});
