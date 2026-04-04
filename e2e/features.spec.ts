import { test, expect } from '@playwright/test';

test.describe('Features Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('opens, shows expected content, and closes', async ({ page }) => {
    await page.getByTestId('nav-features').click();
    await expect(page.getByText('Scenia Features & Capabilities')).toBeVisible();

    // Core navigation sections
    await expect(page.getByText('Navigation & Setup')).toBeVisible();
    await expect(page.getByText('Using the Visualiser')).toBeVisible();
    await expect(page.getByText('Resources & Capacity')).toBeVisible();

    // Close
    await page.locator('button[aria-label="Close Features"]').click();
    await expect(page.getByText('Scenia Features & Capabilities')).toBeHidden();
  });

  test('loads correct v3 animation assets (move-resize and grouped images)', async ({ page }) => {
    await page.getByTestId('nav-features').click();
    await expect(page.locator('img[src="/features/move-resize.png"]')).toBeVisible();
    await expect(page.locator('img[src="/features/grouped.png"]')).toBeVisible();
    await page.locator('#close-features-modal').click();
  });
});

test.describe('Features Modal — Card Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await page.getByTestId('nav-features').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('compact cards are shorter than 160px and contain icon, title, and description (no image)', async ({ page }) => {
    const compactCards = page.locator('[data-testid="feature-card-compact"]');
    await expect(compactCards.first()).toBeVisible();

    const box = await compactCards.first().boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThan(160);

    const card = compactCards.first();
    await expect(card.locator('h4')).toBeVisible();
    await expect(card.locator('p')).toBeVisible();
    await expect(card.locator('img')).toHaveCount(0);
  });

  test('image cards retain their screenshot layout with an img element', async ({ page }) => {
    const imageCards = page.locator('[data-testid="feature-card-image"]');
    await expect(imageCards.first()).toBeVisible();
    await expect(imageCards.first().locator('img')).toBeVisible();
  });

  test('specific features render as compact cards', async ({ page }) => {
    for (const title of ['Safe & Secure Storage', 'Excel Import & Export', 'Critical Path Highlighting']) {
      await expect(
        page.locator('[data-testid="feature-card-compact"]').filter({ hasText: title })
      ).toBeVisible();
    }
  });

  test('specific features render as image cards', async ({ page }) => {
    for (const title of ['Version History', 'Conflict Detection', 'Colour by Progress']) {
      await expect(
        page.locator('[data-testid="feature-card-image"]').filter({ hasText: title })
      ).toBeVisible();
    }
  });
});
