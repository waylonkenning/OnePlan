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
    
    // Sort by name to have a predictable first row
    await page.getByText('Initiative Name', { exact: true }).click();

    // Change an initiative name in the first REAL row
    const firstInput = page.locator('table tbody tr[data-real="true"]').first().getByTestId('real-input-name');
    await firstInput.fill('A Renamed Initiative');
    await firstInput.blur(); // Ensure it saves

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
    await expect(realRows).toHaveCount(22); // Initiatives length from data.ts is 22
    
    // Total rows = 22 defaults + 1 blank row
    await expect(page.locator('table tbody tr')).toHaveCount(23);
  });
});
