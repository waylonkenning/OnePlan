import { test, expect } from '@playwright/test';

test.describe('Milestone Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Move Milestone horizontally should update its date and persist', async ({ page }) => {
    // Target the 'DR Failover Test' milestone container specifically
    const milestoneContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const milestoneIcon = milestoneContainer.locator('.bg-amber-100');
    
    const initialBox = await milestoneIcon.boundingBox();
    if (!initialBox) throw new Error("Could not find milestone icon");

    const centerX = initialBox.x + initialBox.width / 2;
    const centerY = initialBox.y + initialBox.height / 2;

    // Drag right by 200px
    await milestoneIcon.hover();
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.move(centerX + 200, centerY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Wait for state to settle
    await page.waitForTimeout(500);

    // Verify position changed
    const newBox = await milestoneIcon.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox.x + 150);

    // Verify persistence after reload
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    
    // Look for it again after reload
    const persistedContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const persistedBox = await persistedContainer.locator('.bg-amber-100').boundingBox();
    expect(persistedBox!.x).toBeGreaterThan(initialBox.x + 150);
  });
});
