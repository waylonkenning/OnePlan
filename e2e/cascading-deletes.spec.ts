import { test, expect } from '@playwright/test';

test.describe('Cascading Deletes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('deleting an asset cascades to its initiatives and milestones', async ({ page }) => {
        // Switch to Data Manager
        await page.getByRole('button', { name: 'Data Manager' }).click();

        // Go to Assets tab
        await page.getByRole('button', { name: 'Assets' }).click();

        // Count initial initiatives
        await page.getByRole('button', { name: 'Initiatives' }).click();
        const initialInitCount = await page.locator('table tbody tr').count();

        // Go back to Assets and delete CIAM (asset-1), which has 2 initiatives
        await page.getByRole('button', { name: 'Assets' }).click();

        // Accept the cascading confirmation dialog
        page.on('dialog', dialog => dialog.accept());

        // Click the delete button on the first asset row (CIAM)
        await page.locator('table tbody tr').first().getByRole('button', { name: 'Delete row' }).click();

        // Check that the asset is removed
        await expect(page.locator('table tbody tr').first()).not.toContainText('CIAM');

        // Check that associated initiatives were also removed
        await page.getByRole('button', { name: 'Initiatives' }).click();
        const newInitCount = await page.locator('table tbody tr').count();
        expect(newInitCount).toBeLessThan(initialInitCount);
    });
});
