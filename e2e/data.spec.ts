import { test, expect } from '@playwright/test';
import * as path from 'path';

const CONFIRM = '[data-testid="confirm-modal-confirm"]';

async function openDataManager(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  await page.getByTestId('nav-data-manager').click();
  await expect(page.getByTestId('data-manager')).toBeVisible();
}

test.describe('Data Controls (Export/Import)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('Export PDF triggers download', async ({ page }) => {
    test.setTimeout(60000);
    const downloadPromise = page.waitForEvent('download', { timeout: 45000 });

    await page.getByRole('button', { name: 'PDF' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('it-roadmap');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Export Excel triggers download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.getByRole('button', { name: 'Export' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('it-roadmap');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('Import Excel handles file upload', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();

    const fileChooser = await fileChooserPromise;
    expect(fileChooser.isMultiple()).toBe(false);
  });
});

test.describe('Data Manager — core operations', () => {
  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('all tabs are present', async ({ page }) => {
    const tabs = ['Initiatives', 'Assets', 'Programmes', 'Strategies', 'Milestones'];
    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab + '\\s*\\d*') })).toBeVisible();
    }
  });

  test('add and delete a row', async ({ page }) => {
    const realRows = page.locator('table tbody tr[data-real="true"]');
    const initialCount = await realRows.count();

    await page.getByRole('button', { name: 'Add Row' }).click();
    await expect(realRows).toHaveCount(initialCount + 1);

    const lastRealRow = realRows.last();
    await lastRealRow.hover();
    await lastRealRow.getByTitle('Delete row').click({ force: true });
    await page.locator(CONFIRM).click();
    await expect(realRows).toHaveCount(initialCount);
  });

  test('clear all rows leaves only the ghost row', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator(CONFIRM).click();
    await expect(page.locator('table tbody tr[data-real="true"]')).toHaveCount(0);
    await expect(page.locator('table tbody tr')).toHaveCount(1);
  });
});

test.describe('Data Manager — CSV paste', () => {
  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('import new rows from CSV', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator(CONFIRM).click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'name,startDate,endDate,budget\nNew Initiative,2026-01-01,2026-12-31,100000'
    );
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    await expect(page.locator('table tbody tr[data-real="true"]')).toHaveCount(1);
    await expect(
      page.locator('table tbody tr[data-real="true"] input[type="text"]').first()
    ).toHaveValue('New Initiative');
  });

  test('update existing row by id', async ({ page }) => {
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'id,name,assetId,startDate,endDate,budget\ni-ciam-passkey,Updated Init Name,a-ciam,2026-01-01,2026-06-30,350000'
    );
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    await expect(
      page.locator('table tbody tr[data-real="true"] input[value="Updated Init Name"]')
    ).toBeVisible();
  });

  test('multi-word and quoted values parse correctly', async ({ page }) => {
    await page.getByRole('button', { name: 'Assets' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator(CONFIRM).click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'id,name,categoryId\nasset-99,"Very Important, Secure Server",cat-iam'
    );
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    const firstRow = page.locator('table tbody tr[data-real="true"]').first();
    await expect(firstRow.locator('input[type="text"]').first()).toHaveValue(
      'Very Important, Secure Server'
    );
    await expect(firstRow.getByLabel('Category')).toHaveValue('cat-iam');
  });

  test('missing optional columns import without errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'name,startDate,endDate,budget\nMinimal Initiative,2026-03-01,2026-09-30,50000'
    );
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    await expect(
      page.locator('table tbody tr[data-real="true"] input[value="Minimal Initiative"]')
    ).toBeVisible();
  });
});

test.describe('Data Manager — reset buttons', () => {
  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('delete table rows clears only the active tab', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const initCount = await rows.count();
    expect(initCount).toBe(49);

    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator(CONFIRM).click();
    await expect(rows).toHaveCount(1);

    await page.getByRole('button', { name: /Assets \d/ }).click();
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(1);
  });

  test('"Clear data and start again" with blank empties all tables', async ({ page }) => {
    await page.getByTestId('clear-and-start-again-btn').click();
    await expect(page.getByTestId('template-picker-modal')).toBeVisible();
    await page.getByTestId('template-start-blank-btn').click();

    await expect(page.locator('table tbody tr')).toHaveCount(1);

    for (const tab of ['Assets', 'programmes', 'strategies', 'appStatuses']) {
      const locator = tab === 'Assets'
        ? page.getByRole('button', { name: /Assets/ })
        : page.getByTestId(`data-manager-tab-${tab}`);
      await locator.click();
      await expect(page.locator('table tbody tr')).toHaveCount(1);
    }
  });

  test('"Clear data and start again" with GEANZ demo data repopulates', async ({ page }) => {
    await page.getByTestId('clear-and-start-again-btn').click();
    await expect(page.getByTestId('template-picker-modal')).toBeVisible();
    await page.getByTestId('template-select-with-demo-btn-geanz').click();

    const count = await page.locator('table tbody tr').count();
    expect(count).toBe(49);
  });
});

