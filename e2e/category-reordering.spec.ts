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

    // Application sub-rows in the IAM section push Data Platform off-screen, making
    // mouse-based drag unreliable. Dispatch drag events directly, with waits between
    // each event so React can process state updates (e.g. setDraggingCategory) before
    // the next event fires.
    await page.evaluate(() => {
      const source = document.querySelector('[data-testid="category-drag-handle-cat-iam"]') as HTMLElement;
      if (!source) throw new Error('IAM drag handle not found');
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
    });
    await page.waitForTimeout(100); // let React process setDraggingCategory state update

    await page.evaluate(() => {
      const target = document.querySelector('[data-testid="category-row-cat-data"]') as HTMLElement;
      if (!target) throw new Error('Data Platform category row not found');
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(100); // let React process setCategoryOrder state update

    await page.evaluate(() => {
      const source = document.querySelector('[data-testid="category-drag-handle-cat-iam"]') as HTMLElement;
      if (!source) throw new Error('IAM drag handle not found');
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    });

    await page.waitForTimeout(300);

    // Data Platform should now be first, IAM second
    await expect(categoryLabels.nth(0)).toContainText('Data Platform');
    await expect(categoryLabels.nth(1)).toContainText('Identity & Access Management');
  });
});
