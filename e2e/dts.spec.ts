import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

const DEFAULT_DTS_PHASES = [
  { id: 'phase-1',     name: 'Phase 1 — Register & Expose',  color: 'bg-blue-500' },
  { id: 'phase-2',     name: 'Phase 2 — Integrate DPI',       color: 'bg-violet-500' },
  { id: 'phase-3',     name: 'Phase 3 — AI & Legacy Exit',    color: 'bg-emerald-500' },
  { id: 'back-office', name: 'Back-Office Consolidation',      color: 'bg-amber-500' },
  { id: 'not-dts',     name: 'Not DTS',                        color: 'bg-slate-400' },
];

const DTS_PHASES = [
  'Phase 1 — Register & Expose',
  'Phase 2 — Integrate DPI',
  'Phase 3 — AI & Legacy Exit',
  'Back-Office Consolidation',
  'Not DTS',
];

async function simulateFirstRun(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
}

async function loadDtsTemplate(page: import('@playwright/test').Page, withDemoData = true) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  if (withDemoData) {
    await page.getByTestId('template-select-with-demo-btn-dts').click();
  } else {
    await page.getByTestId('template-select-no-demo-btn-dts').click();
  }
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function selectTemplate(page: import('@playwright/test').Page, templateId: 'dts') {
  await page.goto('/');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  await page.getByTestId(`template-select-with-demo-btn-${templateId}`).click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

async function selectDtsTemplate(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

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

async function loadDtsWithGeanzCatalogue(page: import('@playwright/test').Page) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('it-initiative-visualiser');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const settings = await new Promise<any>((resolve, reject) => {
      const req = store.get('timelineSettings');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (settings) {
      settings.showGeanzCatalogue = true;
      store.put(settings, 'timelineSettings');
    }
    await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); });
    db.close();
  });
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

