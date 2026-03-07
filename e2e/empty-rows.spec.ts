import { test, expect } from '@playwright/test';

test.describe('Data Entry with Empty Rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should show empty rows and save when typed in', async ({ page }) => {
    // Initial rows should be 5 (from default data)
    // There should be additional empty rows
    const allRows = page.locator('table tbody tr');
    const initialCount = await allRows.count();
    expect(initialCount).toBeGreaterThan(5);

    // Find the first empty row (row 6, index 5)
    const ghostRow = allRows.nth(5);
    const nameInput = ghostRow.locator('input[type="text"]').first();
    
    await nameInput.fill('Automatic Row Entry');
    await nameInput.blur(); // Trigger save

    // Verify it persists by reloading
    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();
    
    // Now there should be 6 rows with data
    const rowWithData = page.locator('table tbody tr:has(input[value="Automatic Row Entry"])');
    await expect(rowWithData).toBeVisible();
  });
});
