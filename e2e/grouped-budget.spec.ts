import { test, expect } from '@playwright/test';

test.describe('Grouped Initiative Budget', () => {
    test('should show summed budget and dark font for grouped initiatives', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        
        // Enable budget labels via inline toggle (off → label)
        const budgetToggle = page.getByTestId('toggle-budget');
        while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
            await budgetToggle.click();
        }
        
        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-asset-id="${targetAssetId}"]`);
        
        // 1. Verify individual budgets first (Passkey: 350k, SSO: 600k)
        await expect(targetRow).toContainText('$350k');
        await expect(targetRow).toContainText('$600k');
        
        // 2. Collapse the group
        const groupBox = targetRow.getByTestId('initiative-group-box');
        await targetRow.hover();
        const collapseBtn = groupBox.getByTestId('collapse-group-btn');
        await collapseBtn.click();
        
        // 3. Verify project group bar is visible
        const groupBar = page.getByTestId('project-group-bar');
        await expect(groupBar).toBeVisible();
        
        // 4. Verify summed budget ($950k)
        await expect(groupBar).toContainText('$950k');
        
        // 5. Verify dark font for budget label
        // The budget label is a div inside the group bar. 
        // We use .last() because the parent container also contains the text.
        const budgetLabel = groupBar.locator('div').filter({ hasText: '$950k' }).last();
        
        const color = await budgetLabel.evaluate(el => getComputedStyle(el).color);
        console.log('Budget label color:', color);
        
        // Expected color is dark blue (blue-900). 
        // Modern browsers/Tailwind might return OKLCH or RGB.
        if (color.startsWith('oklch')) {
            expect(color).toBe('oklch(0.379 0.146 265.522)');
        } else {
            expect(color).toBe('rgb(30, 58, 138)');
        }
    });
});