async function injectDtsData(page: import('@playwright/test').Page, phases = DEFAULT_DTS_PHASES) {
  await page.evaluate(async ({ phases }) => {
    const req = indexedDB.open('it-initiative-visualiser');
    await new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const db = req.result;
        const stores = ['assets', 'dtsPhases', 'initiatives'];
        const available = stores.filter(s => db.objectStoreNames.contains(s));
        const tx = db.transaction(available, 'readwrite');

        tx.objectStore('assets').put({
          id: 'dts-test-asset-01',
          name: 'Test DTS Asset',
          categoryId: 'cat-dts',
          alias: 'DTS.TEST.01',
        });

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
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

test.describe('DTS Template Demo Data', () => {
  test('AC1: at least 6 initiative bars visible after selecting DTS template', async ({ page }) => {
    await selectTemplate(page, 'dts');
    const bars = page.locator('[data-testid^="initiative-bar"]');
    const count = await bars.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('AC2: initiatives appear across DPI, Channels, and Platforms layers', async ({ page }) => {
    await selectTemplate(page, 'dts');
    await expect(page.getByTestId('category-row-cat-dts-dpi')).toBeVisible();
    await expect(page.getByTestId('category-row-cat-dts-channels')).toBeVisible();
    await expect(page.getByTestId('category-row-cat-dts-platforms')).toBeVisible();
    const dpiCategory = page.locator('[data-testid="category-row-cat-dts-dpi"]');
    await expect(dpiCategory.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    const channelsCategory = page.locator('[data-testid="category-row-cat-dts-channels"]');
    await expect(channelsCategory.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    const platformsCategory = page.locator('[data-testid="category-row-cat-dts-platforms"]');
    await expect(platformsCategory.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
  });

  test('AC3: at least one application lifecycle segment is visible', async ({ page }) => {
    await selectTemplate(page, 'dts');
    await expect(page.locator('[data-testid^="segment-bar-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('AC4: specific named initiatives are visible', async ({ page }) => {
    await selectTemplate(page, 'dts');
    await expect(page.getByText('Service Rules Digitalisation').first()).toBeVisible();
    await expect(page.getByText('Payment Flows Migration to AoG Platform').first()).toBeVisible();
  });
});

test.describe('DTS Label Wrapping and Attribution', () => {
  test('AC1: long DTS asset name is not truncated (no overflow ellipsis)', async ({ page }) => {
    await selectDtsTemplate(page);
    const label = page.locator('[data-testid="asset-swimlane-label"]')
      .filter({ hasText: 'Headless Content Management System' });
    await expect(label).toBeVisible();
    await expect(label).toContainText('Headless Content Management System');
  });

  test.skip('AC2: DTS category headers show Crown copyright attribution', async ({ page }) => {
    await selectDtsTemplate(page);
    const dpiHeader = page.getByTestId('category-drag-handle-cat-dts-dpi');
    await expect(dpiHeader).toContainText('© Crown copyright, CC BY 4.0');
    const platformsHeader = page.getByTestId('category-drag-handle-cat-dts-platforms');
    await expect(platformsHeader).toContainText('© Crown copyright, CC BY 4.0');
  });

  test.skip('AC3: non-DTS category headers do not show DTS attribution', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const iamHeader = page.getByTestId('category-drag-handle-cat-iam');
    await expect(iamHeader).not.toContainText('© Crown copyright, CC BY 4.0');
  });
});

test.describe('US-19: DTS Adoption Status per Asset', () => {

  test('AC1: DTS Adoption Status field is present for each DTS asset in Data Manager', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    await expect(page.getByTestId('dts-adoption-status-cell').first()).toBeVisible({ timeout: 10000 });
  });

  test('AC2: dropdown has the six prescribed status values', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    const firstSelect = page.getByTestId('dts-adoption-status-cell').first().locator('select');
    await expect(firstSelect).toBeVisible();

    const options = await firstSelect.locator('option').allTextContents();
    expect(options).toContain('Not Started');
    expect(options).toContain('Scoping');
    expect(options).toContain('In Delivery');
    expect(options).toContain('Adopted');
    expect(options).toContain('Decommissioning Incumbent');
    expect(options).toContain('Not Applicable');
  });

  test.skip('AC3: enabling the toggle shows adoption status badges on DTS asset row headers', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();

    await page.getByTestId('toggle-dts-adoption-status').click();
    await page.getByTestId('view-options-btn').click();

    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).toBeVisible({ timeout: 5000 });
  });

  test.skip('AC4: toggle is off by default; badges hidden until enabled', async ({ page }) => {
    await loadDtsTemplate(page);

    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).not.toBeVisible();

    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toHaveAttribute('data-active', 'false');

    await page.getByTestId('toggle-dts-adoption-status').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toHaveAttribute('data-active', 'true');

    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).toBeVisible();

    await page.getByTestId('toggle-dts-adoption-status').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toHaveAttribute('data-active', 'false');

    await page.getByTestId('view-options-btn').click();
    await expect(page.locator('[data-testid^="dts-adoption-badge-"]').first()).not.toBeVisible();
  });

  test('AC5: status change persists to IndexedDB across page reload', async ({ page }) => {
    await loadDtsTemplate(page);

    const tutorialModal = page.getByTestId('tutorial-modal');
    if (await tutorialModal.isVisible()) {
      await page.getByRole('button', { name: 'Close' }).first().click();
      await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    await page.getByTestId('nav-data-manager').click();
    await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
    await page.getByRole('button', { name: /Assets/ }).click();

    const assetRow = page.locator('tr[data-id="dts-ch-01"]');
    await expect(assetRow).toBeVisible({ timeout: 5000 });
    const select = assetRow.locator('[data-testid="dts-adoption-status-cell"] select');
    await select.selectOption('adopted');
    await expect(select).toHaveValue('adopted');
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const tutorialModal2 = page.getByTestId('tutorial-modal');
    if (await tutorialModal2.isVisible()) {
      await page.getByRole('button', { name: 'Close' }).first().click();
      await tutorialModal2.waitFor({ state: 'hidden', timeout: 5000 });
    }

    await page.getByTestId('nav-data-manager').click();
    await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
    await page.getByRole('button', { name: /Assets/ }).click();

    const reloadedRow = page.locator('tr[data-id="dts-ch-01"]');
    await expect(reloadedRow).toBeVisible({ timeout: 5000 });
    const reloadedSelect = reloadedRow.locator('[data-testid="dts-adoption-status-cell"] select');
    await expect(reloadedSelect).toHaveValue('adopted');
  });

  test('AC6: DTS template with demo data pre-populates statuses on assets', async ({ page }) => {
    await loadDtsTemplate(page, true);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();

    const selects = page.getByTestId('dts-adoption-status-cell').locator('select');
    const values = await selects.evaluateAll((els: HTMLSelectElement[]) => els.map(el => el.value));
    const hasDefaultStatus = values.some(v => v !== '' && v !== 'not-started');
    expect(hasDefaultStatus).toBe(true);
  });

  test.skip('AC7: non-DTS workspace shows no adoption status field or toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).not.toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Assets/ }).click();
    await expect(page.getByTestId('dts-adoption-status-cell').first()).not.toBeVisible();
  });

  test.skip('AC8: toggle appears in view options only when workspace has DTS assets', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).not.toBeVisible();
    await page.keyboard.press('Escape');

    await loadDtsTemplate(page);
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('toggle-dts-adoption-status')).toBeVisible();
  });
});

