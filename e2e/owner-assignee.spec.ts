import { test, expect } from '@playwright/test';

/**
 * Owner / Assignee — a text field on each initiative showing who is responsible.
 */
test.describe('Owner / Assignee', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('owner field is visible in InitiativePanel', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await bar.locator('[data-testid="initiative-edit"]').click();
    await expect(page.getByTestId('initiative-owner-select')).toBeVisible();
  });

  test('owner dropdown accepts a selection', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await bar.locator('[data-testid="initiative-edit"]').click();
    const field = page.getByTestId('initiative-owner-select');
    await field.selectOption({ index: 1 });
    await expect(field).toHaveValue(/.+/);
  });

  test('owner field is visible in Data Manager', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await expect(page.locator('[data-col-key="owner"]')).toBeVisible();
  });

  test('owner value persists across reloads', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await bar.locator('[data-testid="initiative-edit"]').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const ownerSelect = page.getByTestId('initiative-owner-select');
    await ownerSelect.selectOption({ index: 1 });
    const selectedValue = await ownerSelect.inputValue();
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    const bar2 = page.locator('[data-testid^="initiative-bar"]').first();
    await bar2.click();
    await bar2.locator('[data-testid="initiative-edit"]').click();
    await expect(page.getByTestId('initiative-owner-select')).toHaveValue(selectedValue);
  });

  test('owner initials are shown on the bar when owner is set', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await bar.locator('[data-testid="initiative-edit"]').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const ownerSelect = page.getByTestId('initiative-owner-select');
    await ownerSelect.selectOption({ index: 1 });
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    // The bar should show owner initials derived from the resource name
    const ownerBadge = page.locator('[data-testid="owner-badge"]').first();
    await expect(ownerBadge).toBeVisible();
    await expect(ownerBadge).toHaveText(/^[A-Z]{1,2}$/);
  });

  test('owner badges appear for initiatives with ownerId set', async ({ page }) => {
    // Demo data has 21 initiatives with ownerId set (all except the placeholder)
    const badges = page.locator('[data-testid="owner-badge"]');
    await expect(badges).toHaveCount(21);
  });
});
