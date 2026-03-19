import { test, expect } from '@playwright/test';

test.describe('Feature Animation Validation', () => {

  test.beforeEach(async ({ page }) => {
    // E2E flag skips initial tutorial
    await page.addInitScript(() => {
      window.localStorage.setItem('scenia-e2e', 'true');
    });
    await page.goto('/');
  });

  test('should load corrected v3 animation assets in Features Modal', async ({ page }) => {
    // Open Features Modal
    await page.getByTestId('nav-features').click();

    // Verify "Drag, Drop & Resize" screenshot
    const dragAndDropImg = page.locator('img[src="/features/move-resize.png"]');
    await expect(dragAndDropImg).toBeVisible();

    // Verify "Grouping & Collapsing" screenshot
    const groupingImg = page.locator('img[src="/features/grouped.png"]');
    await expect(groupingImg).toBeVisible();

    // Close modal
    await page.locator('#close-features-modal').click();
  });
});
