import { test, expect } from '@playwright/test';

/**
 * Colour-by-Status feature:
 * - Initiatives have a Status field (planned / active / done / cancelled)
 * - A "By Status" colour mode is available in the timeline legend bar
 * - Bars are coloured by status when that mode is active
 * - The legend updates to show status colours
 * - Status is saved to IndexedDB and persists across reloads
 */

test.describe('Initiative status field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('status field appears in InitiativePanel', async ({ page }) => {
    // Open an initiative panel
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    // Status select/field must be present
    const statusField = panel.locator('[data-testid="initiative-status"]');
    await expect(statusField).toBeVisible();
  });

  test('status field has planned / active / done / cancelled options', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const statusField = panel.locator('[data-testid="initiative-status"]');
    await expect(statusField).toBeVisible();

    // All four options must be present
    await expect(statusField.locator('option[value="planned"]')).toBeAttached();
    await expect(statusField.locator('option[value="active"]')).toBeAttached();
    await expect(statusField.locator('option[value="done"]')).toBeAttached();
    await expect(statusField.locator('option[value="cancelled"]')).toBeAttached();
  });

  test('status field appears in Data Manager Initiatives table', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    // Status column header must be present
    await expect(page.getByTestId('data-manager').locator('th').filter({ hasText: 'Status' })).toBeVisible();
  });

  test('changing status in InitiativePanel persists after reload', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const statusField = panel.locator('[data-testid="initiative-status"]');
    await statusField.selectOption('active');

    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    // Reload and reopen
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    const panel2 = page.getByTestId('initiative-panel');
    await expect(panel2).toBeVisible();

    await expect(panel2.locator('[data-testid="initiative-status"]')).toHaveValue('active');
  });
});

test.describe('By Status colour mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('"By Status" button is available in the colour mode selector', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'By Status' })).toBeVisible();
  });

  test('clicking "By Status" activates the mode', async ({ page }) => {
    await page.getByRole('button', { name: 'By Status' }).click();
    // The button should become visually active (highlighted)
    const btn = page.getByRole('button', { name: 'By Status' });
    await expect(btn).toHaveClass(/bg-white|shadow/);
  });

  test('legend shows status entries when "By Status" is active', async ({ page }) => {
    await page.getByRole('button', { name: 'By Status' }).click();

    // Legend must list each status label
    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Planned');
    await expect(legend).toContainText('Active');
    await expect(legend).toContainText('Done');
    await expect(legend).toContainText('Cancelled');
  });

  test('legend reverts to programmes when "By Programme" is re-selected', async ({ page }) => {
    await page.getByRole('button', { name: 'By Status' }).click();
    await page.getByRole('button', { name: 'By Programme' }).click();

    const legend = page.getByTestId('colour-legend');
    await expect(legend).not.toContainText('Planned');
    await expect(legend).toContainText('Programmes:');
  });
});
