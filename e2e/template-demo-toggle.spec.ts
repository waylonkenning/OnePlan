import { test, expect } from '@playwright/test';

/**
 * User Story 18: Template Selection with Demo Data Toggle
 *
 * AC1: The two old Data Manager reset buttons are replaced with a single "Clear data and start again" button
 * AC2: Clicking "Clear data and start again" opens the template picker with a data-loss warning
 * AC3: Each non-blank template card shows two buttons: "With demo data" and "Without demo data"
 * AC4: The Blank template card shows only a "Start blank" button
 * AC5: "With demo data" loads asset categories, assets, initiatives, milestones, and application segments
 * AC6: "Without demo data" loads only asset categories and assets — no initiatives, milestones, or segments
 * AC7: First-time onboarding flow shows the updated template picker (with/without demo data buttons)
 * AC8: After selecting a template during first run, the tutorial modal is shown
 * AC9: E2E mode is unchanged (auto-loads GEANZ with demo data, suppresses picker)
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

test.describe('US-18: Template Demo Data Toggle', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: old reset buttons removed; "Clear data and start again" button present in Data Manager', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    // Old buttons must be gone
    await expect(page.getByText('Reset - delete all data')).not.toBeVisible();
    await expect(page.getByText('Reset - use demo data')).not.toBeVisible();

    // New button must be present
    await expect(page.getByTestId('clear-and-start-again-btn')).toBeVisible();
    await expect(page.getByTestId('clear-and-start-again-btn')).toContainText('Clear data and start again');
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: "Clear data and start again" opens template picker with data-loss warning', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('clear-and-start-again-btn').click();

    await expect(page.getByTestId('template-picker-modal')).toBeVisible({ timeout: 5000 });
    // Warning copy must make data loss clear
    await expect(page.getByTestId('template-picker-modal')).toContainText(/replace.*data|data.*lost|data.*replaced/i);
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: non-blank template cards show "With demo data" and "Without demo data" buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });

    for (const templateId of ['dts', 'geanz']) {
      await expect(page.getByTestId(`template-select-with-demo-btn-${templateId}`)).toBeVisible();
      await expect(page.getByTestId(`template-select-no-demo-btn-${templateId}`)).toBeVisible();
    }
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: Blank template card shows only "Start blank" — no demo data buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });

    await expect(page.getByTestId('template-start-blank-btn')).toBeVisible();
    await expect(page.getByTestId('template-select-with-demo-btn-blank')).not.toBeVisible();
    await expect(page.getByTestId('template-select-no-demo-btn-blank')).not.toBeVisible();
  });

  // ── AC5 ──────────────────────────────────────────────────────────────────
  test('AC5: DTS "With demo data" loads categories, assets, initiatives, and segments', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await page.getByTestId('template-select-with-demo-btn-dts').click();

    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // DTS category header visible
    await expect(page.getByText('Digital Public Infrastructure')).toBeVisible();

    // At least one initiative bar rendered
    const initiativeBars = page.locator('[data-testid^="initiative-bar"]');
    await expect(initiativeBars.first()).toBeVisible({ timeout: 10000 });

    // At least one application segment rendered
    const segments = page.locator('[data-testid^="segment-"]');
    await expect(segments.first()).toBeVisible({ timeout: 10000 });
  });

  // ── AC6 ──────────────────────────────────────────────────────────────────
  test('AC6: DTS "Without demo data" loads only categories and assets — no initiatives or segments', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await page.getByTestId('template-select-no-demo-btn-dts').click();

    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // DTS category header and asset row should be visible
    await expect(page.getByText('Digital Public Infrastructure')).toBeVisible();
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible();

    // No initiative bars
    await expect(page.locator('[data-testid^="initiative-bar"]')).toHaveCount(0);

    // No application segments
    await expect(page.locator('[data-testid^="segment-"]')).toHaveCount(0);
  });

  // ── AC7 ──────────────────────────────────────────────────────────────────
  test('AC7: first-time onboarding flow shows updated template picker with demo data buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });

    // The updated dual-button structure must appear in the first-run context too
    await expect(page.getByTestId('template-select-with-demo-btn-dts')).toBeVisible();
    await expect(page.getByTestId('template-select-no-demo-btn-dts')).toBeVisible();
    await expect(page.getByTestId('template-start-blank-btn')).toBeVisible();
  });

  // ── AC8 ──────────────────────────────────────────────────────────────────
  test('AC8: selecting a template during first run shows the tutorial modal', async ({ page }) => {
    await page.goto('/');
    // Fresh DB means hasSeenTutorial = false, so tutorial auto-opens after template selection
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await page.getByTestId('template-select-with-demo-btn-dts').click();

    // Tutorial modal must appear (identified by its data-testid added in implementation)
    await expect(page.getByTestId('tutorial-modal')).toBeVisible({ timeout: 10000 });
  });

  // ── AC9 ──────────────────────────────────────────────────────────────────
  test('AC9: E2E mode is unchanged — template picker is suppressed', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();
  });

});
