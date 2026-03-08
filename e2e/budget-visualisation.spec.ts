import { test, expect } from '@playwright/test';

test.describe('Budget Visualisation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Ensure we are in Visualiser mode
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can toggle budget visualisation to bar-height', async ({ page }) => {
        // Find an initiative bar - init-2 (Enterprise CIAM) has 800k budget
        const initiativeBar = page.locator('div[data-initiative-id="init-2"]');
        await expect(initiativeBar).toBeVisible();

        const initialBox = await initiativeBar.boundingBox();
        const initialHeight = initialBox?.height || 0;

        // Open settings
        await page.getByRole('button', { name: 'Settings' }).click();

        // Change toggle to Bar Height
        await page.locator('select#budgetVisualisation').selectOption('bar-height');
        await page.getByRole('button', { name: 'Save Settings' }).click();

        // Check if height increased - Use expect.poll for robustness
        await expect.poll(async () => {
            const box = await initiativeBar.boundingBox();
            return box?.height || 0;
        }).toBeGreaterThan(initialHeight);
    });

    test('can toggle budget visualisation to label', async ({ page }) => {
        // Open settings
        await page.getByRole('button', { name: 'Settings' }).click();

        // Change toggle to Label
        await page.locator('select#budgetVisualisation').selectOption('label');
        await page.getByRole('button', { name: 'Save Settings' }).click();

        // Find an initiative bar - init-2 has 800k budget
        const initiativeBar = page.locator('div[data-initiative-id="init-2"]');
        await expect(initiativeBar).toBeVisible();

        // Check for budget label ($800,000)
        // Note: The implementation should probably format this concisely, e.g., $800k
        await expect(initiativeBar).toContainText('$800k');
    });
});
