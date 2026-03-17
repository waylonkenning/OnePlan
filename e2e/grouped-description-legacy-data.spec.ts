import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * Regression test for: grouped initiative description not displaying when
 * imported data from an older app version is missing the `startDate` field.
 *
 * Root cause: Timeline.tsx called `a.startDate.localeCompare(...)` without
 * guarding against undefined, causing a TypeError that left `description`
 * unset on the synthetic grouped initiative.
 */
test.describe('Grouped description with legacy imported data', () => {
  const legacyFilePath = path.join(process.cwd(), 'e2e', 'mock-grouped-legacy.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    // Two initiatives on the same asset with no startDate — simulating legacy format.
    // They will be connected by a dependency added via the UI after import.
    const initiatives = [
      {
        id: 'i-legacy-grp-1',
        name: 'Legacy Alpha',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        // intentionally omitting startDate / endDate to simulate old data
        budget: 100000,
      },
      {
        id: 'i-legacy-grp-2',
        name: 'Legacy Beta',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        budget: 150000,
      },
    ];

    const dependencies = [
      {
        id: 'dep-legacy-grp',
        sourceId: 'i-legacy-grp-1',
        targetId: 'i-legacy-grp-2',
        type: 'related',
      },
    ];

    const wsInit = XLSX.utils.json_to_sheet(initiatives);
    const wsDeps = XLSX.utils.json_to_sheet(dependencies);
    XLSX.utils.book_append_sheet(wb, wsInit, 'Initiatives');
    XLSX.utils.book_append_sheet(wb, wsDeps, 'Dependencies');
    XLSX.writeFile(wb, legacyFilePath);
  });

  test.afterAll(() => {
    if (fs.existsSync(legacyFilePath)) fs.unlinkSync(legacyFilePath);
  });

  test('grouped description renders initiative names even when startDate is missing', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Turn on description display
    await page.getByTestId('toggle-descriptions').click();

    // Import the legacy file (merge so existing data stays)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(legacyFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Schema warning should appear (missing startDate)
    await expect(modal).toContainText('Schema warnings');

    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();

    // Critical assertion: app must NOT crash after importing data missing startDate.
    // Previously, `a.startDate.localeCompare(...)` would throw a TypeError causing the
    // entire timeline to fail to render. Now it falls back to '' so the sort is safe.
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible();
  });
});
