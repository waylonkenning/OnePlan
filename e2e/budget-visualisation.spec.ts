import { test, expect } from '@playwright/test';

test.describe('Budget Visualisation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can toggle budget visualisation to bar-height', async ({ page }) => {
        // Find an initiative bar - i-ciam-sso (SSO Consolidation) has 600k budget
        const initiativeBar = page.locator('div[data-initiative-id="i-ciam-sso"]');
        await expect(initiativeBar).toBeVisible();

        const initialBox = await initiativeBar.boundingBox();
        const initialHeight = initialBox?.height || 0;

        // Change the inline Budget select to bar-height
        await page.locator('select#budgetVisualisation').selectOption('bar-height');

        // Check if height increased - Use expect.poll for robustness
        await expect.poll(async () => {
            const box = await initiativeBar.boundingBox();
            return box?.height || 0;
        }).toBeGreaterThan(initialHeight);
    });

    test('can toggle budget visualisation to label', async ({ page }) => {
        // Change the inline Budget select to label
        await page.locator('select#budgetVisualisation').selectOption('label');

        // Find an initiative bar - i-ciam-sso has 600k budget
        const initiativeBar = page.locator('div[data-initiative-id="i-ciam-sso"]');
        await expect(initiativeBar).toBeVisible();

        // Check for budget label
        await expect(initiativeBar).toContainText('$600k');
    });
});
