import { test, expect } from '@playwright/test';

test.describe('Navigation & State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // await page.evaluate(async () => {
    //   ... simplified clearing ...
    // });
    // await page.reload();
  });

  test('View Switching: switches between Visualiser and Data Manager', async ({ page }) => {
    // Initially on Visualiser
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    // Click Data Manager
    await page.getByRole('button', { name: 'Data Manager' }).click();
    // Check for specific Data Manager header or tab
    await expect(page.getByRole('button', { name: /Initiatives\s*\d*/ })).toBeVisible();
    await expect(page.locator('#timeline-visualiser')).not.toBeVisible();

    // Click Visualiser
    await page.getByRole('button', { name: 'Visualiser' }).click();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
  });

  test('Data Persistence (IndexedDB)', async ({ page }) => {
    // Go to Data Manager
    await page.getByRole('button', { name: 'Data Manager' }).click();

    // Wait for the data table to load
    await page.waitForSelector('table');
    
    // Change an initiative name
    // Assuming the first input is the initiative name
    const firstInput = page.locator('table tbody tr').first().locator('input[type="text"]').first();
    await firstInput.fill('A Renamed Initiative');

    // Reload page
    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();

    // Verify it persisted
    const inputAfterReload = page.locator('input[value="A Renamed Initiative"]');
    await expect(inputAfterReload).toBeVisible();
  });

  test('Default Data Initialization', async ({ page }) => {
    // Check if defaults exist
    await page.getByRole('button', { name: 'Data Manager' }).click();
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(24); // Initiatives length from data.ts is 24
    
    // Total rows = 24 defaults + 1 blank row
    await expect(page.locator('table tbody tr')).toHaveCount(25);
  });
});
