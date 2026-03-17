import { test, expect } from '@playwright/test';

/**
 * Phase 1 mobile foundation tests.
 * All tests run at iPhone 14 Pro viewport (393 × 852).
 */
test.describe('Mobile Phase 1 — Foundation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('timeline sidebar is narrower on mobile', async ({ page }) => {
    // On mobile the sidebar should be 120px, not 256px
    const sidebar = page.locator('#timeline-visualiser .sticky.left-0').first();
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(128); // 120px ± rounding
    expect(box!.width).toBeGreaterThanOrEqual(112);
  });

  test('app outer padding is reduced on mobile', async ({ page }) => {
    // Root container should use p-3 (12px) not p-6 (24px) on mobile
    const root = page.locator('#root > div');
    const paddingLeft = await root.evaluate(el => parseInt(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeLessThanOrEqual(16); // p-3 = 12px or p-4 = 16px
  });

  test('default zoom is reduced on mobile', async ({ page }) => {
    // At 0.75x zoom the timeline content width should be less than at 1.0x
    // Verify by checking the scrollable content is not excessively wide
    // relative to the viewport (shouldn't require >5x scroll)
    const scrollable = page.locator('#timeline-visualiser .overflow-auto');
    const scrollWidth = await scrollable.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThan(393 * 5);
  });
});
