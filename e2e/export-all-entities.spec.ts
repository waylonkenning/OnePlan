import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * US-04: Fix export to include all entity types
 *
 * AC1: Excel export includes Applications, ApplicationSegments,
 *      ApplicationStatuses, and Resources sheets.
 * AC2: Each sheet contains at least one row of data (from demo data).
 * AC3: After exporting and re-importing via Merge, the Resources count
 *      in the import preview modal reflects the imported sheet.
 */

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

test.describe('US-04: Export includes all entity types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: export workbook contains Applications, ApplicationSegments, ApplicationStatuses, Resources sheets', async ({ page }) => {
    const wb = await downloadExcel(page);
    expect(wb.SheetNames).toContain('Applications');
    expect(wb.SheetNames).toContain('ApplicationSegments');
    expect(wb.SheetNames).toContain('ApplicationStatuses');
    expect(wb.SheetNames).toContain('Resources');
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: Applications and Resources sheets have data rows', async ({ page }) => {
    const wb = await downloadExcel(page);

    const appRows = XLSX.utils.sheet_to_json(wb.Sheets['Applications']);
    expect(appRows.length).toBeGreaterThan(0);

    const resourceRows = XLSX.utils.sheet_to_json(wb.Sheets['Resources']);
    expect(resourceRows.length).toBeGreaterThan(0);
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: import preview modal shows Resources count', async ({ page }) => {
    // Export the current data to a temp file
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-excel').click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('Download path is null');

    // Use file chooser to import the downloaded file
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Import' }).click(),
    ]);
    await fileChooser.setFiles(filePath);

    // Import preview modal should appear
    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Resources count should be visible in the preview
    await expect(modal.getByText(/Resources/)).toBeVisible();

    // Dismiss
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });
});
