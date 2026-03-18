import { test, expect } from '@playwright/test';

test.describe('Data Manager Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear DB logic was simplified or removed for stability in previous turns
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Tab Switching displays correct tabs', async ({ page }) => {
    const tabs = ['Initiatives', 'Assets', 'Programmes', 'Strategies', 'Milestones'];
    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: new RegExp(tab + '\\s*\\d*') })).toBeVisible();
    }
  });

  test('Add and Delete Row', async ({ page }) => {
    // Real rows have data-real="true" attribute
    const realRows = page.locator('table tbody tr[data-real="true"]');
    const initialCount = await realRows.count();

    await page.getByRole('button', { name: 'Add Row' }).click();
    await expect(realRows).toHaveCount(initialCount + 1);

    const lastRealRow = realRows.last();
    await lastRealRow.hover(); // Make delete button visible
    const deleteButton = lastRealRow.getByTitle('Delete row');
    await deleteButton.click({ force: true });
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await expect(realRows).toHaveCount(initialCount);
  });

  test('Clear All Rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(0);

    // Total rows should be exactly 1 (the single blank row)
    await expect(page.locator('table tbody tr')).toHaveCount(1);
  });

  test('CSV Paste: Import New', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    // Use the correct column order from DataManager.tsx: name, assetId, programmeId, strategyId, startDate, endDate, budget
    const textarea = page.locator('textarea');
    await textarea.fill(`name,startDate,endDate,budget\nNew Initiative,2026-01-01,2026-12-31,100000`);

    // Give state a moment to sync and button to enable
    await page.waitForTimeout(1000);

    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(1);
    await expect(realRows.first().locator('input[type="text"]').first()).toHaveValue('New Initiative');
  });

  test('CSV Paste: Update Existing', async ({ page }) => {
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    const textarea = page.locator('textarea');
    // i-ciam-passkey exists in default data
    await textarea.fill(`id,name,assetId,startDate,endDate,budget\ni-ciam-passkey,Updated Init Name,a-ciam,2026-01-01,2026-06-30,350000`);

    await page.waitForTimeout(1000);
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

    const realRows = page.locator('table tbody tr[data-real="true"]');
    // After update, we need to find the row that has our new name
    const updatedRowInput = page.locator('table tbody tr[data-real="true"] input[value="Updated Init Name"]');
    await expect(updatedRowInput).toBeVisible();
  });

  test('CSV Paste: Multi-word & Quoted Values', async ({ page }) => {
    await page.getByRole('button', { name: 'Assets' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    // Asset columns: id, name, categoryId
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name,categoryId\nasset-99,"Very Important, Secure Server",cat-iam`);

    await page.waitForTimeout(1000);
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(1);

    const firstRow = realRows.first();
    // ID is now hidden, so the first visible input is the name
    await expect(firstRow.locator('input[type="text"]').first()).toHaveValue('Very Important, Secure Server');
    // Category is now a select
    await expect(firstRow.locator('select')).toHaveValue('cat-iam');
  });

  test('CSV Paste: Missing optional columns import without errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    // Only supply required columns — omit strategyId, description, progress, owner, status
    const textarea = page.locator('textarea');
    await textarea.fill(`name,startDate,endDate,budget\nMinimal Initiative,2026-03-01,2026-09-30,50000`);

    await page.waitForTimeout(1000);
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled({ timeout: 5000 });
    await importBtn.click();

    // No error shown and modal dismissed
    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

    // The new row exists with the correct name
    const newRow = page.locator('table tbody tr[data-real="true"] input[value="Minimal Initiative"]');
    await expect(newRow).toBeVisible();
  });
});
