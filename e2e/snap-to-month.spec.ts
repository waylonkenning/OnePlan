import { test, expect } from '@playwright/test';

test.describe('Snap to Month Setting', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('snaps start date to start of month when moving initiative', async ({ page }) => {
        const init = page.getByText('Web Channel Integration');
        await expect(init).toBeVisible();

        // Ensure snap is off first
        await page.getByLabel('Snap').selectOption('off');

        const box1 = await init.boundingBox();
        expect(box1).not.toBeNull();

        // Drag slightly to the right with snap off
        await page.mouse.move(box1!.x + box1!.width / 2, box1!.y + box1!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box1!.x + box1!.width / 2 + 15, box1!.y + box1!.height / 2); // Less than a month (approx 5 days)
        await page.mouse.up();

        const box2 = await init.boundingBox();

        // Ensure it moved a little bit (not snapped)
        expect(box2!.x).toBeGreaterThan(box1!.x);

        // Now turn snap on
        await page.getByLabel('Snap').selectOption('month');

        // Drag it a little bit more to the right, it should either snap back to start of month or jump to next month
        await page.mouse.move(box2!.x + box2!.width / 2, box2!.y + box2!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box2!.x + box2!.width / 2 + 20, box2!.y + box2!.height / 2);
        await page.mouse.up();

        // Double click to open edit panel and check the exact date
        await init.dblclick();

        // The date should end in '-01' if it snapped to month
        const startDateInput = page.getByLabel('Start Date');
        await expect(startDateInput).toBeVisible();
        const startVal = await startDateInput.inputValue();

        expect(startVal.endsWith('-01')).toBeTruthy();
    });
});
