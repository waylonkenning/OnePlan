import { test, expect } from '@playwright/test';

test.describe('Initiative Deletion', () => {
    test('Delete initiative from visualiser', async ({ page }) => {
        await page.goto('/');

        // Find the first initiative bar (e.g., "Passkey Rollout")
        const initiativeName = "Passkey Rollout";
        const initiative = page.locator(`div[title*="${initiativeName}"]`).first();
        await expect(initiative).toBeVisible();

        // Click to open the edit panel
        await initiative.click();

        // Check for "Delete Initiative" button
        const deleteBtn = page.getByRole('button', { name: 'Delete Initiative' });
        await expect(deleteBtn).toBeVisible();

        // Click Delete and handle confirmation
        page.on('dialog', dialog => {
            expect(dialog.message()).toContain('Sure you want to delete this initiative?');
            return dialog.accept();
        });

        await deleteBtn.click();

        // Verify the initiative is gone
        await expect(page.locator(`div[title*="${initiativeName}"]`)).not.toBeVisible();
    });
});
