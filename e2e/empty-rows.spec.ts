import { test, expect } from '@playwright/test';

test.describe('Data Entry with Empty Rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should show empty rows and save when typed in', async ({ page }) => {
    // There should be default data (5 rows) plus blank rows
    const allRows = page.locator('table tbody tr');
    const initialCount = await allRows.count();
    expect(initialCount).toBeGreaterThan(5);

    // Find the first blank row (the one after the 5th real row)
    // Blank rows now have no value and no special placeholder
    const blankRow = allRows.nth(5);
    const nameInput = blankRow.locator('input[type="text"]').first();
    
    await nameInput.fill('Automatic Row Entry');
    await nameInput.blur(); // Trigger save

    // Verify it persists by reloading
    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();
    
    // Check if the new entry is present in the table
    const rowWithData = page.locator('table tbody tr').filter({ has: page.locator('input[value="Automatic Row Entry"]') });
    await expect(rowWithData).toBeVisible();
  });
});
