import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

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

test.describe('Import Error Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1+AC3: uploading a plain-text file shows inline error — no browser alert', async ({ page }) => {
    const txtPath = path.join(process.cwd(), 'e2e', 'mock-bad-import.txt');
    fs.writeFileSync(txtPath, 'This is not an Excel file.\nid,name\n1,Test');

    try {
      let alertFired = false;
      page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(txtPath);

      await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 5000 });

      expect(alertFired).toBe(false);
    } finally {
      if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
    }
  });

  test('AC2+AC3: uploading a corrupted XLSX (truncated bytes) shows inline error — no browser alert', async ({ page }) => {
    const corruptPath = path.join(process.cwd(), 'e2e', 'mock-corrupt-import.xlsx');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ id: 1 }]), 'Initiatives');
    const validXlsx = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    fs.writeFileSync(corruptPath, validXlsx.subarray(0, 10));

    try {
      let alertFired = false;
      page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(corruptPath);

      await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 5000 });

      expect(alertFired).toBe(false);
    } finally {
      if (fs.existsSync(corruptPath)) fs.unlinkSync(corruptPath);
    }
  });
});

test.describe('Import/Export inline notifications — no browser alert()', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-import-notify.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { id: 'i-notify-test', name: 'Notify Test', programmeId: 'prog-dtp', strategyId: 'strat-cloud', assetId: 'a-ciam', startDate: '2026-01-01', endDate: '2026-06-30', budget: 100000 }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    fs.writeFileSync(mockFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('merge import shows inline success notification — no browser alert', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', dialog => { alertFired = true; dialog.dismiss(); });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(mockFilePath);
    await page.waitForSelector('.import-preview-modal', { timeout: 5000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();

    expect(alertFired).toBe(false);

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

    const emptyFilePath = path.join(process.cwd(), 'e2e', 'mock-empty-import.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{ foo: 'bar' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'UnknownSheet');
    fs.writeFileSync(emptyFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(emptyFilePath);

    expect(alertFired).toBe(false);
    await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 3000 });

    fs.unlinkSync(emptyFilePath);
  });
});

test.describe('Import Preview & Merge', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-import.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    const mockInitiatives = [
      {
        id: 'i-ciam-sso',
        name: 'SSO Consolidation v2',
        programmeId: 'prog-2',
        strategyId: 'strat-3',
        assetId: 'a-ciam',
        startDate: '2027-01-01',
        endDate: '2027-12-31',
        budget: 900000
      },
      {
        id: 'init-100',
        name: 'Brand New Initiative',
        programmeId: 'prog-1',
        strategyId: 'strat-1',
        assetId: 'a-pam',
        startDate: '2028-01-01',
        endDate: '2028-06-30',
        budget: 50000
      }
    ];

    const initiativesWs = XLSX.utils.json_to_sheet(mockInitiatives);
    XLSX.utils.book_append_sheet(wb, initiativesWs, 'Initiatives');

    fs.writeFileSync(mockFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) {
      fs.unlinkSync(mockFilePath);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Shows preview modal and merges data correctly', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();

    const initialRows = page.locator('tbody tr[data-real="true"]');
    expect(await initialRows.count()).toBeGreaterThan(2);

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(mockFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible();

    await expect(modal).toContainText('2 Initiatives');

    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();

    const searchInput = page.getByPlaceholder('Search initiatives...');
    await searchInput.fill('SSO Consolidation v2');
    await expect(page.locator('tbody tr[data-real="true"]')).toHaveCount(1);

    await searchInput.fill('Brand New Initiative');
    await expect(page.locator('tbody tr[data-real="true"]')).toHaveCount(1);

    await searchInput.fill('Passkey Rollout');
    await expect(page.locator('tbody tr[data-real="true"]')).toHaveCount(1);
  });
});

