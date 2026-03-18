import { test, expect } from '@playwright/test';

/**
 * Progress Tracking — % complete field on initiatives with a bar fill overlay.
 */
test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('progress field is visible in InitiativePanel', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await expect(page.getByTestId('initiative-progress')).toBeVisible();
  });

  test('progress field accepts a value between 0 and 100', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const field = page.getByTestId('initiative-progress');
    await field.fill('75');
    await expect(field).toHaveValue('75');
  });

  test('progress field is visible in Data Manager', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    // The progress column header should be visible
    await expect(page.locator('[data-col-key="progress"]')).toBeVisible();
  });

  test('progress value persists across reloads', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await page.getByTestId('initiative-progress').fill('60');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await expect(page.getByTestId('initiative-progress')).toHaveValue('60');
  });

  test('bar renders a progress fill overlay when progress > 0', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await page.getByTestId('initiative-progress').fill('50');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    const overlay = page.locator('[data-testid="progress-overlay"]').first();
    await expect(overlay).toBeVisible();
  });

  test('progress fill overlay width is proportional to progress value', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await page.getByTestId('initiative-progress').fill('40');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    const overlay = page.locator('[data-testid="progress-overlay"]').first();
    const width = await overlay.evaluate(el => (el as HTMLElement).style.width);
    expect(width).toBe('40%');
  });

  test('no progress overlay when progress is 0', async ({ page }) => {
    // By default all initiatives have no progress set (treated as 0)
    const overlays = page.locator('[data-testid="progress-overlay"]');
    await expect(overlays).toHaveCount(0);
  });
});
