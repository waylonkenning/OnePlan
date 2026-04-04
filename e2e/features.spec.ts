import { test, expect } from '@playwright/test';

test.describe('Features Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('scenia-e2e', 'true');
    });
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="asset-row-content"]');
  });

  test('should show Resources & Capacity card', async ({ page }) => {
    await page.getByTestId('nav-features').click();
    await expect(page.getByText('Scenia Features & Capabilities')).toBeVisible();
    await expect(page.getByText('Resources & Capacity')).toBeVisible();
  });

  test('should open and close the features modal', async ({ page }) => {
    await page.getByTestId('nav-features').click();
    
    await expect(page.getByText('Scenia Features & Capabilities')).toBeVisible();

    await expect(page.getByText('Navigation & Setup')).toBeVisible();
    await expect(page.getByText('Using the Visualiser')).toBeVisible();

    await page.locator('button[aria-label="Close Features"]').click();

    await expect(page.getByText('Scenia Features & Capabilities')).toBeHidden();
  });
});

test.describe('Features Modal — Card Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-features').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('icon-only features render as compact cards (no tall image area)', async ({ page }) => {
    const compactCards = page.locator('[data-testid="feature-card-compact"]');
    await expect(compactCards.first()).toBeVisible();

    const first = compactCards.first();
    const box = await first.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThan(160);
  });

  test('image cards retain their screenshot layout', async ({ page }) => {
    const imageCards = page.locator('[data-testid="feature-card-image"]');
    await expect(imageCards.first()).toBeVisible();

    await expect(imageCards.first().locator('img')).toBeVisible();
  });

  test('compact cards contain an inline icon, title and description', async ({ page }) => {
    const card = page.locator('[data-testid="feature-card-compact"]').first();
    await expect(card).toBeVisible();
    await expect(card.locator('h4')).toBeVisible();
    await expect(card.locator('p')).toBeVisible();
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

  test('Colour by Progress renders as an image card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-image"]').filter({ hasText: 'Colour by Progress' })).toBeVisible();
  });
});
