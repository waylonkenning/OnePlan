import { test, expect } from '@playwright/test';

/**
 * Critical Path Highlighting — a toggle in the timeline header that computes
 * the longest dependency chain and highlights the constituent bars + arrows.
 */
test.describe('Critical Path Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('toggle button is visible in the header', async ({ page }) => {
    await expect(page.getByTestId('toggle-critical-path')).toBeVisible();
  });

  test('toggle is off by default', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(btn).toHaveAttribute('data-active', 'false');
  });

  test('clicking toggle turns it on', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(btn).toHaveAttribute('data-active', 'true');
  });

  test('clicking toggle twice turns it back off', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await btn.click();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(btn).toHaveAttribute('data-active', 'false');
  });

  test('at least one initiative bar is marked as critical path when enabled', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    // At least one bar should be on the critical path
    const criticalBars = page.locator('[data-critical-path="true"]');
    await expect(criticalBars.first()).toBeVisible({ timeout: 5000 });
  });

  test('no bars are marked as critical path when toggle is off', async ({ page }) => {
    // Default: off — no bars should have the attribute set to true
    const criticalBars = page.locator('[data-critical-path="true"]');
    await expect(criticalBars).toHaveCount(0);
  });

  test('ISO 20022 Migration is on the critical path (longest chain)', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    // The Core ISO → Core API chain is the longest by duration in demo data
    const isoBar = page.locator('[data-initiative-id="i-core-iso"]');
    await expect(isoBar).toHaveAttribute('data-critical-path', 'true');
  });

  test('Core Banking API Layer is on the critical path', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    const apiBar = page.locator('[data-initiative-id="i-core-api"]');
    await expect(apiBar).toHaveAttribute('data-critical-path', 'true');
  });

  test('critical path state persists after reload', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    await expect(page.getByTestId('toggle-critical-path')).toHaveAttribute('data-active', 'true');
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await expect(page.getByTestId('toggle-critical-path')).toHaveAttribute('data-active', 'true');
  });
});
