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

test.describe('Asset Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Assets should swap positions when dragged', async ({ page }) => {
    // We'll target the "Identity & Access Management" category
    // Let's verify the initial order in the sidebar
    const sidebarAssetNames = page.locator('.sticky.left-0.flex-shrink-0 .font-semibold');
    
    // First 2 should be Customer IAM (CIAM) and Employee IAM
    await expect(sidebarAssetNames.nth(0)).toHaveText('Customer IAM (CIAM)');
    await expect(sidebarAssetNames.nth(1)).toHaveText('Employee IAM');

    // Find the draggable containers in the sidebar - Use simplified locators
    const ciamHandle = page.locator('.sticky.left-0.flex-shrink-0').filter({ hasText: 'Customer IAM (CIAM)' }).first();
    const eiamHandle = page.locator('.sticky.left-0.flex-shrink-0').filter({ hasText: 'Employee IAM' }).first();

    const ciamBox = await ciamHandle.boundingBox();
    const eiamBox = await eiamHandle.boundingBox();

    if (!ciamBox || !eiamBox) throw new Error("Could not find bounding boxes");

    // Drag Customer IAM (CIAM) over Employee IAM
    await page.mouse.move(ciamBox.x + 20, ciamBox.y + ciamBox.height / 2);
    await page.mouse.down();
    // Move to the middle of the second asset to trigger swap
    await page.mouse.move(eiamBox.x + 20, eiamBox.y + eiamBox.height / 2, { steps: 20 });
    await page.mouse.up();

    // After reordering, Employee IAM should be first and Customer IAM (CIAM) second
    await expect(sidebarAssetNames.nth(0)).toHaveText('Employee IAM', { timeout: 3000 });
    await expect(sidebarAssetNames.nth(1)).toHaveText('Customer IAM (CIAM)');
  });
});
