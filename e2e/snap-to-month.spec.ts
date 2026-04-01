import { test, expect } from '@playwright/test';

test.describe('Snap to Month Setting', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('snaps start date to start of month when moving initiative', async ({ page }) => {
        const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
        await expect(bar).toBeVisible();

        // Open more settings panel, ensure snap is off first
        await page.getByTestId('display-more-btn').click();
        await page.getByLabel('Snap to Month').selectOption('off');

        const box1 = await bar.boundingBox();
        expect(box1).not.toBeNull();

        // Drag slightly to the right with snap off
        await bar.hover();
        await page.mouse.down();
        await page.waitForTimeout(150);
        await page.mouse.move(box1!.x + box1!.width / 2 + 100, box1!.y + box1!.height / 2, { steps: 20 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        const box2 = await bar.boundingBox();

        // Ensure it moved a little bit (not snapped)
        expect(box2!.x).toBeGreaterThan(box1!.x);

        // Reopen more settings panel and turn snap on
        await page.getByTestId('display-more-btn').click();
        await page.getByLabel('Snap to Month').selectOption('month');

        // Drag it a little bit more to the right, it should either snap back to start of month or jump to next month
        await bar.hover();
        await page.mouse.down();
        await page.waitForTimeout(150);
        await page.mouse.move(box2!.x + box2!.width / 2 + 150, box2!.y + box2!.height / 2, { steps: 20 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        // Click to select, then open edit panel to check the exact date
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        // The date should end in '-01' if it snapped to month
        const startDateInput = page.getByLabel('Start Date');
        await expect(startDateInput).toBeVisible();
        const startVal = await startDateInput.inputValue();

        expect(startVal.endsWith('-01')).toBeTruthy();
    });
});
