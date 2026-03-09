import { test, expect } from '@playwright/test';

test.describe('Data Entry with Empty Rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should show one blank row and spawn another when typed in', async ({ page }) => {
    // There should be default data (22 rows) plus exactly one blank row initially
    const allRows = page.locator('table tbody tr');
    // Initially 22 real + 1 blank = 23
    await expect(allRows).toHaveCount(23);

    // Find the blank row (index 22)
    const blankRow = allRows.nth(22);
    const nameInput = blankRow.locator('input[type="text"]').first();
    
    await nameInput.fill('Dynamic Row Spawning');
    await nameInput.blur(); // Trigger conversion to real row

    // Now there should be 23 real rows + 1 new blank row = 24 total
    await expect(allRows).toHaveCount(24);
    
    // Verify persistence of the entered row
    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(23);
  });

  test('Should not lose focus when typing in a blank row', async ({ page }) => {
    const nameInput = page.getByTestId('ghost-input-name');

    // Type "server" character by character
    await nameInput.click();
    await page.keyboard.type('server');

    // Verify value is still in the same input and focus wasn't lost
    await expect(nameInput).toHaveValue('server');
    
    // Trigger blur to save (this is when the row actually spawns)
    await nameInput.blur();

    // Give it a tiny moment to process state
    await page.waitForTimeout(100);

    // Verify it became a real row by its value
    await expect(page.locator('input[value="server"]')).toBeVisible();

    // Verify the ghost input is now empty again for next entry
    await expect(nameInput).toHaveValue('');
  });
});
