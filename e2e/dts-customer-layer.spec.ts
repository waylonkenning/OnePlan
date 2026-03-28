import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * User Story 24: Customer Layer Canonical Touchpoints
 *
 * AC1: The DTS template includes three Customer Layer reference assets:
 *      Citizens & Residents (DTS.CUST.01), Businesses & Employers (DTS.CUST.02),
 *      Iwi & Community Organisations (DTS.CUST.03)
 * AC2: These assets appear on the timeline under the Customer Layer category header
 * AC3: The DTS Summary Excel tab now contains 23 rows (20 original + 3 customer)
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

test.describe('US-24: Customer Layer Canonical Touchpoints', () => {

  // ── AC1 + AC2 ──────────────────────────────────────────────────────────────
  test('AC1+AC2: three Customer Layer assets appear on the timeline', async ({ page }) => {
    await loadDtsTemplate(page);

    // All three customer assets should be visible as asset rows
    await expect(page.getByText('Citizens & Residents')).toBeVisible();
    await expect(page.getByText('Businesses & Employers')).toBeVisible();
    await expect(page.getByText('Iwi & Community Organisations')).toBeVisible();
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: DTS Summary Excel tab now has 23 rows (20 + 3 customer)', async ({ page }) => {
    await loadDtsTemplate(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-excel').click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('Download path is null');
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: 'buffer' });

    const ws = wb.Sheets['DTS Summary'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    expect(rows).toHaveLength(23);

    // Verify the three customer aliases are present
    const aliases = rows.map(r => r['Alias']);
    expect(aliases).toContain('DTS.CUST.01');
    expect(aliases).toContain('DTS.CUST.02');
    expect(aliases).toContain('DTS.CUST.03');
  });

});
