import { test, expect } from '@playwright/test';

/**
 * User Story 19: DTS Adoption Status per Asset
 *
 * AC1: DTS Adoption Status dropdown is available on each DTS asset row in the Data Manager Assets tab
 * AC2: The dropdown has the six prescribed status values
 * AC3: When the toggle is on, coloured badges appear on DTS asset row headers on the timeline
 * AC4: The toggle is off by default; enabling it shows badges, disabling hides them
 * AC5: The selected status persists to IndexedDB and survives page reload
 * AC6: The DTS template (with demo data) pre-populates default statuses on the 20 assets
 * AC7: Non-DTS assets (GEANZ-only workspace) show no adoption status field or toggle
 * AC8: The toggle only appears in the view options popover when the workspace has DTS assets
 */

async function simulateFirstRun(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
}

async function loadDtsTemplate(page: import('@playwright/test').Page, withDemoData = true) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  if (withDemoData) {
    await page.getByTestId('template-select-with-demo-btn-dts').click();
  } else {
    await page.getByTestId('template-select-no-demo-btn-dts').click();
  }
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  // Dismiss tutorial modal if it appeared (tutorial fires after first template selection)
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

test.describe('US-19: DTS Adoption Status per Asset', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: DTS Adoption Status field is present for each DTS asset in Data Manager', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    // At least one DTS asset row should have the adoption status cell
    await expect(page.getByTestId('dts-adoption-status-cell').first()).toBeVisible({ timeout: 10000 });
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: dropdown has the six prescribed status values', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    const firstSelect = page.getByTestId('dts-adoption-status-cell').first().locator('select');
    await expect(firstSelect).toBeVisible();

    const options = await firstSelect.locator('option').allTextContents();
    expect(options).toContain('Not Started');
    expect(options).toContain('Scoping');
    expect(options).toContain('In Delivery');
    expect(options).toContain('Adopted');
    expect(options).toContain('Decommissioning Incumbent');
    expect(options).toContain('Not Applicable');
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: enabling the toggle shows adoption status badges on DTS asset row headers', async ({ page }) => {
    await loadDtsTemplate(page);

    // Open view options popover
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();

    // Enable the toggle then close the popover
    await page.getByTestId('toggle-dts-adoption-status').click();
    await page.getByTestId('view-options-btn').click();

    // At least one DTS asset row should now show a badge
    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).toBeVisible({ timeout: 5000 });
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: toggle is off by default; badges hidden until enabled', async ({ page }) => {
    await loadDtsTemplate(page);

    // Badges should not be visible before toggle is on
    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).not.toBeVisible();

    // Open popover and confirm toggle is off
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toHaveAttribute('data-active', 'false');

    // Enable it — keep popover open throughout to avoid open/close race conditions
    await page.getByTestId('toggle-dts-adoption-status').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toHaveAttribute('data-active', 'true');

    // Badges now visible (popover is a floating overlay — badges are independently visible)
    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).toBeVisible();

    // Disable it — still in the same open popover
    await page.getByTestId('toggle-dts-adoption-status').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toHaveAttribute('data-active', 'false');

    // Close popover and confirm badges are gone
    await page.getByTestId('view-options-btn').click();
    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).not.toBeVisible();
  });

  // ── AC5 ──────────────────────────────────────────────────────────────────
  test('AC5: status change persists to IndexedDB across page reload', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    // Change the first DTS asset's status to "Adopted"
    const firstSelect = page.getByTestId('dts-adoption-status-cell').first().locator('select');
    await firstSelect.selectOption('adopted');

    // Reload and navigate back to Data Manager
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    // Status should have persisted
    const reloadedSelect = page.getByTestId('dts-adoption-status-cell').first().locator('select');
    await expect(reloadedSelect).toHaveValue('adopted');
  });

  // ── AC6 ──────────────────────────────────────────────────────────────────
  test('AC6: DTS template with demo data pre-populates statuses on assets', async ({ page }) => {
    await loadDtsTemplate(page, true);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    // At least one asset should have a non-empty default status
    const selects = page.getByTestId('dts-adoption-status-cell').locator('select');
    const values = await selects.evaluateAll((els: HTMLSelectElement[]) => els.map(el => el.value));
    const hasDefaultStatus = values.some(v => v !== '' && v !== 'not-started');
    expect(hasDefaultStatus).toBe(true);
  });

  // ── AC7 ──────────────────────────────────────────────────────────────────
  test('AC7: non-DTS workspace shows no adoption status field or toggle', async ({ page }) => {
    // Default E2E mode loads GEANZ template — no DTS alias codes
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // No adoption status toggle in view options
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).not.toBeVisible();
    await page.keyboard.press('Escape');

    // No adoption status cells in Data Manager
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();
    await expect(page.getByTestId('dts-adoption-status-cell').first()).not.toBeVisible();
  });

  // ── AC8 ──────────────────────────────────────────────────────────────────
  test('AC8: toggle appears in view options only when workspace has DTS assets', async ({ page }) => {
    // First confirm it is absent on GEANZ
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).not.toBeVisible();
    await page.keyboard.press('Escape');

    // Now load DTS template and confirm toggle appears
    await loadDtsTemplate(page);
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toBeVisible();
  });

});
