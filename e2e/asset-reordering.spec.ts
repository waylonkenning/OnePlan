import { test, expect } from '@playwright/test';

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

    // Wait for state update
    await page.waitForTimeout(500);

    // After reordering, Employee IAM should be first and Customer IAM (CIAM) second
    await expect(sidebarAssetNames.nth(0)).toHaveText('Employee IAM');
    await expect(sidebarAssetNames.nth(1)).toHaveText('Customer IAM (CIAM)');
  });
});
