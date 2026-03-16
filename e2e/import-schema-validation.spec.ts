import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

test.describe('Import Schema Validation', () => {
  const legacyFilePath = path.join(process.cwd(), 'e2e', 'mock-legacy-import.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    // Simulate old-format initiatives missing startDate/endDate (using legacy startYear field instead)
    const legacyInitiatives = [
      {
        id: 'i-legacy-1',
        name: 'Legacy Initiative Alpha',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        startYear: 2025, // old field — no startDate
        endYear: 2026,   // old field — no endDate
        budget: 100000,
      },
      {
        id: 'i-legacy-2',
        name: 'Legacy Initiative Beta',
        programmeId: 'prog-2',
        assetId: 'a-ciam',
        startYear: 2026,
        budget: 200000,
        // missing endDate and endYear
      },
    ];

    const ws = XLSX.utils.json_to_sheet(legacyInitiatives);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    XLSX.writeFile(wb, legacyFilePath);
  });

  test.afterAll(() => {
    if (fs.existsSync(legacyFilePath)) {
      fs.unlinkSync(legacyFilePath);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('shows schema warning when imported file is missing required fields', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(legacyFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Count summary should still show 2 initiatives
    await expect(modal).toContainText('2 Initiatives');

    // Schema warning section should appear
    await expect(modal).toContainText('Schema warnings');
    await expect(modal).toContainText('this file may be from an older version');

    // Should call out the missing startDate field on initiatives
    await expect(modal).toContainText('initiatives');
    await expect(modal).toContainText('startDate');

    // Should also flag missing endDate
    await expect(modal).toContainText('endDate');

    // Cancel without importing
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();
  });

  test('shows no schema warnings when imported file matches expected schema', async ({ page }) => {
    // Create a valid mock file inline for this test
    const validFilePath = path.join(process.cwd(), 'e2e', 'mock-valid-import.xlsx');
    const wb = XLSX.utils.book_new();
    const validInitiatives = [
      {
        id: 'i-valid-1',
        name: 'Valid Initiative',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        budget: 50000,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(validInitiatives);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    XLSX.writeFile(wb, validFilePath);

    try {
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'Import' }).click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(validFilePath);

      const modal = page.locator('.import-preview-modal');
      await expect(modal).toBeVisible({ timeout: 10000 });

      // No schema warning section should appear
      await expect(modal.getByText('Schema warnings')).toBeHidden();

      await page.getByRole('button', { name: 'Cancel' }).click();
    } finally {
      if (fs.existsSync(validFilePath)) fs.unlinkSync(validFilePath);
    }
  });
});
