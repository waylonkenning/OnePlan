import { test, expect } from '@playwright/test';

/**
 * User Story 20: DTS Alignment Coverage Report
 *
 * AC1: A "DTS Alignment" card appears in Reports when the workspace has DTS assets
 * AC2: The report renders a grid of all 20 DTS assets arranged in their 6 DTS layers
 * AC3: Each asset tile is coloured by its DTS Adoption Status
 * AC4: Each asset tile shows the count of active/planned initiatives and total budget
 * AC5: Clicking an asset tile navigates to the timeline filtered to that asset
 * AC6: The report is included in the PDF/SVG export (export button visible)
 * AC7: The report does not appear for non-DTS workspaces
 * AC8: The report appears alongside the Maturity Heatmap as a separate card
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

async function loadDtsTemplate(page: import('@playwright/test').Page) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  // Dismiss tutorial modal if it appeared
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

test.describe('US-20: DTS Alignment Coverage Report', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: DTS Alignment report card appears in Reports for DTS workspace', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-card-dts-alignment')).toBeVisible({ timeout: 10000 });
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: report renders 20 asset tiles arranged in 6 DTS layers', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible({ timeout: 10000 });

    // All 6 layers visible
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-customer')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-channels')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-dpi')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-integration')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-agency')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-platforms')).toBeVisible();

    // All 20 asset tiles present
    const tiles = page.locator('[data-testid^="dts-alignment-tile-"]');
    await expect(tiles).toHaveCount(20);
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: asset tiles have data-status attribute reflecting their adoption status', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();

    // At least some tiles should have a non-empty status (demo data pre-populates them)
    const tilesWithStatus = page.locator('[data-testid^="dts-alignment-tile-"][data-status]');
    const count = await tilesWithStatus.count();
    expect(count).toBeGreaterThan(0);

    // The adopted tile (dts-ch-02 = 'adopted' in demo data) should have the right data-status
    await expect(page.getByTestId('dts-alignment-tile-dts-ch-02')).toHaveAttribute('data-status', 'adopted');
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: asset tiles show initiative count and budget', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();

    // A DTS asset with demo initiatives should show a non-zero count
    // dts-dpi-01 (Identity) has an initiative in demo data
    const tile = page.getByTestId('dts-alignment-tile-dts-dpi-01');
    await expect(tile.getByTestId('tile-initiative-count')).toBeVisible();
    await expect(tile.getByTestId('tile-budget')).toBeVisible();
  });

  // ── AC5 ──────────────────────────────────────────────────────────────────
  test('AC5: clicking an asset tile navigates to timeline with that asset highlighted', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();

    // Click a tile
    await page.getByTestId('dts-alignment-tile-dts-dpi-01').click();

    // Should navigate to the visualiser
    await expect(page.getByTestId('asset-row-content')).toBeVisible({ timeout: 10000 });
    // Search query should be set to filter/highlight the asset
    const searchInput = page.getByTestId('search-input');
    const searchValue = await searchInput.inputValue();
    expect(searchValue.length).toBeGreaterThan(0);
  });

  // ── AC6 ──────────────────────────────────────────────────────────────────
  test('AC6: DTS Alignment report has an export button', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-export-btn')).toBeVisible();
  });

  // ── AC7 ──────────────────────────────────────────────────────────────────
  test('AC7: DTS Alignment card not shown for non-DTS workspaces', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-card-dts-alignment')).not.toBeVisible();
  });

  // ── AC8 ──────────────────────────────────────────────────────────────────
  test('AC8: DTS Alignment and Maturity Heatmap both appear as separate cards', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-card-dts-alignment')).toBeVisible();
    await expect(page.getByTestId('report-card-maturity-heatmap')).toBeVisible();
  });

});
