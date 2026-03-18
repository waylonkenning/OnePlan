import { test, expect } from '@playwright/test';

test.describe('Features Modal — Card Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    // Open the features modal via the BookOpen button
    await page.getByTestId('nav-features').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('icon-only features render as compact cards (no tall image area)', async ({ page }) => {
    const compactCards = page.locator('[data-testid="feature-card-compact"]');
    await expect(compactCards.first()).toBeVisible();

    // Compact cards must NOT contain a 192px image placeholder
    const first = compactCards.first();
    const box = await first.boundingBox();
    expect(box).not.toBeNull();
    // A compact card should be noticeably shorter than a full image card (< 160px tall)
    expect(box!.height).toBeLessThan(160);
  });

  test('image cards retain their screenshot layout', async ({ page }) => {
    const imageCards = page.locator('[data-testid="feature-card-image"]');
    await expect(imageCards.first()).toBeVisible();

    // Image cards should contain an img element
    await expect(imageCards.first().locator('img')).toBeVisible();
  });

  test('compact cards contain an inline icon, title and description', async ({ page }) => {
    const card = page.locator('[data-testid="feature-card-compact"]').first();
    await expect(card).toBeVisible();
    // Should have a title (h4)
    await expect(card.locator('h4')).toBeVisible();
    // Should have description text (p)
    await expect(card.locator('p')).toBeVisible();
    // Should NOT have an img element
    await expect(card.locator('img')).toHaveCount(0);
  });

  test('Safe & Secure Storage renders as a compact card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-compact"]').filter({ hasText: 'Safe & Secure Storage' })).toBeVisible();
  });

  test('Excel Import & Export renders as a compact card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-compact"]').filter({ hasText: 'Excel Import & Export' })).toBeVisible();
  });

  test('Critical Path Highlighting renders as a compact card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-compact"]').filter({ hasText: 'Critical Path Highlighting' })).toBeVisible();
  });

  test('Version History renders as an image card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-image"]').filter({ hasText: 'Version History' })).toBeVisible();
  });

  test('Conflict Detection renders as an image card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-image"]').filter({ hasText: 'Conflict Detection' })).toBeVisible();
  });

  test('Colour by Status renders as an image card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-image"]').filter({ hasText: 'Colour by Status' })).toBeVisible();
  });
});
