import { test, expect } from '@playwright/test';

/**
 * User Story: Display Mode Picker
 *
 * As a Scenia user I can choose what to show on the timeline — initiatives,
 * applications, or both — so that the view is tailored to my role.
 *
 * Personas:
 *  - Programme Manager: wants initiatives only
 *  - Architect:         wants applications only
 *  - CIO:               wants both (default)
 *
 * Acceptance Criteria:
 *  AC1  The View Options popover contains a "Show" section with three options:
 *       "Both", "Initiatives", "Applications".
 *  AC2  The default is "Both" — initiative bars and application rows are visible.
 *  AC3  Selecting "Initiatives" hides all application lifecycle rows.
 *  AC4  Selecting "Applications" hides all initiative bars.
 *  AC5  Re-selecting "Both" restores both.
 *  AC6  The view-options button label reflects the active display mode.
 */
test.describe('Display Mode Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC1 – Show section exists in the View Options popover', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await expect(page.getByTestId('show-both')).toBeVisible();
    await expect(page.getByTestId('show-initiatives')).toBeVisible();
    await expect(page.getByTestId('show-applications')).toBeVisible();
  });

  test('AC2 – default mode is Both: initiative bars and application rows are visible', async ({ page }) => {
    await expect(page.locator('[data-testid="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-row-"]').first()).toBeVisible();
  });

  test('AC3 – Initiatives mode hides application lifecycle rows', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await page.mouse.click(100, 100); // close popover

    await expect(page.locator('[data-testid="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-row-"]')).toHaveCount(0);
  });

  test('AC4 – Applications mode hides initiative bars', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100); // close popover

    await expect(page.locator('[data-testid="initiative-bar"]')).toHaveCount(0);
    await expect(page.locator('[data-testid^="application-row-"]').first()).toBeVisible();
  });

  test('AC5 – switching back to Both restores both layers', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    // Popover remains open — click Both directly
    await page.getByTestId('show-both').click();
    await page.mouse.click(100, 100); // close popover

    await expect(page.locator('[data-testid="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-row-"]').first()).toBeVisible();
  });

  test('AC6 – button label reflects active display mode', async ({ page }) => {
    const btn = page.getByTestId('view-options-btn');

    // Open once — popover stays open while cycling through options
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await expect(btn).toContainText('Initiatives');

    await page.getByTestId('show-applications').click();
    await expect(btn).toContainText('Applications');

    await page.getByTestId('show-both').click();
    await expect(btn).toContainText('Both');
  });
});
