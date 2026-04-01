import { test, expect } from '@playwright/test';

test.describe('Description Display', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can edit description in initiative panel', async ({ page }) => {
        // Click an initiative to select it, then open edit panel
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await expect(bar).toBeVisible();
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

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
        await expect(panel).toBeHidden();

        // Re-open the panel and verify description persists
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();
        await expect(panel).toBeVisible();
        await expect(panel.getByLabel('Description')).toHaveValue('This is a test description for the initiative.');
    });

    test('description appears in timeline bar tooltip', async ({ page }) => {
        // First, add a description to i-ciam-passkey
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();
        await panel.getByLabel('Description').fill('My tooltip description');
        await panel.getByRole('button', { name: 'Save Changes' }).click();
        await expect(panel).toBeHidden();

        // Now check the title attribute on the bar includes the description
        await expect(bar).toHaveAttribute('title', /My tooltip description/);
    });

    test('description toggle expands bar when turned on', async ({ page }) => {
        // First add a description to i-ciam-passkey
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();
        await panel.getByLabel('Description').fill('A long description that should cause the bar to expand vertically to show the full text.');
        await panel.getByRole('button', { name: 'Save Changes' }).click();
        await expect(panel).toBeHidden();

        // Get initial bar height with description display off
        const initialBox = await bar.boundingBox();
        const initialHeight = initialBox?.height || 0;

        // Turn on Descriptions via inline icon toggle
        await page.getByTestId('toggle-descriptions').click();

        // The bar should now be taller
        await expect.poll(async () => {
            const box = await bar.boundingBox();
            return box?.height || 0;
        }).toBeGreaterThan(initialHeight);

        // The description text should be visible in the bar
        await expect(bar).toContainText('A long description');
    });
});
