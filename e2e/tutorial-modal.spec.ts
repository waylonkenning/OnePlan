import { test, expect } from '@playwright/test';

test.describe('Tutorial Modal', () => {

  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB and local storage to simulate a fresh load without the bypass flag
    await page.goto('/');
    await page.evaluate(async () => {
      localStorage.removeItem('oneplan-e2e');
      localStorage.setItem('oneplan_has_seen_landing', 'true');
      return new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('oneplan-e2e');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => resolve(); // sometimes it's blocked, we just proceed
      });
    });
    // Reload the page now that local storage is clear
    await page.reload();
  });

  test('appears on first load and can be dismissed', async ({ page }) => {
    await page.goto('/');

    // Ensure the modal is visible
    const modalHeading = page.getByRole('heading', { name: 'Welcome to OnePlan' });
    await expect(modalHeading).toBeVisible();

    // Verify content of first slide
    await expect(page.getByText('OnePlan is a strategic planning')).toBeVisible();

    // Click 'Skip' button
    await page.getByRole('button', { name: 'Skip' }).click();

    // Ensure modal is closed
    await expect(modalHeading).toBeHidden();

    // Reload the page and ensure it doesn't reappear
    await page.reload();
    await expect(modalHeading).toBeHidden();
  });

  test('can be navigated via next and prev buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome to OnePlan' })).toBeVisible();

    // Click Next
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Ensure slide 2 is visible
    await expect(page.getByRole('heading', { name: 'Visualiser Mode' })).toBeVisible();

    // Click Prev
    await page.locator('button').filter({ has: page.locator('.lucide-chevron-left') }).click(); // target the chevron left
    
    // Ensure slide 1 is back
    await expect(page.getByRole('heading', { name: 'Welcome to OnePlan' })).toBeVisible();
  });

  test('can be opened via help button', async ({ page }) => {
    await page.goto('/');
    
    // Close the initial modal
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to OnePlan' })).toBeHidden();

    // Click Help Button
    await page.getByRole('button', { name: 'Show Tutorial' }).click();

    // Ensure modal is visible again
    await expect(page.getByRole('heading', { name: 'Welcome to OnePlan' })).toBeVisible();
  });
});
