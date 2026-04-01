import { test, expect } from '@playwright/test';

test.describe('Swimlane Height Collapse', () => {
  test('should adjust swimlane height when group is collapsed/expanded', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const targetAssetId = 'a-ciam';
    const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
    const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

    // 1. Get initial height (ungrouped)
    const initialBox = await rowContent.boundingBox();
    const initialHeight = initialBox?.height || 0;
    console.log(`Initial height: ${initialHeight}`);

    // 2. Find group and collapse it
    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 15000 });
    
    await targetRow.hover();
    const collapseBtn = groupBox.getByTestId('collapse-group-btn');
    await collapseBtn.click();

    // 3. Verify project bar is visible
    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 15000 });

    // 4. Measure height after collapse (wait for height to decrease)
    await expect(async () => {
      const box = await rowContent.boundingBox();
      expect(box?.height).toBeLessThan(initialHeight);
    }).toPass({ timeout: 2000 });
    const collapsedBox = await rowContent.boundingBox();
    const collapsedHeight = collapsedBox?.height || 0;
    console.log(`Collapsed height: ${collapsedHeight}`);

    // EXPECTATION: Height should be less than initial height
    // Since CIAM has two stacked initiatives, initial height is likely ~144px.
    // Collapsed height should be ~100px (MIN_ROW_HEIGHT).
    expect(collapsedHeight).toBeLessThan(initialHeight);

    // 5. Expand again
    await projectBar.hover();
    const expandBtn = projectBar.getByTestId('expand-group-btn');
    await expandBtn.click();

    // 6. Measure height after expand (wait for height to restore)
    await expect(async () => {
      const box = await rowContent.boundingBox();
      expect(box?.height).toBeGreaterThan(collapsedHeight);
    }).toPass({ timeout: 2000 });
    const expandedBox = await rowContent.boundingBox();
    const expandedHeight = expandedBox?.height || 0;
    console.log(`Expanded height: ${expandedHeight}`);

    // EXPECTATION: Height should be back to initial height
    expect(expandedHeight).toBeCloseTo(initialHeight, 1);
  });
});
