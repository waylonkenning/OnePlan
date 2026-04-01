import { test, expect } from '@playwright/test';

const CONFIRM = '[data-testid="confirm-modal-confirm"]';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openDataManager(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  await page.getByTestId('nav-data-manager').click();
  await expect(page.getByTestId('data-manager')).toBeVisible();
}

// ─── Core CRUD ────────────────────────────────────────────────────────────────

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

// ─── CSV Paste ────────────────────────────────────────────────────────────────

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

// ─── Reset buttons ────────────────────────────────────────────────────────────

test.describe('Data Manager — reset buttons', () => {
  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('delete table rows clears only the active tab', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const initCount = await rows.count();
    expect(initCount).toBe(49); // 22 original + 26 GEANZ + 1 ghost

    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator(CONFIRM).click();
    await expect(rows).toHaveCount(1); // only ghost row

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
    expect(count).toBe(49); // 22 original + 26 GEANZ + 1 ghost
  });
});
