import { test, expect } from '@playwright/test';

test.describe('Table Column Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should sort Initiatives by Name', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: 'Initiative Name' });
    
    // 1. Initial State (assume default order)
    // 2. Click to sort Ascending
    await nameHeader.click();
    
    const firstRowName = page.locator('table tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const lastRowName = page.locator('table tbody tr[data-real="true"]').last().locator('input[type="text"]').first();
    
    // In default data, alphabetically first might be 'Digital Accept' or similar
    const name1 = await firstRowName.inputValue();
    const name2 = await lastRowName.inputValue();
    expect(name1.localeCompare(name2)).toBeLessThanOrEqual(0);

    // 3. Click to sort Descending
    await nameHeader.click();
    const nameDesc1 = await firstRowName.inputValue();
    const nameDesc2 = await lastRowName.inputValue();
    expect(nameDesc1.localeCompare(nameDesc2)).toBeGreaterThanOrEqual(0);
  });

  test('Should sort Initiatives by CapEx', async ({ page }) => {
    const capexHeader = page.getByRole('columnheader', { name: 'CapEx ($)' });

    // Sort Ascending
    await capexHeader.click();

    const realRows = page.locator('table tbody tr[data-real="true"]');
    const firstCapex = await realRows.first().getByTestId('real-input-capex').inputValue();
    const lastCapex = await realRows.last().getByTestId('real-input-capex').inputValue();

    expect(parseFloat(firstCapex) || 0).toBeLessThanOrEqual(parseFloat(lastCapex) || 0);

    // Sort Descending
    await capexHeader.click();
    const firstCapexDesc = await realRows.first().getByTestId('real-input-capex').inputValue();
    const lastCapexDesc = await realRows.last().getByTestId('real-input-capex').inputValue();

    expect(parseFloat(firstCapexDesc) || 0).toBeGreaterThanOrEqual(parseFloat(lastCapexDesc) || 0);
  });

  test('Blank row should always be at the bottom after sorting', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: 'Initiative Name' });
    
    // Sort Descending (which usually puts empty strings at top in standard sort)
    await nameHeader.click();
    await nameHeader.click();

    const lastRow = page.locator('table tbody tr').last();
    // Verify it is still the blank row (no data-real attribute)
    await expect(lastRow).not.toHaveAttribute('data-real', 'true');
    await expect(lastRow.locator('input').first()).toHaveValue('');
  });
});
