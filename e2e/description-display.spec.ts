import { test, expect } from '@playwright/test';

test.describe('Description Display', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can edit description in initiative panel', async ({ page }) => {
        // Click an initiative to open the panel
        const bar = page.locator('div[data-initiative-id="init-1"]');
        await expect(bar).toBeVisible();
        await bar.click();

        // Panel should be open
        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();

        // Description textarea should exist
        const descInput = panel.getByLabel('Description');
        await expect(descInput).toBeVisible();

        // Type a description
        await descInput.fill('This is a test description for the initiative.');

        // Save
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Re-open the panel and verify description persists
        await bar.click();
        await expect(panel).toBeVisible();
        await expect(panel.getByLabel('Description')).toHaveValue('This is a test description for the initiative.');
    });

    test('description appears in timeline bar tooltip', async ({ page }) => {
        // First, add a description to init-1
        const bar = page.locator('div[data-initiative-id="init-1"]');
        await bar.click();

        const panel = page.getByTestId('initiative-panel');
        await panel.getByLabel('Description').fill('My tooltip description');
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Now check the title attribute on the bar includes the description
        await expect(bar).toHaveAttribute('title', /My tooltip description/);
    });
});
