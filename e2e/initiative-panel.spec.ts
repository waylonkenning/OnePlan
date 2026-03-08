import { test, expect } from '@playwright/test';

test.describe('Initiative Panel', () => {
    test.beforeEach(async ({ page }) => {
        // Clear IndexedDB before each test
        await page.goto('http://localhost:3000');
        await page.evaluate(async () => {
            const dbInfo = await window.indexedDB.databases();
            for (const db of dbInfo) {
                if (db.name) {
                    window.indexedDB.deleteDatabase(db.name);
                }
            }
        });
        // Reload to start fresh
        await page.goto('http://localhost:3000');
    });

    test('can open initiative panel, edit, and save changes', async ({ page }) => {
        // Wait for Visualiser to load
        await expect(page.locator('#timeline-visualiser')).toBeVisible();

        // Find the "Passkey Rollout" initiative
        const initiative = page.locator('div[data-initiative-id]').filter({ hasText: 'Passkey Rollout' });
        await expect(initiative).toBeVisible();

        // Click it to open the panel
        await initiative.click();

        // The panel should appear
        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();

        // Budget field should have the current budget
        const budgetInput = panel.getByLabel('Budget ($)');
        await expect(budgetInput).toHaveValue('350000');

        // Change the budget
        await budgetInput.fill('600000');

        // Name field should have current name
        const nameInput = panel.getByLabel('Initiative Name');
        await nameInput.fill('Passkey Rollout V2');

        // Change Programme (to Regulatory Programme - ID: prog-reg)
        // The select should be visible
        const programmeSelect = panel.getByLabel('Programme');
        await programmeSelect.selectOption({ label: 'Regulatory Programme' });

        // Save changes
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Panel should close
        await expect(panel).not.toBeVisible();

        // Verify the initiative on the timeline has the new name
        const updatedInitiative = page.locator('div[data-initiative-id]').filter({ hasText: 'Passkey Rollout V2' });
        await expect(updatedInitiative).toBeVisible();

        // Verify it has the Regulatory Programme color/label
        // In Programme color mode, subtitle should say Regulatory Programme
        await expect(updatedInitiative.locator('text=Regulatory Programme')).toBeVisible();

        // Reopen to check budget
        await updatedInitiative.click();
        await expect(panel).toBeVisible();
        await expect(panel.getByLabel('Budget ($)')).toHaveValue('600000');
    });
});
