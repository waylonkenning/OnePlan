import { test, expect } from '@playwright/test';

test.describe('Collapsible Categories & Empty Rows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can collapse and expand categories', async ({ page }) => {
        // Find the button that contains the category name (and the count span)
        const categoryHeaderBtn = page.getByRole('button', { name: /Identity & Access Management/i });
        await expect(categoryHeaderBtn).toBeVisible();

        const asset1 = page.getByText('Customer IAM (CIAM)', { exact: true });
        const asset2 = page.getByText('Privileged Access Mgmt', { exact: true });

        await expect(asset1).toBeVisible();
        await expect(asset2).toBeVisible();

        // Click to collapse
        await categoryHeaderBtn.click();

        // Assets should be hidden
        await expect(asset1).not.toBeVisible();
        await expect(asset2).not.toBeVisible();

        // Click to expand
        await categoryHeaderBtn.click();

        // Assets should be visible again
        await expect(asset1).toBeVisible();
        await expect(asset2).toBeVisible();
    });

    test('can hide and show empty rows', async ({ page }) => {
        // Go to Data Manager and add a new empty asset
        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: /Assets/i }).click();
        
        // Add a new row
        await page.getByRole('button', { name: 'Add Row' }).click();
        
        // Fill the new asset name - it's the last row
        const lastRow = page.locator('table tbody tr[data-real="true"]').last();
        const nameInput = lastRow.locator('input[type="text"]').first();
        await nameInput.fill('Empty Asset');
        
        // Go back to Visualiser
        await page.getByRole('button', { name: 'Visualiser' }).click();

        const emptyAsset = page.getByText('Empty Asset', { exact: true });
        await expect(emptyAsset).toBeVisible();

        // Change "Empty Rows" setting to "Hide"
        await page.getByLabel('Empty Rows').selectOption('hide');

        // The empty asset should disappear
        await expect(emptyAsset).not.toBeVisible();

        // Change back to "Show"
        await page.getByLabel('Empty Rows').selectOption('show');

        // It should reappear
        await expect(emptyAsset).toBeVisible();
    });
});
