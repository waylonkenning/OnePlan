import { test, expect } from '@playwright/test';

test.describe('Cascading Deletes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('deleting asset removes its initiative bars from the Visualiser timeline', async ({ page }) => {
        // Verify the CIAM initiative bar is present on the timeline first
        const initiativeBar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await expect(initiativeBar).toBeVisible();

        // Switch to Data Manager and delete the Customer IAM (CIAM) asset
        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: 'Assets' }).click();
        await page.locator('table tbody tr').first().getByRole('button', { name: 'Delete row' }).click();
        await page.locator('[data-testid="confirm-modal-confirm"]').click();

        // Switch back to Visualiser and verify the initiative bar is gone (no ghost bar)
        await page.getByRole('button', { name: 'Visualiser' }).click();
        await expect(initiativeBar).not.toBeVisible();
    });

    test('deleting initiative removes its dependencies from Data Manager', async ({ page }) => {
        // Count deps before deletion
        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: 'Dependencies' }).click();
        const depsBefore = await page.locator('table tbody tr').count();

        // Go to Visualiser and delete the Passkey Rollout initiative
        await page.getByRole('button', { name: 'Visualiser' }).click();
        const initiativeBar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await expect(initiativeBar).toBeVisible();
        await initiativeBar.click();
        await page.getByTestId('initiative-action-edit').click();
        const deleteBtn = page.getByRole('button', { name: 'Delete Initiative' });
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();
        await page.locator('[data-testid="confirm-modal-confirm"]').click();

        // Verify initiative bar is gone from timeline (no ghost bar)
        await expect(initiativeBar).not.toBeVisible();

        // Verify dependencies referencing this initiative are gone from Data Manager
        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: 'Dependencies' }).click();
        const depsAfter = await page.locator('table tbody tr').count();
        expect(depsAfter).toBeLessThan(depsBefore);
    });

    test('deleting an asset cascades to its initiatives and milestones', async ({ page }) => {
        // Switch to Data Manager
        await page.getByRole('button', { name: 'Data Manager' }).click();

        // Go to Assets tab
        await page.getByRole('button', { name: 'Assets' }).click();

        // Count initial initiatives
        await page.getByRole('button', { name: 'Initiatives' }).click();
        const initialInitCount = await page.locator('table tbody tr').count();

        // Go back to Assets and delete Customer IAM (CIAM) (a-ciam), which has 2 initiatives
        await page.getByRole('button', { name: 'Assets' }).click();

        // Click the delete button on the first asset row (Customer IAM (CIAM))
        await page.locator('table tbody tr').first().getByRole('button', { name: 'Delete row' }).click();
        await page.locator('[data-testid="confirm-modal-confirm"]').click();

        // Check that the asset is removed
        await expect(page.locator('table tbody tr').first()).not.toContainText('Customer IAM (CIAM)');

        // Check that associated initiatives were also removed
        await page.getByRole('button', { name: 'Initiatives' }).click();
        const newInitCount = await page.locator('table tbody tr').count();
        expect(newInitCount).toBeLessThan(initialInitCount);
    });
});
