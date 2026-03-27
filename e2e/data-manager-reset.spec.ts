import { test, expect } from '@playwright/test';

const CONFIRM = '[data-testid="confirm-modal-confirm"]';

test.describe('Data Manager Reset Buttons', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Data Manager' }).click();
        await expect(page.getByRole('button', { name: /Initiatives/ })).toBeVisible();
    });

    test('Delete all rows for this table clears only the active tab', async ({ page }) => {
        // We are on the Initiatives tab by default
        // Confirm there are rows visible (48 initiative rows + 1 ghost row = 49)
        const rows = page.locator('table tbody tr');
        const initCount = await rows.count();
        expect(initCount).toBe(49); // 22 original + 26 GEANZ initiatives + 1 ghost row

        await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
        await page.locator(CONFIRM).click();

        // Initiatives should now be empty (only ghost row)
        await expect(rows).toHaveCount(1);

        // But Assets tab should still have data
        await page.getByRole('button', { name: /Assets \d/ }).click();
        const assetRows = page.locator('table tbody tr');
        const assetCount = await assetRows.count();
        expect(assetCount).toBeGreaterThan(1);
    });

    test('"Clear data and start again" with blank empties all tables', async ({ page }) => {
        await page.getByTestId('clear-and-start-again-btn').click();
        await expect(page.getByTestId('template-picker-modal')).toBeVisible();
        await page.getByTestId('template-start-blank-btn').click();

        // Check that the current tab (Initiatives) is empty
        const rows = page.locator('table tbody tr');
        await expect(rows).toHaveCount(1); // Only ghost row

        // Check Assets tab too
        await page.getByRole('button', { name: /Assets/ }).click();
        const assetRows = page.locator('table tbody tr');
        await expect(assetRows).toHaveCount(1);
    });

    test('"Clear data and start again" with GEANZ demo data populates all tables', async ({ page }) => {
        await page.getByTestId('clear-and-start-again-btn').click();
        await expect(page.getByTestId('template-picker-modal')).toBeVisible();
        await page.getByTestId('template-select-with-demo-btn-geanz').click();

        // Initiatives should have many rows now (48 initiatives + ghost row = 49)
        const initRows = page.locator('table tbody tr');
        const count = await initRows.count();
        expect(count).toBe(49); // 22 original + 26 GEANZ initiatives + 1 ghost row
    });
});
