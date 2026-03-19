import { test, expect, Page } from '@playwright/test';

/**
 * Swimlane Grouping — group timeline rows by Programme or Strategy
 * instead of the default Asset/Category view.
 */
test.describe('Swimlane Grouping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // Helper: ensure View Options popover is open
  async function openViewOptions(page: Page) {
    const popover = page.getByTestId('view-options-popover');
    if (!await popover.isVisible()) {
      await page.getByTestId('view-options-btn').click();
      await expect(popover).toBeVisible();
    }
  }

  test('group-by selector is visible inside the View Options popover', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-asset')).toBeVisible();
    await expect(page.getByTestId('group-by-programme')).toBeVisible();
    await expect(page.getByTestId('group-by-strategy')).toBeVisible();
  });

  test('default grouping is by asset (category/asset rows visible)', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-asset')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid^="category-row-"]').first()).toBeVisible();
  });

  test('switching to programme grouping shows programme swimlane rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]').first()).toBeVisible();
  });

  test('switching to programme grouping hides asset/category rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="category-row-"]')).toHaveCount(0);
  });

  test('switching to strategy grouping shows strategy swimlane rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-strategy').click();
    await expect(page.locator('[data-testid^="swimlane-row-strategy-"]').first()).toBeVisible();
  });

  test('switching back to asset restores category rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]').first()).toBeVisible();
    await openViewOptions(page);
    await page.getByTestId('group-by-asset').click();
    await expect(page.locator('[data-testid^="category-row-"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]')).toHaveCount(0);
  });

  test('grouping mode persists across reloads', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-strategy').click();
    await expect(page.locator('[data-testid^="swimlane-row-strategy-"]').first()).toBeVisible();
    await page.reload();
    await page.waitForSelector('[data-testid^="swimlane-row-strategy-"]', { timeout: 20000 });
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-strategy')).toHaveAttribute('aria-pressed', 'true');
  });
});
