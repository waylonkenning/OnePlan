import { test, expect } from '@playwright/test';

test.describe('Data Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('prevents saving initiative with end date before start date', async ({ page }) => {
        // Click an initiative to open the panel
        const bar = page.locator('div[data-initiative-id="init-1"]');
        await bar.click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();

        // Set end date before start date
        await panel.getByLabel('Start Date').fill('2027-06-01');
        await panel.getByLabel('End Date').fill('2026-01-01');

        // Try to save
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Error message should appear
        await expect(panel.getByText('End date must be on or after start date')).toBeVisible();

        // Panel should still be open (save was blocked)
        await expect(panel).toBeVisible();
    });

    test('prevents saving initiative with negative budget', async ({ page }) => {
        const bar = page.locator('div[data-initiative-id="init-1"]');
        await bar.click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();

        // Set a negative budget
        await panel.getByLabel('Budget ($)').fill('-5000');

        // Try to save
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Error message should appear
        await expect(panel.getByText('Budget cannot be negative')).toBeVisible();

        // Panel should still be open
        await expect(panel).toBeVisible();
    });

    test('allows saving initiative with valid data', async ({ page }) => {
        const bar = page.locator('div[data-initiative-id="init-1"]');
        await bar.click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();

        // Set valid dates
        await panel.getByLabel('Start Date').fill('2026-01-01');
        await panel.getByLabel('End Date').fill('2026-12-31');
        await panel.getByLabel('Budget ($)').fill('100000');

        // Save should work
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Panel should close
        await expect(panel).not.toBeVisible();
    });
});
