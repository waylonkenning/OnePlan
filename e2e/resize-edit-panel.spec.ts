import { test, expect } from '@playwright/test';

test.describe('Resize Initiative Edit Panel', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('resizing initiative does not open the edit panel', async ({ page }) => {
        const init = page.getByText('Web Channel Integration');
        await expect(init).toBeVisible();

        const box = await init.boundingBox();
        expect(box).not.toBeNull();

        // Drag the right edge of the initiative
        await page.mouse.move(box!.x + box!.width - 2, box!.y + box!.height / 2);
        await page.mouse.down();
        // Move it 50 pixels to the right
        await page.mouse.move(box!.x + box!.width + 50, box!.y + box!.height / 2);
        await page.mouse.up();

        // The edit panel should not be visible
        const editPanelHeading = page.getByRole('heading', { name: 'Edit Initiative' });
        await expect(editPanelHeading).not.toBeVisible();
    });

    test('normal click opens the edit panel', async ({ page }) => {
        const init = page.getByText('Web Channel Integration');
        await expect(init).toBeVisible();

        const box = await init.boundingBox();
        expect(box).not.toBeNull();

        // Click the middle of the initiative
        await init.click();

        // The edit panel should be visible
        const editPanelHeading = page.getByRole('heading', { name: 'Edit Initiative' });
        await expect(editPanelHeading).toBeVisible();
    });
});
