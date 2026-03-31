import { test, expect } from '@playwright/test';

/**
 * View Options Popover
 *
 * Colour-by and Group-by controls are consolidated into a single compact
 * "View" popover button rather than two inline button groups in the header.
 * This reduces header clutter, especially on narrow/tablet viewports.
 */
test.describe('View Options Popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('a single "View" button is visible in the header', async ({ page }) => {
    await expect(page.getByTestId('view-options-btn')).toBeVisible();
  });

  test('clicking the button opens a popover with colour and group controls', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    // Both colour-by and group-by options present
    await expect(page.getByTestId('group-by-asset')).toBeVisible();
    await expect(page.getByTestId('group-by-programme')).toBeVisible();
    await expect(page.getByTestId('group-by-strategy')).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Programme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Strategy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Progress' })).toBeVisible();
  });

  test('popover closes when clicking outside', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await page.mouse.click(100, 100);
    await expect(page.getByTestId('view-options-popover')).toBeHidden();
  });

  test('the two old inline colour/group button groups are no longer in the header', async ({ page }) => {
    // Buttons must not be visible without opening the popover
    await expect(page.getByTestId('group-by-asset')).toBeHidden();
    await expect(page.getByRole('button', { name: 'By Programme' })).toBeHidden();
  });

  test('button label reflects current colour and group mode', async ({ page }) => {
    const btn = page.getByTestId('view-options-btn');
    await expect(btn).toContainText(/Programme|Strategy|Progress/);
    await expect(btn).toContainText(/Asset|Programme|Strategy/);
  });
});