test.describe('Data Manager — tab strip', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  const tabs = [
    'initiatives',
    'dependencies',
    'assets',
    'assetCategories',
    'programmes',
    'strategies',
    'milestones',
    'resources',
  ];

  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('all tabs are visible within the 1024px viewport', async ({ page }) => {
    for (const tabId of tabs) {
      const tab = page.getByTestId(`data-manager-tab-${tabId}`);
      await expect(tab).toBeVisible();
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(1024 + 1);
    }
  });

  test('tab container does not require horizontal scrolling', async ({ page }) => {
    const tabContainer = page.locator('[data-testid="data-manager"] > div').first();
    const scrollWidth = await tabContainer.evaluate(el => el.scrollWidth);
    const clientWidth = await tabContainer.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('all tabs are clickable and activate the correct table', async ({ page }) => {
    for (const tabId of tabs) {
      const tab = page.getByTestId(`data-manager-tab-${tabId}`);
      await tab.click();
      await expect(tab).toHaveCSS('border-bottom-color', 'rgb(59, 130, 246)');
    }
  });
});

test.describe('Data Manager — initiatives column headers', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  const expectedHeaders = [
    'Initiative Name',
    'Asset',
    'Programme',
    'Strategy',
    'Start Date',
    'End Date',
    'CapEx ($)',
    'OpEx ($)',
    'Status',
    'Progress (%)',
    'Owner',
    'Placeholder?',
  ];

  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('all initiative column headers are visible', async ({ page }) => {
    for (const header of expectedHeaders) {
      await expect(page.locator('th').filter({ hasText: header }).first()).toBeVisible();
    }
  });

  test('Progress and Owner headers do not overlap', async ({ page }) => {
    const progressBox = await page.locator('th').filter({ hasText: 'Progress (%)' }).first().boundingBox();
    const ownerBox = await page.locator('th').filter({ hasText: 'Owner' }).first().boundingBox();
    expect(progressBox).not.toBeNull();
    expect(ownerBox).not.toBeNull();
    expect(ownerBox!.x).toBeGreaterThanOrEqual(progressBox!.x + progressBox!.width - 1);
  });
});

test.describe('Data Manager — description column and scroll', () => {
  test.use({ viewport: { width: 1280, height: 768 } });

  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('Description column header is visible', async ({ page }) => {
    await expect(page.locator('th').filter({ hasText: 'Description' }).first()).toBeVisible();
  });

  test('Description cells render a textarea for editing', async ({ page }) => {
    await expect(page.getByTestId('ghost-textarea-description')).toBeVisible();
  });

  test('typing in a description textarea saves the value', async ({ page }) => {
    const descTextarea = page.locator('textarea[aria-label="Description"]').first();
    await expect(descTextarea).toBeVisible();
    await descTextarea.click();
    await descTextarea.fill('Test description for initiative');
    await descTextarea.blur();
    await expect(descTextarea).toHaveValue('Test description for initiative');
  });

  test('initiatives table scrolls horizontally when content overflows', async ({ page }) => {
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await expect(tableWrapper).toBeVisible();
    const scrollWidth = await tableWrapper.evaluate(el => el.scrollWidth);
    const clientWidth = await tableWrapper.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  test('scroll fade indicator is visible when table overflows', async ({ page }) => {
    await expect(page.locator('[data-testid="table-scroll-fade-right"]')).toBeVisible();
  });

  test('scroll fade indicator disappears after scrolling to the right edge', async ({ page }) => {
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await tableWrapper.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await expect(page.locator('[data-testid="table-scroll-fade-right"]')).not.toBeVisible();
  });
});

test.describe('Data Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
  });

  test('prevents saving initiative with end date before start date', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('Start Date').fill('2027-06-01');
    await panel.getByLabel('End Date').fill('2026-01-01');

    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(panel.getByText('End date must be on or after start date')).toBeVisible();

    await expect(panel).toBeVisible();
  });

  test('prevents saving initiative with negative budget', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('CapEx ($)').fill('-5000');

    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(panel.getByText('CapEx cannot be negative')).toBeVisible();

    await expect(panel).toBeVisible();
  });

  test('prevents saving initiative with empty name', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('Initiative Name').fill('');

    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(panel.getByText('Name is required')).toBeVisible();

    await expect(panel).toBeVisible();
  });

  test('prevents saving initiative with negative OpEx', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('OpEx ($)').fill('-1000');

    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(panel.getByText('OpEx cannot be negative')).toBeVisible();

    await expect(panel).toBeVisible();
  });

  test('allows saving initiative with valid data', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('Start Date').fill('2026-01-01');
    await panel.getByLabel('End Date').fill('2026-12-31');
    await panel.getByLabel('CapEx ($)').fill('100000');

    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(panel).not.toBeVisible();
  });
});
