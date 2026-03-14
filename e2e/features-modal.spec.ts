import { test, expect } from '@playwright/test';

test.describe('Features Modal', () => {
  test.beforeEach(async ({ page }) => {
    // E2E flag skips initial tutorial
    await page.addInitScript(() => {
      window.localStorage.setItem('oneplan-e2e', 'true');
    });
    await page.goto('/');
    
    // Ensure we're loaded
    await expect(page.locator('h1').filter({ hasText: 'OnePlan' })).toBeVisible();
  });

  test('should open and close the features modal', async ({ page }) => {
    // Open features modal
    await page.getByTestId('nav-features').click();
    
    // Verify modal is visible
    await expect(page.getByText('OnePlan Features & Capabilities')).toBeVisible();

    // Verify some content
    await expect(page.getByText('Navigation & Setup')).toBeVisible();
    await expect(page.getByText('Using the Visualiser')).toBeVisible();

    // Close the modal
    await page.locator('button[aria-label="Close Features"]').click();

    // Verify modal is closed
    await expect(page.getByText('OnePlan Features & Capabilities')).toBeHidden();
  });
});
