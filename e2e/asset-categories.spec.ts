import { test, expect } from '@playwright/test';

test.describe('Asset Category Normalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should allow creating and using an Asset Category', async ({ page }) => {
    // 1. Check if Categories tab exists
    const categoriesTab = page.getByRole('button', { name: /Categories\s*\d*/ });
    await expect(categoriesTab).toBeVisible();
    await categoriesTab.click();

    // 2. Add a new category
    // Blank row is at the bottom
    const allRows = page.locator('table tbody tr');
    const blankRow = allRows.last();
    const nameInput = blankRow.locator('input[type="text"]').first();
    
    await nameInput.fill('New Test Category');
    await nameInput.blur();

    // 3. Switch to Assets tab and verify the new category is in the dropdown
    await page.getByRole('button', { name: /Assets\s*\d*/ }).click();
    
    const assetBlankRow = page.locator('table tbody tr').last();
    const categoryDropdown = assetBlankRow.locator('select');
    
    // Check if our new category exists in the dropdown options
    await expect(categoryDropdown.locator('option:has-text("New Test Category")')).toBeAttached();
  });
});
