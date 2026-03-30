/**
 * User Story: Prevent Duplicate Initiative IDs When Creating New Initiatives
 * 
 * As a user
 * When I double-click on a swimlane to create a new initiative
 * And there are already initiatives with IDs like "init-new-0" and "init-new-1"
 * Then the new initiative should be created with a unique ID (e.g., "init-new-2")
 * And the new initiative should appear on the timeline
 * 
 * Acceptance Criteria:
 * 1. Given existing initiatives with IDs "init-new-0" and "init-new-1"
 * 2. When I double-click on a swimlane to create a new initiative
 * 3. Then the Create Initiative modal should appear with a unique ID that doesn't conflict
 * 4. When I save the initiative
 * 5. Then the initiative should be created successfully and appear on the timeline
 * 6. And subsequent double-clicks should continue to generate unique IDs
 */

import { test, expect } from '@playwright/test';

test.describe('Duplicate Initiative ID Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="timeline"]', { timeout: 10000 });
    
    // Switch to Data Manager to set up test data
    await page.click('button:has-text("Data")');
    await page.waitForSelector('[data-testid="data-manager"]');
    
    // Clear existing data
    await page.click('button:has-text("Clear All")');
    await page.click('button:has-text("Confirm")');
    
    // Create an asset
    await page.click('text=Assets');
    const assetNameInput = page.locator('[data-testid="cell-name"]').first();
    await assetNameInput.click();
    await assetNameInput.fill('Test Asset');
    await assetNameInput.press('Tab');
    
    // Create initiatives with IDs init-new-0 and init-new-1
    await page.click('text=Initiatives');
    
    // First initiative: init-new-0
    const firstIdInput = page.locator('[data-testid="cell-id"]').first();
    await firstIdInput.click();
    await firstIdInput.fill('init-new-0');
    await firstIdInput.press('Tab');
    
    const firstNameInput = page.locator('[data-testid="cell-name"]').first();
    await firstNameInput.fill('Initiative 0');
    await firstNameInput.press('Tab');
    
    // Select asset
    const firstAssetSelect = page.locator('[data-testid="cell-assetId"]').first();
    await firstAssetSelect.selectOption({ label: 'Test Asset' });
    
    // Second initiative: init-new-1
    await page.waitForTimeout(500);
    const secondIdInput = page.locator('[data-testid="cell-id"]').nth(1);
    await secondIdInput.click();
    await secondIdInput.fill('init-new-1');
    await secondIdInput.press('Tab');
    
    const secondNameInput = page.locator('[data-testid="cell-name"]').nth(1);
    await secondNameInput.fill('Initiative 1');
    await secondNameInput.press('Tab');
    
    const secondAssetSelect = page.locator('[data-testid="cell-assetId"]').nth(1);
    await secondAssetSelect.selectOption({ label: 'Test Asset' });
    
    // Switch back to visualizer
    await page.click('button:has-text("Visualiser")');
    await page.waitForSelector('[data-testid="timeline"]');
  });

  test('should generate unique initiative ID when double-clicking swimlane with existing init-new-0 and init-new-1', async ({ page }) => {
    // Find the swimlane for Test Asset
    const swimlane = page.locator('[data-asset-id]').first();
    
    // Double-click on an empty area of the swimlane
    const box = await swimlane.boundingBox();
    if (!box) throw new Error('Swimlane not found');
    
    // Click in the middle-right area to avoid existing initiatives
    await page.mouse.dblclick(box.x + box.width * 0.7, box.y + box.height / 2);
    
    // Wait for the Create Initiative modal to appear
    await page.waitForSelector('text=Create Initiative', { timeout: 5000 });
    
    // Check that the ID field contains "init-new-2" (not init-new-0 or init-new-1)
    const idInput = page.locator('input[name="id"]');
    const idValue = await idInput.inputValue();
    
    expect(idValue).toBe('init-new-2');
    
    // Fill in the initiative details
    await page.fill('input[name="name"]', 'New Initiative');
    
    // Save the initiative
    await page.click('button:has-text("Save")');
    
    // Wait for modal to close
    await page.waitForSelector('text=Create Initiative', { state: 'hidden', timeout: 5000 });
    
    // Verify the new initiative appears on the timeline
    await expect(page.locator('[data-initiative-id="init-new-2"]')).toBeVisible();
    
    // Double-click again to create another initiative
    await page.mouse.dblclick(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.waitForSelector('text=Create Initiative');
    
    // Check that the next ID is init-new-3
    const nextIdValue = await idInput.inputValue();
    expect(nextIdValue).toBe('init-new-3');
    
    // Cancel this one
    await page.click('button:has-text("Cancel")');
  });

  test('should not create initiative when ID already exists', async ({ page }) => {
    // This test verifies the current buggy behavior would fail
    // After the fix, this scenario shouldn't occur
    
    // Manually try to create an initiative with duplicate ID via Data Manager
    await page.click('button:has-text("Data")');
    await page.waitForSelector('[data-testid="data-manager"]');
    await page.click('text=Initiatives');
    
    // Try to create initiative with existing ID
    const thirdIdInput = page.locator('[data-testid="cell-id"]').nth(2);
    await thirdIdInput.click();
    await thirdIdInput.fill('init-new-0'); // Duplicate ID
    await thirdIdInput.press('Tab');
    
    const thirdNameInput = page.locator('[data-testid="cell-name"]').nth(2);
    await thirdNameInput.fill('Duplicate Initiative');
    await thirdNameInput.press('Tab');
    
    // Switch back to visualizer
    await page.click('button:has-text("Visualiser")');
    await page.waitForSelector('[data-testid="timeline"]');
    
    // Should only see 2 initiatives (the duplicate shouldn't be saved)
    const initiatives = page.locator('[data-initiative-id]');
    await expect(initiatives).toHaveCount(2);
  });
});
