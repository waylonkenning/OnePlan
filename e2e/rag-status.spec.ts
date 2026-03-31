import { test, expect, Page } from '@playwright/test';

/**
 * RAG Status feature (US-DS-07):
 * - Initiatives have a ragStatus field (green / amber / red)
 * - A "By Status" colour mode is available in the View Options popover
 * - Bars are coloured by ragStatus when that mode is active
 * - The legend updates to show RAG colour swatches
 * - ragStatus persists across reloads
 */

async function openInitiativePanel(page: Page) {
  await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 20000 });
  const bar = page.locator('[data-testid^="initiative-bar"]').first();
  await bar.click();
  await bar.locator('[data-testid="initiative-edit"]').click();
  await expect(page.getByTestId('initiative-panel')).toBeVisible();
}

async function openViewOptions(page: Page) {
  const popover = page.getByTestId('view-options-popover');
  if (!await popover.isVisible()) {
    await page.getByTestId('view-options-btn').click();
    await expect(popover).toBeVisible();
  }
}

test.describe('RAG Status field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('ragStatus field appears in InitiativePanel', async ({ page }) => {
    await openInitiativePanel(page);
    await expect(page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]')).toBeVisible();
  });

  test('ragStatus field has green / amber / red options', async ({ page }) => {
    await openInitiativePanel(page);
    const field = page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]');
    await expect(field.locator('option[value="green"]')).toBeAttached();
    await expect(field.locator('option[value="amber"]')).toBeAttached();
    await expect(field.locator('option[value="red"]')).toBeAttached();
  });

  test('ragStatus field appears in Data Manager Initiatives table', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();
    await expect(
      page.getByTestId('data-manager').locator('th').filter({ hasText: /RAG/i })
    ).toBeVisible();
  });

  test('setting ragStatus in InitiativePanel persists after reload', async ({ page }) => {
    await openInitiativePanel(page);
    const field = page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]');
    await field.selectOption('red');
    await page.getByTestId('initiative-panel').getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByTestId('initiative-panel')).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await openInitiativePanel(page);
    await expect(
      page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]')
    ).toHaveValue('red');
  });
});

test.describe('By Status colour mode (RAG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('"By Status" button is available in the View Options popover', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByRole('button', { name: 'By Status' })).toBeVisible();
  });

  test('clicking "By Status" activates the mode', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    const btn = page.getByRole('button', { name: 'By Status' });
    await expect(btn).toHaveClass(/bg-rose|bg-red|shadow/);
  });

  test('legend shows Green, Amber, Red entries when "By Status" is active', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Green');
    await expect(legend).toContainText('Amber');
    await expect(legend).toContainText('Red');
  });

  test('legend reverts to programmes when "By Programme" is re-selected', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Programme' }).click();
    const legend = page.getByTestId('colour-legend');
    await expect(legend).not.toContainText('Amber');
    await expect(legend).toContainText('Programmes');
  });

  test('"By Status" mode persists across page reload', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Green');
    await expect(legend).toContainText('Amber');
    await expect(legend).toContainText('Red');
  });
});
