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
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await expect(page.getByTestId('initiative-owner')).toBeVisible();
  });

  test('owner field accepts a text value', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const field = page.getByTestId('initiative-owner');
    await field.fill('Jane Smith');
    await expect(field).toHaveValue('Jane Smith');
  });

  test('owner field is visible in Data Manager', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await expect(page.locator('[data-col-key="owner"]')).toBeVisible();
  });

  test('owner value persists across reloads', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await page.getByTestId('initiative-owner').fill('Alex Johnson');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await expect(page.getByTestId('initiative-owner')).toHaveValue('Alex Johnson');
  });

  test('owner initials are shown on the bar when owner is set', async ({ page }) => {
    await page.locator('[data-testid="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await page.getByTestId('initiative-owner').fill('Sam Taylor');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    // The bar should show owner initials
    const ownerBadge = page.locator('[data-testid="owner-badge"]').first();
    await expect(ownerBadge).toBeVisible();
    await expect(ownerBadge).toContainText('ST');
  });

  test('no owner badge shown when owner is not set', async ({ page }) => {
    // Default data has no owners set
    const badges = page.locator('[data-testid="owner-badge"]');
    await expect(badges).toHaveCount(0);
  });
});
