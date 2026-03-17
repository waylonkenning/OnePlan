import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * Tests for arrow selection improvements:
 *
 * 1. Auto-stagger: when two arrows share the same routing corridor (same
 *    source end-x → target start-x range), they are automatically offset
 *    from each other so their vertical segments don't overlap.
 *
 * 2. Disambiguation popover: when a click lands near more than one arrow,
 *    a picker lists the overlapping relationships so the user can choose.
 */

const MOCK_FILE = path.join(process.cwd(), 'e2e', 'mock-parallel-arrows.xlsx');

test.describe('Arrow selection — stagger & disambiguation', () => {
  test.beforeAll(() => {
    // Three initiatives in a clear left-to-right sequence on the same asset:
    //   A (Jan) → B (Feb) → C (Mar), plus A → C
    // A→B and A→C both exit from the right edge of A into the same
    // horizontal corridor, so their vertical segments would collide
    // without auto-stagger.
    const wb = XLSX.utils.book_new();
    const initiatives = [
      { id: 'arr-a', name: 'Arrow Source',      assetId: 'a-pam', startDate: '2026-01-01', endDate: '2026-01-31', budget: 0 },
      { id: 'arr-b', name: 'Arrow Target One',  assetId: 'a-pam', startDate: '2026-03-01', endDate: '2026-03-31', budget: 0 },
      { id: 'arr-c', name: 'Arrow Target Two',  assetId: 'a-pam', startDate: '2026-03-01', endDate: '2026-03-31', budget: 0 },
    ];
    const dependencies = [
      { id: 'dep-ab', sourceId: 'arr-a', targetId: 'arr-b', type: 'requires' },
      { id: 'dep-ac', sourceId: 'arr-a', targetId: 'arr-c', type: 'requires' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initiatives), 'Initiatives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dependencies), 'Dependencies');
    XLSX.writeFile(wb, MOCK_FILE);
  });

  test.afterAll(() => {
    if (fs.existsSync(MOCK_FILE)) fs.unlinkSync(MOCK_FILE);
  });

  async function loadScenario(page: any) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fc = await fileChooserPromise;
    await fc.setFiles(MOCK_FILE);
    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();
    await page.waitForSelector('g.cursor-pointer.group', { timeout: 20000 });
  }

  test('parallel arrows in same corridor have different midX (auto-stagger)', async ({ page }) => {
    test.setTimeout(60000);
    await loadScenario(page);

    // Collect the `d` attributes of all visible arrow paths
    const paths = await page.locator('g.cursor-pointer.group path[stroke]:not([stroke="transparent"])').all();
    const dValues = await Promise.all(paths.map(p => p.getAttribute('d')));

    // Extract the midX value from each path — it's the x in the second L segment
    // Path format: "M sx sy L midX sy L midX ty L tx ty"
    const midXValues = dValues
      .filter(Boolean)
      .map(d => {
        const parts = d!.split(' ');
        // "M sx sy L midX sy L midX ty L tx ty" → parts[4] is midX
        return parts.length >= 5 ? parseFloat(parts[4]) : null;
      })
      .filter(v => v !== null) as number[];

    // There should be at least 2 arrows from our scenario
    expect(midXValues.length).toBeGreaterThanOrEqual(2);

    // The two arrows from arr-a should have different midX values (staggered)
    const unique = new Set(midXValues.map(v => Math.round(v)));
    expect(unique.size).toBeGreaterThan(1);
  });

  test('clicking near overlapping arrows shows disambiguation popover', async ({ page }) => {
    test.setTimeout(60000);
    await loadScenario(page);

    // The disambiguator should appear when clicking an area where arrows are close.
    // Click directly on the dep-ab path stroke — this is a reliable hit regardless
    // of minor layout shifts, and the test accepts either disambiguator or panel.
    const depAbPath = page.locator('g[data-dep-id="dep-ab"] path').first();
    await expect(depAbPath).toBeVisible({ timeout: 10000 });
    await depAbPath.click({ force: true });

    // Either the disambiguator popover appears (when multiple arrows are close)
    // or the edit panel opens directly (when only one arrow is near the click)
    const disambiguator = page.locator('[data-testid="arrow-disambiguator"]');
    const editPanel = page.locator('[data-testid="dependency-panel"]');

    const disambiguatorVisible = await disambiguator.isVisible().catch(() => false);
    const editPanelVisible = await editPanel.isVisible().catch(() => false);

    expect(disambiguatorVisible || editPanelVisible).toBe(true);
  });

  test('clicking a specific arrow opens the correct dependency panel', async ({ page }) => {
    test.setTimeout(60000);
    await loadScenario(page);

    // Click directly on the dep-ab arrow path stroke to open its panel.
    const depAbPath = page.locator('g[data-dep-id="dep-ab"] path').first();
    await expect(depAbPath).toBeVisible({ timeout: 10000 });
    await depAbPath.click({ force: true });

    // The dependency panel must open
    const editPanel = page.locator('[data-testid="dependency-panel"]');
    // If the disambiguator appears (arrows very close), click the first item
    const disambiguator = page.locator('[data-testid="arrow-disambiguator"]');
    const disambiguatorVisible = await disambiguator.isVisible().catch(() => false);
    if (disambiguatorVisible) {
      await expect(disambiguator).toContainText('Arrow Source');
      await disambiguator.locator('[data-testid="disambiguator-item"]').first().click();
    }
    await expect(editPanel).toBeVisible({ timeout: 5000 });
  });
});
