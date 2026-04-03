import { test, expect } from '@playwright/test';

/**
 * US-DA-13: Configure DTS Phases via Data Manager
 *
 * DTS Phases are no longer hard-coded — they are stored in IndexedDB and
 * managed through a dedicated tab in the Data Manager (visible only for DTS workspaces).
 */

const DEFAULT_DTS_PHASES = [
  { id: 'phase-1',     name: 'Phase 1 — Register & Expose',  color: 'bg-blue-500' },
  { id: 'phase-2',     name: 'Phase 2 — Integrate DPI',       color: 'bg-violet-500' },
  { id: 'phase-3',     name: 'Phase 3 — AI & Legacy Exit',    color: 'bg-emerald-500' },
  { id: 'back-office', name: 'Back-Office Consolidation',      color: 'bg-amber-500' },
  { id: 'not-dts',     name: 'Not DTS',                        color: 'bg-slate-400' },
];

/**
 * Inject a single DTS asset + default dtsPhases directly into IndexedDB so that
 * hasDtsAssets is true without needing to go through the template picker
 * (which is bypassed in E2E mode).
 */
async function injectDtsData(page: import('@playwright/test').Page, phases = DEFAULT_DTS_PHASES) {
  await page.evaluate(async ({ phases }) => {
    const req = indexedDB.open('it-initiative-visualiser');
    await new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const db = req.result;
        const stores = ['assets', 'dtsPhases', 'initiatives'];
        const available = stores.filter(s => db.objectStoreNames.contains(s));
        const tx = db.transaction(available, 'readwrite');

        // Add a single DTS asset so hasDtsAssets = true
        tx.objectStore('assets').put({
          id: 'dts-test-asset-01',
          name: 'Test DTS Asset',
          categoryId: 'cat-dts',
          alias: 'DTS.TEST.01',
        });

        // Add a DTS initiative linked to the asset
        tx.objectStore('initiatives').put({
          id: 'dts-test-init-01',
          name: 'Test DTS Initiative',
          assetId: 'dts-test-asset-01',
          programmeId: '',
          startDate: '2026-01-01',
          endDate: '2026-06-30',
          capex: 0,
          opex: 0,
          dtsPhase: 'phase-1',
        });

        // Seed the default phases
        if (db.objectStoreNames.contains('dtsPhases')) {
          for (const phase of phases) {
            tx.objectStore('dtsPhases').put(phase);
          }
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  }, { phases });
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

test.describe('DTS Phases configurable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await injectDtsData(page);
  });

  test('DTS Phases tab is visible in Data Manager for DTS workspace', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    await expect(page.getByTestId('data-manager-tab-dtsPhases')).toBeVisible();
  });

  test('DTS Phases tab shows default phases pre-loaded', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager-tab-dtsPhases')).toBeVisible();
    await page.getByTestId('data-manager-tab-dtsPhases').click();

    // Verify default phase names appear in input cells (EditableTable renders text as inputs)
    await expect(page.locator('input[value="Phase 1 — Register & Expose"]')).toBeVisible();
    await expect(page.locator('input[value="Phase 2 — Integrate DPI"]')).toBeVisible();
    await expect(page.locator('input[value="Phase 3 — AI & Legacy Exit"]')).toBeVisible();
  });

  test('Initiative panel DTS Phase dropdown shows phases from Data Manager', async ({ page }) => {
    // Open the DTS initiative's edit panel
    const bar = page.locator('[data-testid="initiative-bar-dts-test-init-01"]');
    await expect(bar).toBeVisible();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const dtsSelect = page.getByTestId('initiative-panel-dts-phase');
    await expect(dtsSelect).toBeVisible();

    // The dropdown should contain the configurable phases
    const options = await dtsSelect.locator('option').allTextContents();
    expect(options.some(o => o.includes('Phase 1'))).toBe(true);
    expect(options.some(o => o.includes('Phase 2'))).toBe(true);
    expect(options.some(o => o.includes('Phase 3'))).toBe(true);
  });

  test('a new DTS phase added in Data Manager appears in the initiative dropdown', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-dtsPhases').click();

    // Add a new phase row (testid is `add-row-btn-${tableId}`)
    await page.getByTestId('add-row-btn-dtsPhases').click();

    // Find the new row's name input and fill it
    const nameInput = page.locator('input[aria-label="Phase Name"]').last();
    await nameInput.fill('Custom Test Phase');
    await nameInput.press('Enter');

    // Navigate to visualiser and open the DTS initiative panel
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });

    const bar = page.locator('[data-testid="initiative-bar-dts-test-init-01"]');
    await expect(bar).toBeVisible();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const dtsSelect = page.getByTestId('initiative-panel-dts-phase');
    const options = await dtsSelect.locator('option').allTextContents();
    expect(options.some(o => o.includes('Custom Test Phase'))).toBe(true);
  });

  test('DTS Phases tab is not visible when no DTS assets exist', async ({ page }) => {
    // Remove the DTS asset so hasDtsAssets becomes false
    await page.evaluate(async () => {
      const req = indexedDB.open('it-initiative-visualiser');
      await new Promise<void>((resolve, reject) => {
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(['assets', 'initiatives'], 'readwrite');
          tx.objectStore('assets').delete('dts-test-asset-01');
          tx.objectStore('initiatives').delete('dts-test-init-01');
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      });
    });
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    await expect(page.getByTestId('data-manager-tab-dtsPhases')).not.toBeVisible();
  });
});
