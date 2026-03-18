import { test, expect } from '@playwright/test';

/**
 * Visualiser-Only Controls
 *
 * Controls that only apply to the Visualiser (timeline range, display toggles,
 * zoom) must be hidden when the active view is Data Manager or Reports,
 * and must reappear when switching back to Visualiser.
 */
test.describe('Visualiser-Only Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  const visualiserOnlyTestIds = [
    'toggle-conflicts',
    'toggle-relationships',
    'toggle-descriptions',
    'toggle-budget',
    'toggle-critical-path',
    'toggle-resources',
    'zoom-in',
    'zoom-out',
    'display-more-btn',
  ];

  test('all visualiser-only toggles are visible in Visualiser view', async ({ page }) => {
    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('visualiser-only toggles are hidden in Data Manager view', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeHidden();
    }
  });

  test('visualiser-only toggles are hidden in Reports view', async ({ page }) => {
    await page.getByTestId('nav-reports').click();

    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeHidden();
    }
  });

  test('visualiser-only toggles reappear when switching back to Visualiser', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('toggle-conflicts')).toBeHidden();

    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTestId('asset-row-content').first()).toBeVisible();

    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('timeline range inputs (Start date, Months) are hidden in Data Manager view', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    await expect(page.getByTestId('timeline-start-input')).toBeHidden();
    await expect(page.getByTestId('timeline-months-select')).toBeHidden();
  });

  test('timeline range inputs are hidden in Reports view', async ({ page }) => {
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('timeline-start-input')).toBeHidden();
    await expect(page.getByTestId('timeline-months-select')).toBeHidden();
  });
});
