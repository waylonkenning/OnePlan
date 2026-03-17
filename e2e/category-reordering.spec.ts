import { test, expect } from '@playwright/test';

test.describe('Category Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Dragging a category above another changes the vertical order', async ({ page }) => {
    // Initial order: Identity & Access Management (cat-iam) then Data Platform (cat-data)
    const categoryLabels = page.locator('[data-testid^="category-row-"] .sticky button');
    await expect(categoryLabels.nth(0)).toContainText('Identity & Access Management');
    await expect(categoryLabels.nth(1)).toContainText('Data Platform');

    const iamHandle = page.getByTestId('category-drag-handle-cat-iam');
    const dataHandle = page.getByTestId('category-drag-handle-cat-data');

    const iamBox = await iamHandle.boundingBox();
    const dataBox = await dataHandle.boundingBox();
    if (!iamBox || !dataBox) throw new Error('Could not find category bounding boxes');

    // Drag IAM down over Data Platform
    await page.mouse.move(iamBox.x + 20, iamBox.y + iamBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(dataBox.x + 20, dataBox.y + dataBox.height / 2, { steps: 20 });
    await page.mouse.up();

    await page.waitForTimeout(300);

    // Data Platform should now be first, IAM second
    await expect(categoryLabels.nth(0)).toContainText('Data Platform');
    await expect(categoryLabels.nth(1)).toContainText('Identity & Access Management');
  });
});
