import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * Regression tests: import/export feedback must use inline notifications,
 * not browser alert() dialogs. alert() blocks interaction and is inconsistent
 * with the rest of the UI which uses in-app modals and error states.
 */
test.describe('Import/Export inline notifications — no browser alert()', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-import-notify.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { id: 'i-notify-test', name: 'Notify Test', programmeId: 'prog-dtp', strategyId: 'strat-cloud', assetId: 'a-ciam', startDate: '2026-01-01', endDate: '2026-06-30', budget: 100000 }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    XLSX.writeFile(wb, mockFilePath);
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('merge import shows inline success notification — no browser alert', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(mockFilePath);
    await page.waitForSelector('.import-preview-modal', { timeout: 5000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();

    // Must not have fired a browser alert
    expect(alertFired).toBe(false);

    // Must show an inline success notification
    await expect(page.getByTestId('import-success-notification')).toBeVisible({ timeout: 3000 });
  });

  test('overwrite import shows inline success notification — no browser alert', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(mockFilePath);
    await page.waitForSelector('.import-preview-modal', { timeout: 5000 });
    await page.getByRole('button', { name: 'Overwrite All Data' }).click();

    expect(alertFired).toBe(false);
    await expect(page.getByTestId('import-success-notification')).toBeVisible({ timeout: 3000 });
  });

  test('import with no valid data shows inline error notification — no browser alert', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

    // Create an XLSX with an unrecognised sheet name — triggers "no valid data" error path
    const emptyFilePath = path.join(process.cwd(), 'e2e', 'mock-empty-import.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{ foo: 'bar' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'UnknownSheet');
    XLSX.writeFile(wb, emptyFilePath);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(emptyFilePath);

    expect(alertFired).toBe(false);
    await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 3000 });

    fs.unlinkSync(emptyFilePath);
  });
});