test.describe('US-20: DTS Alignment Coverage Report', () => {

  test('AC1: DTS Alignment report card appears in Reports for DTS workspace', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-card-dts-alignment')).toBeVisible({ timeout: 10000 });
  });

  test.skip('AC2: report renders 23 asset tiles arranged in 6 DTS layers', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('dts-alignment-layer-cat-dts-customer')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-channels')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-dpi')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-integration')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-agency')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-layer-cat-dts-platforms')).toBeVisible();

    const tiles = page.locator('[data-testid^="dts-alignment-tile-"]');
    await expect(tiles).toHaveCount(23);
  });

  test('AC3: asset tiles have data-status attribute reflecting their adoption status', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();

    const tilesWithStatus = page.locator('[data-testid^="dts-alignment-tile-"][data-status]');
    const count = await tilesWithStatus.count();
    expect(count).toBeGreaterThan(0);

    await expect(page.getByTestId('dts-alignment-tile-dts-ch-02')).toHaveAttribute('data-status', 'adopted');
  });

  test.skip('AC4: asset tiles show initiative count and budget', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();

    const tile = page.getByTestId('dts-alignment-tile-dts-dpi-01');
    await expect(tile.getByTestId('tile-initiative-count')).toBeVisible();
    await expect(tile.getByTestId('tile-budget')).toBeVisible();
  });

  test.skip('AC5: clicking an asset tile navigates to timeline with that asset highlighted', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();

    await page.getByTestId('dts-alignment-tile-dts-dpi-01').click();

    await expect(page.getByTestId('asset-row-content')).toBeVisible({ timeout: 10000 });
    const searchInput = page.getByTestId('search-input');
    const searchValue = await searchInput.inputValue();
    expect(searchValue.length).toBeGreaterThan(0);
  });

  test.skip('AC6: DTS Alignment report has an export button', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-dts-alignment').click();
    await expect(page.getByTestId('report-view-dts-alignment')).toBeVisible();
    await expect(page.getByTestId('dts-alignment-export-btn')).toBeVisible();
  });

  test.skip('AC7: DTS Alignment card not shown for non-DTS workspaces', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-card-dts-alignment')).not.toBeVisible();
  });

  test.skip('AC8: DTS Alignment and Maturity Heatmap both appear as separate cards', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-card-dts-alignment')).toBeVisible();
    await expect(page.getByTestId('report-card-maturity-heatmap')).toBeVisible();
  });
});

test.describe('US-21: DTS Phase Field on Initiatives', () => {

  test('AC1a: DTS Phase dropdown is in the initiative edit panel for DTS workspaces', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Initiatives/ }).click();

    await expect(page.getByTestId('dts-phase-cell').first()).toBeVisible({ timeout: 10000 });
  });

  test('AC1b: DTS Phase dropdown in the initiative panel has the five phase options', async ({ page }) => {
    test.setTimeout(60000);
    await loadDtsTemplate(page);

    const firstBar = page.locator('[data-testid^="initiative-bar-"]').first();
    await expect(firstBar).toBeVisible({ timeout: 15000 });
    await firstBar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel-dts-phase')).toBeVisible({ timeout: 10000 });

    const options = await page.getByTestId('initiative-panel-dts-phase').locator('option').allTextContents();
    for (const phase of DTS_PHASES) {
      expect(options).toContain(phase);
    }
  });

  test('AC2: timeline can be grouped by DTS Phase', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('group-by-dts-phase')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('group-by-dts-phase').click();
    await page.getByTestId('view-options-btn').click();

    await expect(page.locator('[data-testid^="swimlane-row-dts-phase-"]').first()).toBeVisible({ timeout: 5000 });
  });

  test.skip('AC3: budget report includes a By DTS Phase breakdown', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('budget-by-dts-phase')).toBeVisible({ timeout: 10000 });
  });

  test.skip('AC4: DTS demo data pre-populates phases on all 14 initiatives', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Initiatives/ }).click();

    const phaseCells = page.getByTestId('dts-phase-cell');
    const count = await phaseCells.count();
    expect(count).toBeGreaterThanOrEqual(14);

    const values = await phaseCells.locator('select').evaluateAll(
      (els: HTMLSelectElement[]) => els.map(el => el.value)
    );
    const allHavePhase = values.every(v => v !== '');
    expect(allHavePhase).toBe(true);
  });

  test.skip('AC5: DTS Phase field hidden for non-DTS workspaces', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('group-by-dts-phase')).not.toBeVisible();
    await page.getByTestId('view-options-btn').click();

    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Initiatives/ }).click();
    await expect(page.getByTestId('dts-phase-cell').first()).not.toBeVisible();

    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('budget-by-dts-phase')).not.toBeVisible();
  });
});

