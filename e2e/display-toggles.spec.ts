import { test, expect } from '@playwright/test';

/**
 * The Display popover is replaced by inline icon toggles in the header.
 * Each toggle represents one display setting.
 */
test.describe('Inline display toggles', () => {
  test('four toggle buttons are present in the header', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await expect(page.getByTestId('toggle-conflicts')).toBeVisible();
    await expect(page.getByTestId('toggle-relationships')).toBeVisible();
    await expect(page.getByTestId('toggle-descriptions')).toBeVisible();
    await expect(page.getByTestId('toggle-budget')).toBeVisible();
  });

  test('toggle-conflicts turns conflict detection off and on', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const toggle = page.getByTestId('toggle-conflicts');

    // Default is on
    await expect(toggle).toHaveAttribute('data-active', 'true');

    // Click to turn off
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'false');

    // Click to turn back on
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'true');
  });

  test('toggle-relationships turns relationships off and on', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const toggle = page.getByTestId('toggle-relationships');
    await expect(toggle).toHaveAttribute('data-active', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'true');
  });

  test('toggle-descriptions turns descriptions off and on', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const toggle = page.getByTestId('toggle-descriptions');
    await expect(toggle).toHaveAttribute('data-active', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'true');
  });

  test('toggle-budget cycles through off → label → bar-height → off', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const toggle = page.getByTestId('toggle-budget');
    await expect(toggle).toHaveAttribute('data-mode', 'off');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-mode', 'label');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-mode', 'bar-height');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-mode', 'off');
  });

  test('Display popover button is no longer present', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await expect(page.getByRole('button', { name: 'Display' })).not.toBeVisible();
  });
});
