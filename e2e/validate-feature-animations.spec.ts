import { test, expect } from '@playwright/test';

test.describe('Feature Animation Validation', () => {

  test.beforeEach(async ({ page }) => {
    // E2E flag skips initial tutorial
    await page.addInitScript(() => {
      window.localStorage.setItem('oneplan-e2e', 'true');
    });
    await page.goto('/');
  });

  test('should load corrected v3 animation assets in Features Modal', async ({ page }) => {
    // Open Features Modal
    await page.getByTestId('nav-features').click();

    // Verify "Drag and Drop" animation
    const dragAndDropImg = page.locator('img[src="/features/drag_and_drop_fixed_v3.webp"]');
    await expect(dragAndDropImg).toBeVisible();

    // Verify "Grouping Projects" animation
    const groupingImg = page.locator('img[src="/features/grouping_projects_fixed_v3.webp"]');
    await expect(groupingImg).toBeVisible();

    // Close modal
    await page.locator('#close-features-modal').click();
  });
});
