import { test, expect } from '@playwright/test';

test.describe('Search and Filter', () => {
    test.beforeEach(async ({ page }) => {
        // Clear IndexedDB before each test and reload
        await page.goto('http://localhost:3000');
        await page.evaluate(async () => {
            const dbInfo = await window.indexedDB.databases();
            for (const db of dbInfo) {
                if (db.name) {
                    window.indexedDB.deleteDatabase(db.name);
                }
            }
        });
        // Reload to start fresh with default data
        await page.goto('http://localhost:3000');
    });

    test('can filter initiatives by name in timeline and data manager', async ({ page }) => {
        // Wait for Visualiser to load (should show default initiatives)
        await expect(page.locator('#timeline-visualiser')).toBeVisible();

        // Verify initial state: we expect multiple initiatives on screen
        // "SSO Consolidation" and "Passkey Rollout" should be visible
        await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
        await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();

        // Type "SSO" into the new search input in the header
        const searchInput = page.getByPlaceholder('Search initiatives...');
        await expect(searchInput).toBeVisible();
        await searchInput.fill('SSO');

        // Verify Visualiser is filtered
        // "SSO Consolidation" should remain visible
        await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
        // "Passkey Rollout" should be hidden
        await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();

        // Switch to Data Manager
        await page.getByRole('button', { name: 'Data Manager' }).click();

        // Table rows should be filtered
        // Assuming the first column is the initiative Name
        const rows = page.locator('tbody tr');
        await expect(rows).toHaveCount(2); // 1 real row + 1 ghost row
        await expect(rows.first().locator('input[type="text"]').first()).toHaveValue('SSO Consolidation');

        // Clear search
        await searchInput.clear();

        // Both should be back in Data Manager (Total of 24 default initiatives + 1 ghost)
        await expect(rows).toHaveCount(25);
    });
});
