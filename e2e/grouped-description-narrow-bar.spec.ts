import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * Regression test for: grouped initiative description hidden when bar is narrow.
 *
 * Before the fix, the description was gated by `width > 8` (the same threshold
 * as individual bars). For groups of densely-clustered initiatives on a long
 * timeline the bar width % can fall below 8, hiding the description entirely
 * even though it is the primary way to see what is inside the group.
 *
 * Fix: changed condition to `isGroup || width > 8` so group descriptions
 * always render when descriptionDisplay is 'on'.
 *
 * Test strategy: import two short (1-month) initiatives with a dependency on
 * the 'a-pam' asset, then switch to 36-month view so the group bar spans
 * only ~2.8% of the timeline — well below the old width > 8 guard.
 */
test.describe('Grouped description on narrow bar', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-narrow-group.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    const initiatives = [
      {
        id: 'i-narrow-grp-1',
        name: 'Narrow Alpha',
        programmeId: 'prog-1',
        assetId: 'a-pam',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        budget: 10000,
      },
      {
        id: 'i-narrow-grp-2',
        name: 'Narrow Beta',
        programmeId: 'prog-1',
        assetId: 'a-pam',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        budget: 10000,
      },
    ];

    const dependencies = [
      {
        id: 'dep-narrow-grp',
        sourceId: 'i-narrow-grp-1',
        targetId: 'i-narrow-grp-2',
        type: 'related',
      },
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initiatives), 'Initiatives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dependencies), 'Dependencies');
    XLSX.writeFile(wb, mockFilePath);
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
  });

  test('group description renders on a narrow bar (width < 8% of timeline)', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Import the short initiatives via the standard Excel import flow
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(mockFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();

    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Enable description display. The default timeline is 36 months from 2026-01-01,
    // so the 2-month group (Sep–Oct 2026) spans only ~5.6% — below the old
    // `width > 8` guard that was blocking the description.
    await page.getByRole('button', { name: 'Display' }).click();
    await page.locator('select#descriptionDisplay').selectOption('on');
    await page.keyboard.press('Escape');

    // Collapse the group on the PAM asset row
    const pamRow = page.locator('[data-asset-id="a-pam"]');
    await expect(pamRow).toBeVisible({ timeout: 10000 });
    await pamRow.hover();

    const groupBox = pamRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 10000 });
    await groupBox.getByTestId('collapse-group-btn').click();

    const groupBar = page.getByTestId('project-group-bar').first();
    await expect(groupBar).toBeVisible({ timeout: 10000 });

    // Description MUST contain both names as bullet points even though the bar
    // is narrower than 8% of the timeline width.
    await expect(groupBar).toContainText('• Narrow Alpha');
    await expect(groupBar).toContainText('• Narrow Beta');
  });
});
