import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * User Story 23: DTS Summary Tab in Excel Export
 *
 * AC1: Exporting from a DTS workspace produces an Excel file that includes
 *      a "DTS Summary" sheet alongside the existing sheets
 * AC2: The DTS Summary sheet has one row per DTS asset (20 rows for demo data)
 *      with columns: Layer, Asset Name, Alias, Adoption Status,
 *      Initiative Count, Total CapEx ($)
 * AC3: The DTS Summary sheet does NOT appear when exporting from a non-DTS
 *      (GEANZ) workspace
 * AC4: Assets that have demo initiatives show a non-zero Initiative Count
 *      and non-zero Total Budget in the DTS Summary sheet
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
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function downloadExcel(page: import('@playwright/test').Page): Promise<XLSX.WorkBook> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-excel').click(),
  ]);
  const filePath = await download.path();
  if (!filePath) throw new Error('Download path is null');
  const buffer = fs.readFileSync(filePath);
  return XLSX.read(buffer, { type: 'buffer' });
}

test.describe('US-23: DTS Summary Tab in Excel Export', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: DTS workspace export includes a "DTS Summary" sheet', async ({ page }) => {
    await loadDtsTemplate(page);
    const wb = await downloadExcel(page);
    expect(wb.SheetNames).toContain('DTS Summary');
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: DTS Summary sheet has 20 rows and the required columns', async ({ page }) => {
    await loadDtsTemplate(page);
    const wb = await downloadExcel(page);
    const ws = wb.Sheets['DTS Summary'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    // 23 DTS assets (20 original + 3 Customer Layer assets added in US-24)
    expect(rows).toHaveLength(23);

    // Check required columns exist on at least the first row
    const first = rows[0];
    expect(first).toHaveProperty('Layer');
    expect(first).toHaveProperty('Asset Name');
    expect(first).toHaveProperty('Alias');
    expect(first).toHaveProperty('Adoption Status');
    expect(first).toHaveProperty('Initiative Count');
    expect(first).toHaveProperty('Total CapEx ($)');
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: GEANZ workspace export does NOT include a "DTS Summary" sheet', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    const wb = await downloadExcel(page);
    expect(wb.SheetNames).not.toContain('DTS Summary');
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: assets with demo initiatives show non-zero count and budget', async ({ page }) => {
    await loadDtsTemplate(page);
    const wb = await downloadExcel(page);
    const ws = wb.Sheets['DTS Summary'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    // At least one asset should have Initiative Count > 0
    const withInitiatives = rows.filter(r => Number(r['Initiative Count']) > 0);
    expect(withInitiatives.length).toBeGreaterThan(0);

    // At least one asset should have Total Budget > 0
    const withBudget = rows.filter(r => Number(r['Total CapEx ($)']) > 0);
    expect(withBudget.length).toBeGreaterThan(0);
  });

});
