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

  test('mobile shows card view (not timeline) on mobile viewport', async ({ page }) => {
    // Phase 4: on mobile the Visualiser tab renders MobileCardView, not the timeline.
    // The asset sidebar / timeline grid are not present on mobile — the card view replaces them.
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
    // The desktop timeline should not be present
    await expect(page.locator('#timeline-visualiser')).toBeHidden();
  });

  test('app outer padding is reduced on mobile', async ({ page }) => {
    // Root container should use p-3 (12px) not p-6 (24px) on mobile
    const root = page.locator('#root > div');
    const paddingLeft = await root.evaluate(el => parseInt(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeLessThanOrEqual(16); // p-3 = 12px or p-4 = 16px
  });

  test('card view has at least one asset card on mobile', async ({ page }) => {
    // Phase 4: mobile shows asset cards; verify at least one card is rendered
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    const cards = page.locator('[data-testid^="asset-card-"]');
    await expect(cards.first()).toBeVisible();
  });
});
