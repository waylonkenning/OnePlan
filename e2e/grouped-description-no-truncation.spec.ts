import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * Regression test: grouped initiative descriptions must not be truncated.
 *
 * Before the fix:
 * - The bar height was capped at 3 lines via `Math.min(3, lines)` in the
 *   height calculation.
 * - The description div had `line-clamp-3` applied regardless of whether
 *   the bar was a group or an individual initiative.
 *
 * For a group of 5+ initiatives on a narrow bar (22 chars/line), the joined
 * description ("Alpha Initiative + Beta Initiative + ...") requires 5+ lines.
 * With the old behaviour the last lines were hidden; the bar must now expand
 * to show the full description.
 *
 * Fix: for group bars, `clampedLines = lines` (uncapped) and `line-clamp-3`
 * is not applied so the bar expands to fit all initiative names.
 */
test.describe('Grouped description — no truncation', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-long-group.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    // 5 initiatives with long names on a-pam, placed in Oct–Nov 2026 so they
    // are within the default 36-month timeline and past the sticky left column.
    // Joined description: "Alpha Initiative + Beta Initiative + Gamma Initiative
    //   + Delta Initiative + Epsilon Initiative" = ~93 chars.
    // On a narrow bar (~5.6% width, 22 chars/line) this needs 5 lines —
    // exceeding the old 3-line cap.
    const initiatives = [
      { id: 'i-long-grp-1', name: 'Alpha Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-10-01', endDate: '2026-10-15', budget: 10000 },
      { id: 'i-long-grp-2', name: 'Beta Initiative',  programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-10-16', endDate: '2026-10-31', budget: 10000 },
      { id: 'i-long-grp-3', name: 'Gamma Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-11-01', endDate: '2026-11-15', budget: 10000 },
      { id: 'i-long-grp-4', name: 'Delta Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-11-16', endDate: '2026-11-30', budget: 10000 },
      { id: 'i-long-grp-5', name: 'Epsilon Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-12-01', endDate: '2026-12-15', budget: 10000 },
    ];

    // Chain all 5 together with dependencies so they form one group
    const dependencies = [
      { id: 'dep-long-1', sourceId: 'i-long-grp-1', targetId: 'i-long-grp-2', type: 'related' },
      { id: 'dep-long-2', sourceId: 'i-long-grp-2', targetId: 'i-long-grp-3', type: 'related' },
      { id: 'dep-long-3', sourceId: 'i-long-grp-3', targetId: 'i-long-grp-4', type: 'related' },
      { id: 'dep-long-4', sourceId: 'i-long-grp-4', targetId: 'i-long-grp-5', type: 'related' },
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initiatives), 'Initiatives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dependencies), 'Dependencies');
    fs.writeFileSync(mockFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
  });

  test('group bar expands to show full description without truncation', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Import the 5-initiative group
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(mockFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Enable description display (default 36-month timeline keeps the bar narrow)
    await page.getByTestId('toggle-descriptions').click();

    // Collapse the group on the PAM row
    const pamRow = page.locator('[data-asset-id="a-pam"]');
    await expect(pamRow).toBeVisible({ timeout: 10000 });
    await pamRow.hover();

    const groupBox = pamRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 10000 });
    await groupBox.getByTestId('collapse-group-btn').click();

    const groupBar = page.getByTestId('project-group-bar').first();
    await expect(groupBar).toBeVisible({ timeout: 10000 });

    // All 5 initiative names must appear in the bar's text content
    await expect(groupBar).toContainText('Alpha Initiative');
    await expect(groupBar).toContainText('Epsilon Initiative');

    // The description element must NOT be clipped — scrollHeight must equal
    // clientHeight. With `line-clamp-3` applied, scrollHeight > clientHeight
    // because the CSS max-height cuts off lines 4+.
    const descEl = groupBar.locator('.whitespace-pre-wrap');
    const isClipped = await descEl.evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(isClipped).toBe(false);
  });
});
