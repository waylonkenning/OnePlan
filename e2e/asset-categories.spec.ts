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

  test('Category labels should remain sticky when scrolling horizontally', async ({ page }) => {
    // 1. Go to Visualiser
    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');

    // Make sure we have enough timeline width to scroll
    await page.getByLabel('Months').selectOption('36');

    const categoryLabel = page.getByText('Identity & Access Management').first();
    await expect(categoryLabel).toBeVisible();

    // The sticky container has class 'sticky left-0 w-64'
    // We scroll the timeline container horizontally
    const scrollContainer = page.locator('.flex-1.overflow-auto.scroll-smooth').first();
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollBy({ left: 1000, behavior: 'instant' });
    });

    // After scrolling right, the label must still be visible in the viewport
    await expect(categoryLabel).toBeInViewport();
  });
});