test.describe('Import Schema Validation', () => {
  const legacyFilePath = path.join(process.cwd(), 'e2e', 'mock-legacy-import.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    const legacyInitiatives = [
      {
        id: 'i-legacy-1',
        name: 'Legacy Initiative Alpha',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        startYear: 2025,
        endYear: 2026,
        budget: 100000,
      },
      {
        id: 'i-legacy-2',
        name: 'Legacy Initiative Beta',
        programmeId: 'prog-2',
        assetId: 'a-ciam',
        startYear: 2026,
        budget: 200000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(legacyInitiatives);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    fs.writeFileSync(legacyFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(legacyFilePath)) {
      fs.unlinkSync(legacyFilePath);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('shows schema warning when imported file is missing required fields', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(legacyFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    await expect(modal).toContainText('2 Initiatives');

    await expect(modal).toContainText('Schema warnings');
    await expect(modal).toContainText('this file may be from an older version');

    await expect(modal).toContainText('initiatives');
    await expect(modal).toContainText('startDate');

    await expect(modal).toContainText('endDate');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();
  });

  test('shows no schema warnings when imported file matches expected schema', async ({ page }) => {
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
    fs.writeFileSync(validFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    try {
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'Import' }).click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(validFilePath);

      const modal = page.locator('.import-preview-modal');
      await expect(modal).toBeVisible({ timeout: 10000 });

      await expect(modal.getByText('Schema warnings')).toBeHidden();

      await page.getByRole('button', { name: 'Cancel' }).click();
    } finally {
      if (fs.existsSync(validFilePath)) fs.unlinkSync(validFilePath);
    }
  });
});

test.describe('Excel Import Data Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1: import with missing required initiative name shows error', async ({ page }) => {
    const invalidFilePath = path.join(process.cwd(), 'e2e', 'mock-missing-name.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{
      id: 'init-no-name',
      name: '',
      programmeId: 'prog-dtp',
      assetId: 'a-ciam',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      capex: 10000,
      opex: 1000
    }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    fs.writeFileSync(invalidFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(invalidFilePath);

      await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 5000 });
      
      const errorText = await page.getByTestId('import-error-notification').textContent();
      expect(errorText).toContain('name');
    } finally {
      if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
    }
  });

  test('AC2: import with invalid date format shows error', async ({ page }) => {
    const invalidFilePath = path.join(process.cwd(), 'e2e', 'mock-invalid-date.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{
      id: 'init-bad-date',
      name: 'Bad Date Initiative',
      programmeId: 'prog-dtp',
      assetId: 'a-ciam',
      startDate: 'not-a-valid-date',
      endDate: '2026-06-30',
      capex: 10000,
      opex: 1000
    }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    fs.writeFileSync(invalidFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(invalidFilePath);

      await expect(page.getByTestId('import-error-notification')).toBeVisible({ timeout: 5000 });
      
      const errorText = await page.getByTestId('import-error-notification').textContent();
      expect(errorText).toMatch(/date|invalid/i);
    } finally {
      if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
    }
  });

  test('AC3+AC4: import with negative capex shows warning and blocks import', async ({ page }) => {
    const invalidFilePath = path.join(process.cwd(), 'e2e', 'mock-negative-capex.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{
      id: 'init-neg-capex',
      name: 'Negative CapEx Initiative',
      programmeId: 'prog-dtp',
      assetId: 'a-ciam',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      capex: -10000,
      opex: 1000
    }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    fs.writeFileSync(invalidFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(invalidFilePath);

      const notification = page.getByTestId('import-error-notification').or(page.getByTestId('import-warning-notification'));
      await expect(notification).toBeVisible({ timeout: 5000 });
    } finally {
      if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
    }
  });

  test('AC5: import with valid data shows success', async ({ page }) => {
    const validFilePath = path.join(process.cwd(), 'e2e', 'mock-valid-import.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{
      id: 'init-valid-test',
      name: 'Valid Test Initiative',
      programmeId: 'prog-dtp',
      assetId: 'a-ciam',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      capex: 10000,
      opex: 1000
    }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Initiatives');
    fs.writeFileSync(validFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(validFilePath);

      await page.waitForSelector('.import-preview-modal', { timeout: 5000 });
      
      await page.getByRole('button', { name: 'Overwrite All Data' }).click();

      await expect(page.getByTestId('import-success-notification')).toBeVisible({ timeout: 5000 });
    } finally {
      if (fs.existsSync(validFilePath)) fs.unlinkSync(validFilePath);
    }
  });
});

