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

  test('IndexedDB save is atomic: all stores intact after full overwrite and reload', async ({ page }) => {
    // Trigger a full saveAppData call by resetting to demo data — this exercises the
    // clear-all-stores-then-add-all-records path in db.ts
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('clear-and-start-again-btn').click();
    await page.getByTestId('template-select-with-demo-btn-geanz').click();
    await page.waitForTimeout(500);

    // Reload immediately — no waiting, to maximise the chance of catching a mid-transaction commit
    await page.reload();
    await page.getByTestId('nav-data-manager').click();

    // Initiatives store must have been written (not cleared and abandoned)
    const initiativeRows = page.locator('table tbody tr[data-real="true"]');
    await expect(initiativeRows).toHaveCount(48); // 22 original + 26 GEANZ initiatives

    // Assets store must also be intact
    await page.getByRole('button', { name: /Assets/ }).click();
    const assetRows = page.locator('table tbody tr[data-real="true"]');
    await expect(assetRows.first()).toBeVisible();

    // Milestones store must also be intact
    await page.getByRole('button', { name: /Milestones/ }).click();
    const milestoneRows = page.locator('table tbody tr[data-real="true"]');
    await expect(milestoneRows.first()).toBeVisible();
  });

  test('Default Data Initialization', async ({ page }) => {
    // Check if defaults exist
    await page.getByRole('button', { name: 'Data Manager' }).click();
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(48); // 22 original + 26 GEANZ initiatives

    // Total rows = 48 defaults + 1 blank row
    await expect(page.locator('table tbody tr')).toHaveCount(49);
  });
});
