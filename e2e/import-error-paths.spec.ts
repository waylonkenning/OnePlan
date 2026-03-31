import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * User Story: Import Error Path Handling (P0 Safety Net)
 *
 * AC1: Uploading a non-Excel file (e.g. .txt) triggers an inline error notification
 *      rather than crashing or silently failing
 * AC2: Uploading a file containing corrupted / invalid XLSX bytes triggers an
 *      inline error notification rather than crashing or silently failing
 * AC3: No browser alert() dialogs are used for either error — all feedback is inline
 */

test.describe('Import Error Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1+AC3: uploading a plain-text file shows inline error — no browser alert', async ({ page }) => {
    const txtPath = path.join(process.cwd(), 'e2e', 'mock-bad-import.txt');
    fs.writeFileSync(txtPath, 'This is not an Excel file.\nid,name\n1,Test');

    try {
      let alertFired = false;
      page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

      // Use setInputFiles to bypass the browser's accept filter
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(txtPath);

      // Should show an error notification
      await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 5000 });

      // Must not have fired a browser alert
      expect(alertFired).toBe(false);
    } finally {
      if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
    }
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2+AC3: uploading a corrupted XLSX (truncated bytes) shows inline error — no browser alert', async ({ page }) => {
    const corruptPath = path.join(process.cwd(), 'e2e', 'mock-corrupt-import.xlsx');
    // Build a valid workbook, then truncate the bytes so the parser throws
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ id: 1 }]), 'Initiatives');
    const validXlsx = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    fs.writeFileSync(corruptPath, validXlsx.subarray(0, 10)); // truncate to 10 bytes — invalid ZIP/XLSX

    try {
      let alertFired = false;
      page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(corruptPath);

      // Should show an error notification
      await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 5000 });

      // Must not have fired a browser alert
      expect(alertFired).toBe(false);
    } finally {
      if (fs.existsSync(corruptPath)) fs.unlinkSync(corruptPath);
    }
  });
});
