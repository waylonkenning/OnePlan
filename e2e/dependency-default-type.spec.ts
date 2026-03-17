import { test, expect } from '@playwright/test';

/**
 * Default dependency type when drawing an arrow should be "requires".
 */

test('drawing a new dependency arrow defaults to requires type (blue)', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

  // Use Passkey Rollout → Zero Trust Network Access (different assets, clear gap)
  const sourceInit = page.locator('div[title*="Passkey Rollout"]').first();
  const targetInit = page.locator('div[title*="Zero Trust Network Access"]').first();

  const sourceBox = await sourceInit.boundingBox();
  const targetBox = await targetInit.boundingBox();
  if (!sourceBox || !targetBox) throw new Error('Could not find initiatives');

  // Count existing blue (requires) arrows before
  const blueArrowsBefore = await page.locator('g.cursor-pointer.group path[stroke="#3b82f6"]').count();

  // Drag from source to target to draw a new dependency
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
  await page.mouse.up();

  // The new arrow should be blue (#3b82f6 = requires), not red (#ef4444 = blocks)
  const blueArrowsAfter = await page.locator('g.cursor-pointer.group path[stroke="#3b82f6"]').count();
  expect(blueArrowsAfter).toBeGreaterThan(blueArrowsBefore);
});
