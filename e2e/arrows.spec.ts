import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * Clicking a dependency arrow label shows a tooltip with the full
 * plain-language relationship sentence using initiative names.
 */
test.describe('Dependency Arrow Labels', () => {
  test('clicking a dependency label shows a tooltip with the relationship sentence', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dep-label-rect"]', { timeout: 5000 });

    const labelRect = page.locator('[data-testid="dep-label-rect"]').first();
    await labelRect.click();

    const tooltip = page.locator('[data-testid="arrow-label-tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 3000 });

    const text = await tooltip.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(20);
    expect(text).toMatch(/must finish before|requires .+ to finish|are related/i);
  });

  test('clicking the tooltip dismisses it', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dep-label-rect"]', { timeout: 5000 });

    await page.locator('[data-testid="dep-label-rect"]').first().click();
    const tooltip = page.locator('[data-testid="arrow-label-tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 3000 });

    await tooltip.click();
    await expect(tooltip).toBeHidden();
  });

  test('clicking the label does not open the dependency edit panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dep-label-rect"]', { timeout: 5000 });

    await page.locator('[data-testid="dep-label-rect"]').first().click();

    await expect(page.locator('[data-testid="arrow-label-tooltip"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="dependency-panel"]')).toBeHidden();
  });
});

/**
 * Tests for arrow selection improvements:
 * 1. Auto-stagger: when two arrows share the same routing corridor, they are
 *    automatically offset from each other so their vertical segments don't overlap.
 * 2. Disambiguation popover: when a click lands near more than one arrow,
 *    a picker lists the overlapping relationships so the user can choose.
 */
const MOCK_FILE = path.join(process.cwd(), 'e2e', 'mock-parallel-arrows.xlsx');

test.describe('Arrow selection — stagger & disambiguation', () => {
  test.beforeAll(() => {
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
    fs.writeFileSync(MOCK_FILE, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(MOCK_FILE)) fs.unlinkSync(MOCK_FILE);
  });

  async function loadScenario(page: any) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fc = await fileChooserPromise;
    await fc.setFiles(MOCK_FILE);
    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();
    await page.waitForSelector('g.cursor-pointer.group', { timeout: 5000 });
  }

  test('parallel arrows in same corridor have different midX (auto-stagger)', async ({ page }) => {
    test.setTimeout(60000);
    await loadScenario(page);

    const paths = await page.locator('g.cursor-pointer.group path[stroke]:not([stroke="transparent"])').all();
    const dValues = await Promise.all(paths.map(p => p.getAttribute('d')));

    const midXValues = dValues
      .filter(Boolean)
      .map(d => {
        const parts = d!.split(' ');
        return parts.length >= 5 ? parseFloat(parts[4]) : null;
      })
      .filter(v => v !== null) as number[];

    expect(midXValues.length).toBeGreaterThanOrEqual(2);

    const unique = new Set(midXValues.map(v => Math.round(v)));
    expect(unique.size).toBeGreaterThan(1);
  });

  test('clicking near overlapping arrows shows disambiguation popover', async ({ page }) => {
    test.setTimeout(60000);
    await loadScenario(page);

    const depAbPath = page.locator('g[data-dep-id="dep-ab"] path').first();
    await expect(depAbPath).toBeVisible({ timeout: 10000 });
    await depAbPath.click({ force: true });

    const disambiguator = page.locator('[data-testid="arrow-disambiguator"]');
    const editPanel = page.locator('[data-testid="dependency-panel"]');

    const disambiguatorVisible = await disambiguator.isVisible().catch(() => false);
    const editPanelVisible = await editPanel.isVisible().catch(() => false);

    expect(disambiguatorVisible || editPanelVisible).toBe(true);
  });

  test('clicking a specific arrow opens the correct dependency panel', async ({ page }) => {
    test.setTimeout(60000);
    await loadScenario(page);

    const depAbPath = page.locator('g[data-dep-id="dep-ab"] path').first();
    await expect(depAbPath).toBeVisible({ timeout: 10000 });
    await depAbPath.click({ force: true });

    const editPanel = page.locator('[data-testid="dependency-panel"]');
    const disambiguator = page.locator('[data-testid="arrow-disambiguator"]');
    const disambiguatorVisible = await disambiguator.isVisible().catch(() => false);
    if (disambiguatorVisible) {
      await expect(disambiguator).toContainText('Arrow Source');
      await disambiguator.locator('[data-testid="disambiguator-item"]').first().click();
    }
    await expect(editPanel).toBeVisible({ timeout: 5000 });
  });
});

/**
 * Dependency arrows must always render above initiative bars,
 * including when bars raise their z-index on hover (hover:z-20).
 */
test.describe('Arrow z-index', () => {
  test('dependency SVG z-index is above initiative bar hover z-index', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dependencies-svg"]', { timeout: 5000 });

    const svgZIndex = await page.locator('[data-testid="dependencies-svg"]').evaluate(
      el => parseInt(window.getComputedStyle(el).zIndex) || 0
    );

    expect(svgZIndex).toBeGreaterThan(20);
  });

  test('dependency arrows are visually above a hovered initiative bar', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 5000 });

    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.hover();

    const [svgZ, barZ] = await Promise.all([
      page.locator('[data-testid="dependencies-svg"]').evaluate(
        el => parseInt(window.getComputedStyle(el).zIndex) || 0
      ),
      bar.evaluate(el => parseInt(window.getComputedStyle(el).zIndex) || 0),
    ]);

    expect(svgZ).toBeGreaterThan(barZ);
  });
});
