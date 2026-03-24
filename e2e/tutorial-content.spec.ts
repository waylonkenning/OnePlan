import { test, expect } from '@playwright/test';

/**
 * Verifies that the tutorial modal covers all major current features.
 * Navigation helpers re-use the approach from tutorial-modal.spec.ts.
 */
test.describe('Tutorial Content', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for the app to fully hydrate (DB save complete) before removing the E2E flag,
    // otherwise the template picker may appear on reload due to an empty DB race condition.
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.evaluate(() => {
      localStorage.removeItem('scenia-e2e');
      localStorage.setItem('scenia_has_seen_landing', 'true');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible({ timeout: 30000 });
  });

  const nextSlide = (page: import('@playwright/test').Page) =>
    page.getByRole('button', { name: 'Next' }).click();

  test('Timeline slide mentions colour modes', async ({ page }) => {
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /colou?r/i })).toBeVisible();
  });

  test('Timeline slide mentions critical path', async ({ page }) => {
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /critical path/i })).toBeVisible();
  });

  test('Initiative editing slide mentions resource assignment', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Adding & Editing Initiatives' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /resource/i })).toBeVisible();
  });

  test('Data Manager slide mentions Resources tab', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Data Manager' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /resource/i })).toBeVisible();
  });

  test('Reports slide mentions capacity report', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /capacity/i })).toBeVisible();
  });

  test('Reports slide mentions mobile card view', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /mobile/i })).toBeVisible();
  });
});