test.describe('US-23: DTS Summary Tab in Excel Export', () => {

  test('AC1: DTS workspace export includes a "DTS Summary" sheet', async ({ page }) => {
    await loadDtsTemplate(page);
    const wb = await downloadExcel(page);
    expect(wb.SheetNames).toContain('DTS Summary');
  });

  test.skip('AC2: DTS Summary sheet has 20 rows and the required columns', async ({ page }) => {
    await loadDtsTemplate(page);
    const wb = await downloadExcel(page);
    const ws = wb.Sheets['DTS Summary'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    expect(rows).toHaveLength(23);

    const first = rows[0];
    expect(first).toHaveProperty('Layer');
    expect(first).toHaveProperty('Asset Name');
    expect(first).toHaveProperty('Alias');
    expect(first).toHaveProperty('Adoption Status');
    expect(first).toHaveProperty('Initiative Count');
    expect(first).toHaveProperty('Total CapEx ($)');
  });

  test.skip('AC3: GEANZ workspace export does NOT include a "DTS Summary" sheet', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const wb = await downloadExcel(page);
    expect(wb.SheetNames).not.toContain('DTS Summary');
  });

  test.skip('AC4: assets with demo initiatives show non-zero count and budget', async ({ page }) => {
    await loadDtsTemplate(page);
    const wb = await downloadExcel(page);
    const ws = wb.Sheets['DTS Summary'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    const withInitiatives = rows.filter(r => Number(r['Initiative Count']) > 0);
    expect(withInitiatives.length).toBeGreaterThan(0);

    const withBudget = rows.filter(r => Number(r['Total CapEx ($)']) > 0);
    expect(withBudget.length).toBeGreaterThan(0);
  });
});

test.describe('US-24: Customer Layer Canonical Touchpoints', () => {

  test('AC1+AC2: three Customer Layer assets appear on the timeline', async ({ page }) => {
    await loadDtsTemplate(page);

    await expect(page.getByText('Citizens & Residents')).toBeVisible();
    await expect(page.getByText('Businesses & Employers')).toBeVisible();
    await expect(page.getByText('Iwi & Community Organisations')).toBeVisible();
  });

  test.skip('AC3: DTS Summary Excel tab now has 23 rows (20 + 3 customer)', async ({ page }) => {
    await loadDtsTemplate(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-excel').click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('Download path is null');
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: 'buffer' });

    const ws = wb.Sheets['DTS Summary'];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    expect(rows).toHaveLength(23);

    const aliases = rows.map(r => r['Alias']);
    expect(aliases).toContain('DTS.CUST.01');
    expect(aliases).toContain('DTS.CUST.02');
    expect(aliases).toContain('DTS.CUST.03');
  });
});

test.describe('US-25: DTS Cluster Field in Workspace Settings', () => {

  test('AC1+AC4: cluster text field exists in settings and is blank by default', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('display-more-btn').click();

    const clusterInput = page.getByTestId('cluster-name-input');
    await expect(clusterInput).toBeVisible();
    await expect(clusterInput).toHaveValue('');
  });

  test('AC2: cluster name appears in the timeline header', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('display-more-btn').click();
    await page.getByTestId('cluster-name-input').fill('Digital First Cluster');
    await page.keyboard.press('Escape');

    await expect(page.getByTestId('timeline-cluster-name')).toBeVisible();
    await expect(page.getByTestId('timeline-cluster-name')).toHaveText('Digital First Cluster');
  });

  test.skip('AC3: cluster name appears in DTS Summary Excel tab', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('display-more-btn').click();
    await page.getByTestId('cluster-name-input').fill('Science Cluster');
    await page.keyboard.press('Escape');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-excel').click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('Download path is null');
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: 'buffer' });

    const ws = wb.Sheets['DTS Summary'];
    const sheetText = JSON.stringify(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    expect(sheetText).toContain('Science Cluster');
  });
});

