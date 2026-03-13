import { test, expect } from '@playwright/test';

test.describe('Swimlane Padding', () => {
    test('should have compact swimlane heights', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

        // Target 'Privileged Access Mgmt' (a-pam) which has 1 initiative
        const targetAssetId = 'a-pam';
        const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
        const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

        const rowBox = await rowContent.boundingBox();
        const rowHeight = rowBox?.height || 0;
        console.log(`Row height for ${targetAssetId}: ${rowHeight}`);

        // Current expected height is 100px.
        // We want it to be significantly less (around 60px).
        // This test will initially FAIL if we set the expectation to 65px.
        expect(rowHeight).toBeLessThanOrEqual(65);
    });

    test('should have compact gaps between multi-row initiatives', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
        const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

        const rowBox = await rowContent.boundingBox();
        const rowHeight = rowBox?.height || 0;
        console.log(`Row height for ${targetAssetId}: ${rowHeight}`);

        // Old calculation: ~168px
        // New calculation: 8 + 44 + 4 + 44 + 8 = 108.
        expect(rowHeight).toBeLessThanOrEqual(115);
    });

    test('should have consistent height when a group is collapsed', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
        const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

        // 1. Collapse the group
        const groupBox = targetRow.getByTestId('initiative-group-box');
        const collapseBtn = groupBox.getByTestId('collapse-group-btn');
        await collapseBtn.click({ force: true });

        // 2. Measure height
        const rowBox = await rowContent.boundingBox();
        const rowHeight = rowBox?.height || 0;
        console.log(`Row height for collapsed ${targetAssetId}: ${rowHeight}`);

        // EXPECTATION: It should now be 60px (consistent with single-initiative row)
        // Previously it was ~130px even when collapsed.
        expect(rowHeight).toBe(60);
    });
});
