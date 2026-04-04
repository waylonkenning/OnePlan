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

/**
 * The Display popover is replaced by inline icon toggles in the header.
 * Each toggle represents one display setting.
 */
test.describe('Display Mode Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1 – Show section exists in the View Options popover', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await expect(page.getByTestId('show-both')).toBeVisible();
    await expect(page.getByTestId('show-initiatives')).toBeVisible();
    await expect(page.getByTestId('show-applications')).toBeVisible();
  });

  test('AC2 – default mode is Both: initiative bars and application rows are visible', async ({ page }) => {
    await expect(page.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
  });

  test('AC3 – Initiatives mode hides application lifecycle rows', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await page.mouse.click(100, 100); // close popover

    await expect(page.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]')).toHaveCount(0);
  });

  test('AC4 – Applications mode hides initiative bars', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100); // close popover

    await expect(page.locator('[data-testid^="initiative-bar"]')).toHaveCount(0);
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
  });

  test('AC5 – switching back to Both restores both layers', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    // Popover remains open — click Both directly
    await page.getByTestId('show-both').click();
    await page.mouse.click(100, 100); // close popover

    await expect(page.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
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

test.describe('Display Mode — Empty Rows interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
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

test.describe('Inline display toggles', () => {
  test('four toggle buttons are present in the header', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.getByTestId('toggle-conflicts')).toBeVisible();
    await expect(page.getByTestId('toggle-relationships')).toBeVisible();
    await expect(page.getByTestId('toggle-descriptions')).toBeVisible();
    await expect(page.getByTestId('toggle-budget')).toBeVisible();
  });

  test('toggle-conflicts turns conflict detection off and on', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const toggle = page.getByTestId('toggle-relationships');
    await expect(toggle).toHaveAttribute('data-active', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'true');
  });

  test('toggle-descriptions turns descriptions off and on', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const toggle = page.getByTestId('toggle-descriptions');
    await expect(toggle).toHaveAttribute('data-active', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('data-active', 'true');
  });

  test('toggle-budget cycles through off → label → bar-height → off', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.getByRole('button', { name: 'Display' })).not.toBeVisible();
  });
});
