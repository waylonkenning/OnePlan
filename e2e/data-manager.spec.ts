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
    await expect(realRows).toHaveCount(initialCount);
  });

  test('Clear All Rows', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear All' }).click();
    
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(0);
    
    // Total rows should be exactly 1 (the single blank row)
    await expect(page.locator('table tbody tr')).toHaveCount(1);
  });

  test('CSV Paste: Import New', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear All' }).click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    const textarea = page.locator('textarea');
    await textarea.fill(`name,startDate,endDate,budget\nNew Initiative,2026-01-01,2026-12-31,100000`);
    
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled();
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(1);
    await expect(realRows.first().locator('input[type="text"]').first()).toHaveValue('New Initiative');
  });

  test('CSV Paste: Update Existing', async ({ page }) => {
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name\ninit-1,Updated Init Name`);
    
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled();
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    
    const realRows = page.locator('table tbody tr[data-real="true"]');
    const firstRowInput = realRows.first().locator('input[type="text"]').first();
    await expect(firstRowInput).toHaveValue('Updated Init Name');
  });

  test('CSV Paste: Multi-word & Quoted Values', async ({ page }) => {
    await page.getByRole('button', { name: 'Assets' }).click();
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear All' }).click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name,category\nasset-99,"Very Important, Secure Server",Security Services`);
    
    const importBtn = page.getByTestId('import-rows-button');
    await expect(importBtn).toBeEnabled();
    await importBtn.click();

    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();
    
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(1);
    
    const firstRow = realRows.first();
    await expect(firstRow.locator('input[type="text"]').first()).toHaveValue('asset-99');
    await expect(firstRow.locator('input[type="text"]').nth(1)).toHaveValue('Very Important, Secure Server');
    await expect(firstRow.locator('input[type="text"]').nth(2)).toHaveValue('Security Services');
  });
});