test.describe('US-04: Export includes all entity types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1: export workbook contains Applications, ApplicationSegments, ApplicationStatuses, Resources sheets', async ({ page }) => {
    const wb = await downloadExcel(page);
    expect(wb.SheetNames).toContain('Applications');
    expect(wb.SheetNames).toContain('ApplicationSegments');
    expect(wb.SheetNames).toContain('ApplicationStatuses');
    expect(wb.SheetNames).toContain('Resources');
  });

  test('AC2: Applications and Resources sheets have data rows', async ({ page }) => {
    const wb = await downloadExcel(page);

    const appRows = XLSX.utils.sheet_to_json(wb.Sheets['Applications']);
    expect(appRows.length).toBeGreaterThan(0);

    const resourceRows = XLSX.utils.sheet_to_json(wb.Sheets['Resources']);
    expect(resourceRows.length).toBeGreaterThan(0);
  });

  test('AC3: import preview modal shows Resources count', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-excel').click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('Download path is null');

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Import' }).click(),
    ]);
    await fileChooser.setFiles(filePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await expect(modal.getByText(/Resources/)).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });
});

test.describe('JPG Export', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('JPG button triggers a .jpg file download', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.getByTestId('export-jpg').click(),
    ]);

    expect(download.suggestedFilename()).toContain('it-roadmap');
    expect(download.suggestedFilename()).toContain('.jpg');
  });
});

test.describe('PDF Legend', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('PDF export with collapsed legend temporarily expands it then restores collapsed state', async ({ page }) => {
    const toggle = page.locator('[data-testid="legend-toggle"]');
    await expect(toggle).toBeVisible({ timeout: 10000 });

    const isExpanded = await page.locator('[data-testid="legend-content"]').isVisible();
    if (isExpanded) {
      await toggle.click();
      await expect(page.locator('[data-testid="legend-content"]')).toBeHidden();
    }

    await expect(page.locator('[data-testid="legend-content"]')).toBeHidden();

    await page.evaluate(() => {
      (window as any).__legendAppearedDuringExport = false;
      const observer = new MutationObserver(() => {
        if (document.querySelector('[data-testid="legend-content"]')) {
          (window as any).__legendAppearedDuringExport = true;
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      (window as any).__legendObserver = observer;
    });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.locator('button[title="Download roadmap as PDF"]').click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    const legendAppearedDuringExport = await page.evaluate(() => (window as any).__legendAppearedDuringExport);
    expect(legendAppearedDuringExport).toBe(true);

    await expect(page.locator('[data-testid="legend-content"]')).toBeHidden();
  });
});

test.describe('CapEx and OpEx split', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('initiative edit panel has CapEx and OpEx fields instead of Budget', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await expect(panel.getByLabel('CapEx ($)')).toBeVisible();
    await expect(panel.getByLabel('OpEx ($)')).toBeVisible();
    await expect(panel.getByLabel('Budget ($)')).not.toBeVisible();
  });

  test('CapEx and OpEx inputs accept whole numbers without leading zeros', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const capexInput = panel.getByLabel('CapEx ($)');
    await capexInput.fill('500000');
    await expect(capexInput).toHaveValue('500000');

    const opexInput = panel.getByLabel('OpEx ($)');
    await opexInput.fill('100000');
    await expect(opexInput).toHaveValue('100000');
  });

  test('timeline card shows stacked CapEx/OpEx label when budget label mode is on', async ({ page }) => {
    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
      await budgetToggle.click();
    }

    const bar = page.locator('[data-initiative-id="i-ciam-sso"]');
    await expect(bar).toBeVisible();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('CapEx ($)').fill('600000');
    await panel.getByLabel('OpEx ($)').fill('150000');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).not.toBeVisible();

    const capexLabel = bar.getByTestId('capex-label');
    const opexLabel  = bar.getByTestId('opex-label');
    await expect(capexLabel).toBeVisible();
    await expect(opexLabel).toBeVisible();
    await expect(capexLabel).toContainText('CapEx');
    await expect(opexLabel).toContainText('OpEx');

    const capexBox = await capexLabel.boundingBox();
    const opexBox  = await opexLabel.boundingBox();
    expect(opexBox!.y).toBeGreaterThan(capexBox!.y);
  });

  test('data manager shows CapEx and OpEx columns instead of Budget', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    await expect(page.locator('[data-testid^="real-input-capex"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-opex"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-budget"]')).toHaveCount(0);
  });
});
