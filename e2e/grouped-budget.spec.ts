import { test, expect } from '@playwright/test';

test.describe('Grouped Initiative Budget', () => {
    test('should show summed capex and dark font for grouped initiatives', async ({ page }) => {
        await page.goto('http://localhost:3000/');

        // Enable budget labels via inline toggle (off → label)
        const budgetToggle = page.getByTestId('toggle-budget');
        while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
            await budgetToggle.click();
        }

        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-asset-id="${targetAssetId}"]`);

        // 1. Verify individual capex labels (Passkey: 350k, SSO: 600k)
        await expect(targetRow).toContainText('CapEx $350k');
        await expect(targetRow).toContainText('CapEx $600k');

        // 2. Collapse the group
        const groupBox = targetRow.getByTestId('initiative-group-box');
        await targetRow.hover();
        const collapseBtn = groupBox.getByTestId('collapse-group-btn');
        await collapseBtn.click();

        // 3. Verify project group bar is visible
        const groupBar = page.getByTestId('project-group-bar');
        await expect(groupBar).toBeVisible();

        // 4. Verify summed capex label ($950k)
        await expect(groupBar).toContainText('CapEx $950k');

        // 5. Verify dark font for capex label
        const capexLabel = groupBar.getByTestId('capex-label').last();

        const color = await capexLabel.evaluate(el => getComputedStyle(el).color);
        console.log('CapEx label color:', color);

        // Expected color is dark blue (blue-900).
        if (color.startsWith('oklch')) {
            expect(color).toBe('oklch(0.379 0.146 265.522)');
        } else {
            expect(color).toBe('rgb(30, 58, 138)');
        }
    });
});
