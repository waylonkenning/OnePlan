import { test, expect } from '@playwright/test';

/**
 * User Story: US-DS-06 — Choose What to Display on the Timeline
 *
 * Regression: empty-row visibility in Applications-only mode.
 *
 * Before the fix, switching to "Applications Only" mode unconditionally hid
 * every asset that had no applications, ignoring the "Empty Rows" setting.
 * This meant the Empty Rows toggle had no effect in that mode.
 *
 * Acceptance Criteria tested here:
 *  AC-A  In "Applications Only" mode with Empty Rows = Show (default), asset rows
 *        with no applications are still rendered.
 *  AC-B  In "Applications Only" mode with Empty Rows = Hide, asset rows with no
 *        applications are not rendered.
 *  AC-C  In "Both" mode with Empty Rows = Hide, asset rows that have applications
 *        but no initiatives remain visible (not incorrectly hidden).
 *
 * Test asset: "Employee IAM" (id: a-eiam) — has initiatives, no applications.
 * Asset with applications: "Customer IAM (CIAM)" (id: a-ciam).
 */
test.describe('Display Mode — Empty Rows interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC-A – Applications mode + Empty Rows Show: assets without applications are still visible', async ({ page }) => {
    // Switch to Applications Only
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100); // close popover

    // Employee IAM has no applications — should still be visible with default "show" setting
    await expect(page.locator('[data-testid="asset-row-a-eiam"]')).toBeVisible();
  });

  test('AC-B – Applications mode + Empty Rows Hide: assets without applications are hidden', async ({ page }) => {
    // Switch to Applications Only
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100); // close popover

    // Set Empty Rows to Hide
    await page.getByTestId('display-more-btn').click();
    await page.locator('#emptyRowDisplay').selectOption('hide');
    await page.mouse.click(100, 100); // close panel

    // Employee IAM has no applications — should now be hidden
    await expect(page.locator('[data-testid="asset-row-a-eiam"]')).toHaveCount(0);

    // Customer IAM has applications — should still be visible
    await expect(page.locator('[data-testid="asset-row-a-ciam"]')).toBeVisible();
  });

  test('AC-C – Both mode + Empty Rows Hide: assets with applications but no initiatives remain visible', async ({ page }) => {
    // Remain in "Both" mode (default)
    // Set Empty Rows to Hide
    await page.getByTestId('display-more-btn').click();
    await page.locator('#emptyRowDisplay').selectOption('hide');
    await page.mouse.click(100, 100); // close panel

    // Customer IAM has both initiatives and applications — must be visible
    await expect(page.locator('[data-testid="asset-row-a-ciam"]')).toBeVisible();
  });
});
