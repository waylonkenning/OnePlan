import { test, expect } from '@playwright/test';

test.describe('Dependency Arrow Dragging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Should be able to drag a dependency arrow horizontally', async ({ page }) => {
    // Wait for a dependency label to be visible
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await expect(dependencyGroup).toBeVisible();

    const path = dependencyGroup.locator('path').nth(1);
    const initialPath = await path.getAttribute('d');
    console.log(`Initial Path: ${initialPath}`);

    const box = await dependencyGroup.boundingBox();
    if (!box) throw new Error("No bounding box for dependency");

    // Start dragging from the center of the bounding box
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    
    // Drag 100px to the right
    await page.mouse.move(startX + 100, startY);
    
    const intermediatePath = await path.getAttribute('d');
    console.log(`Intermediate Path: ${intermediatePath}`);
    expect(intermediatePath).not.toBe(initialPath);

    await page.mouse.up();

    const finalPath = await path.getAttribute('d');
    console.log(`Final Path: ${finalPath}`);
    expect(finalPath).not.toBe(initialPath);
    
    // Verify it persists after a "save" trigger (mocked by waiting or refresh)
    // The component triggers onUpdateDependencies on mouseUp
    
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    
    const reloadedPath = await page.locator('g.cursor-pointer.group').first().locator('path').nth(1).getAttribute('d');
    console.log(`Reloaded Path: ${reloadedPath}`);
    expect(reloadedPath).toBe(finalPath);
  });
});
