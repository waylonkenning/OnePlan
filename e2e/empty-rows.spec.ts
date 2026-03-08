import { test, expect } from '@playwright/test';

test.describe('Data Entry with Empty Rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should show one blank row and spawn another when typed in', async ({ page }) => {
    // There should be default data (24 rows) plus exactly one blank row initially
    const allRows = page.locator('table tbody tr');
    // Initially 24 real + 1 blank = 25
    await expect(allRows).toHaveCount(25);

    // Find the blank row (index 24)
    const blankRow = allRows.nth(24);
    const nameInput = blankRow.locator('input[type="text"]').first();
    
    await nameInput.fill('Dynamic Row Spawning');
    await nameInput.blur(); // Trigger conversion to real row

    // Now there should be 25 real rows + 1 new blank row = 26 total
    await expect(allRows).toHaveCount(26);
    
    // Verify persistence of the entered row
    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(25);
  });
});