test.describe('US-26: GEANZ-to-DTS Cross-Mapping Tooltips', () => {

  test('AC1+AC2: TAP.07 (Identity & Access Mgmt) shows DTS.DPI.01 badge', async ({ page }) => {
    await loadDtsWithGeanzCatalogue(page);

    const tap07entry = page.getByTestId('geanz-area-entry-TAP.07');
    await tap07entry.scrollIntoViewIfNeeded();

    const badge = tap07entry.getByTestId('geanz-dts-map-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('DTS.DPI.01');
  });

  test.skip('AC4: TAP.08 (Security) has no DTS mapping badge', async ({ page }) => {
    await loadDtsWithGeanzCatalogue(page);

    const tap08entry = page.getByTestId('geanz-area-entry-TAP.08');
    await tap08entry.scrollIntoViewIfNeeded();

    const badge = tap08entry.getByTestId('geanz-dts-map-badge');
    await expect(badge).not.toBeVisible();
  });

  test.skip('AC3: badge is informational — asset count and data are unchanged', async ({ page }) => {
    await loadDtsWithGeanzCatalogue(page);

    const geanzSection = page.getByTestId('geanz-section');
    await expect(geanzSection).toBeVisible();

    await expect(page.getByTestId('asset-row-content').first()).toBeVisible();
  });
});

test.describe('DTS Phases configurable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
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

    await expect(page.locator('input[value="Phase 1 — Register & Expose"]')).toBeVisible();
    await expect(page.locator('input[value="Phase 2 — Integrate DPI"]')).toBeVisible();
    await expect(page.locator('input[value="Phase 3 — AI & Legacy Exit"]')).toBeVisible();
  });

  test('Initiative panel DTS Phase dropdown shows phases from Data Manager', async ({ page }) => {
    const bar = page.locator('[data-testid="initiative-bar-dts-test-init-01"]');
    await expect(bar).toBeVisible();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const dtsSelect = page.getByTestId('initiative-panel-dts-phase');
    await expect(dtsSelect).toBeVisible();

    const options = await dtsSelect.locator('option').allTextContents();
    expect(options.some(o => o.includes('Phase 1'))).toBe(true);
    expect(options.some(o => o.includes('Phase 2'))).toBe(true);
    expect(options.some(o => o.includes('Phase 3'))).toBe(true);
  });

  test('a new DTS phase added in Data Manager appears in the initiative dropdown', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-dtsPhases').click();

    await page.getByTestId('add-row-btn-dtsPhases').click();

    const nameInput = page.locator('input[aria-label="Phase Name"]').last();
    await nameInput.fill('Custom Test Phase');
    await nameInput.press('Enter');

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    await expect(page.getByTestId('data-manager-tab-dtsPhases')).not.toBeVisible();
  });
});

test.describe('DTS Segment Application Labels', () => {
  test('AC1+AC3: specific application names are visible on the timeline', async ({ page }) => {
    await loadDtsTemplate(page);

    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'RealMe+' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Legacy IdP' }).first()).toBeVisible();

    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Notify.govt.nz' }).first()).toBeVisible();

    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Agency Portal' }).first()).toBeVisible();

    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Govt.nz App' }).first()).toBeVisible();
  });

  test.skip('AC1: remaining application names visible on timeline', async ({ page }) => {
    await loadDtsTemplate(page);

    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'AI Platform' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Services Exchange API' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Legacy Payments Engine' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Agency ITSM (Standalone)' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'On-Premise HRIS' }).first()).toBeVisible();
  });

  test.skip('AC2: same-system segments share their label across production and sunset phases', async ({ page }) => {
    await loadDtsTemplate(page);

    const paymentLabels = page.locator('[data-testid="segment-label"]', { hasText: 'Legacy Payments Engine' });
    await expect(paymentLabels.first()).toBeVisible();
    const count = await paymentLabels.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const itsmLabels = page.locator('[data-testid="segment-label"]', { hasText: 'Agency ITSM (Standalone)' });
    await expect(itsmLabels.first()).toBeVisible();
    const itsmCount = await itsmLabels.count();
    expect(itsmCount).toBeGreaterThanOrEqual(2);
  });
});

test.describe('US-30: DTS Application records in Data Manager', () => {
  test.describe.configure({ timeout: 60000 });

  test.skip('DTS Application records are visible in Data Manager', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('nav-data-manager').click();
    await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
    await page.getByTestId('data-manager-tab-applications').click();
    await page.waitForSelector('[data-testid="ghost-select-assetId"]', { timeout: 10000 });

    const rows = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(10);

    const nameValues = await page.locator('[data-testid="data-manager"] tbody input[aria-label="Name"]').evaluateAll(
      (els) => els.map(el => (el as HTMLInputElement).value)
    );
    expect(nameValues).toContain('RealMe+');
    expect(nameValues).toContain('Legacy IdP');
  });
});
