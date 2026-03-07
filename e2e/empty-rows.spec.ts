import { test, expect } from '@playwright/test';

test.describe('Data Entry with Empty Rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should show one blank row and spawn another when typed in', async ({ page }) => {
    // There should be default data (5 rows) plus exactly one blank row initially
    const allRows = page.locator('table tbody tr');
    // Initially 5 real + 1 blank = 6
    await expect(allRows).toHaveCount(6);

    // Find the blank row (index 5)
    const blankRow = allRows.nth(5);
    const nameInput = blankRow.locator('input[type="text"]').first();
    
    await nameInput.fill('Dynamic Row Spawning');
    await nameInput.blur(); // Trigger conversion to real row

    // Now there should be 6 real rows + 1 new blank row = 7 total
    await expect(allRows).toHaveCount(7);
    
    // Verify persistence of the entered row
    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(6);
  });
});
