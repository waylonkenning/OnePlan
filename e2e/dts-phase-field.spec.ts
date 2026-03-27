import { test, expect } from '@playwright/test';

/**
 * User Story 21: DTS Phase Field on Initiatives
 *
 * AC1: A "DTS Phase" dropdown is available on each initiative in the initiative
 *      edit panel and in the Data Manager Initiatives tab
 * AC2: The timeline can be grouped by DTS Phase (alongside Asset / Programme / Strategy)
 * AC3: The budget report includes a "By DTS Phase" breakdown
 * AC4: The DTS template demo data pre-populates the correct phase on all 14 initiatives
 * AC5: The field is optional and hidden for non-DTS workspaces
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
  // Dismiss tutorial if it appeared
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

const DTS_PHASES = [
  'Phase 1 — Register & Expose',
  'Phase 2 — Integrate DPI',
  'Phase 3 — AI & Legacy Exit',
  'Back-Office Consolidation',
  'Not DTS',
];

test.describe('US-21: DTS Phase Field on Initiatives', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1a: DTS Phase dropdown is in the initiative edit panel for DTS workspaces', async ({ page }) => {
    await loadDtsTemplate(page);

    // Open the first initiative by double-clicking on the timeline area
    // Or open via Data Manager — navigate to Initiatives and click first row via panel
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Initiatives/ }).click();

    // Click the DTS Phase cell for the first initiative in Data Manager
    await expect(page.getByTestId('dts-phase-cell').first()).toBeVisible({ timeout: 10000 });
  });

  test('AC1b: DTS Phase dropdown in the initiative panel has the five phase options', async ({ page }) => {
    test.setTimeout(60000);
    await loadDtsTemplate(page);

    // Click the first initiative bar to select it, then click its edit button
    const firstBar = page.locator('[data-testid^="initiative-bar-"]').first();
    await expect(firstBar).toBeVisible({ timeout: 15000 });
    await firstBar.click();
    await firstBar.locator('[data-testid="initiative-edit"]').click();
    await expect(page.getByTestId('initiative-panel-dts-phase')).toBeVisible({ timeout: 10000 });

    const options = await page.getByTestId('initiative-panel-dts-phase').locator('option').allTextContents();
    for (const phase of DTS_PHASES) {
      expect(options).toContain(phase);
    }
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: timeline can be grouped by DTS Phase', async ({ page }) => {
    await loadDtsTemplate(page);

    // Open view options and select "DTS Phase" group by
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('group-by-dts-phase')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('group-by-dts-phase').click();
    await page.getByTestId('view-options-btn').click(); // close popover

    // At least one phase swimlane should be visible
    await expect(page.locator('[data-testid^="swimlane-row-dts-phase-"]').first()).toBeVisible({ timeout: 5000 });
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: budget report includes a By DTS Phase breakdown', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('budget-by-dts-phase')).toBeVisible({ timeout: 10000 });
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: DTS demo data pre-populates phases on all 14 initiatives', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Initiatives/ }).click();

    // All 14 DTS initiative phase cells should have a non-empty value
    const phaseCells = page.getByTestId('dts-phase-cell');
    const count = await phaseCells.count();
    expect(count).toBeGreaterThanOrEqual(14);

    const values = await phaseCells.locator('select').evaluateAll(
      (els: HTMLSelectElement[]) => els.map(el => el.value)
    );
    const allHavePhase = values.every(v => v !== '');
    expect(allHavePhase).toBe(true);
  });

  // ── AC5 ──────────────────────────────────────────────────────────────────
  test('AC5: DTS Phase field hidden for non-DTS workspaces', async ({ page }) => {
    // Default E2E state is GEANZ workspace — no DTS assets
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // No DTS Phase group-by option in view options
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('group-by-dts-phase')).not.toBeVisible();
    await page.getByTestId('view-options-btn').click(); // close

    // No DTS Phase column in Data Manager Initiatives tab
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Initiatives/ }).click();
    await expect(page.getByTestId('dts-phase-cell').first()).not.toBeVisible();

    // No DTS Phase breakdown in budget report
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('budget-by-dts-phase')).not.toBeVisible();
  });

});
