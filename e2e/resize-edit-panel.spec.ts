import { test, expect } from '@playwright/test';

test.describe('Resize Initiative Edit Panel', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('resizing initiative does not open the edit panel', async ({ page }) => {
        const init = page.getByText('Passkey Rollout');
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

    test('normal click selects initiative; edit button opens panel', async ({ page }) => {
        const init = page.locator('[data-initiative-id]').filter({ hasText: 'Passkey Rollout' }).first();
        await expect(init).toBeVisible();

        // Single click selects (tap-to-select) but does NOT open the panel
        await init.click();
        await expect(init).toHaveAttribute('data-selected', 'true');
        await expect(page.getByRole('heading', { name: 'Edit Initiative' })).not.toBeVisible();

        // Clicking the ✎ edit button opens the panel
        await init.locator('[data-testid="initiative-edit"]').click();
        const editPanelHeading = page.getByRole('heading', { name: 'Edit Initiative' });
        await expect(editPanelHeading).toBeVisible();
    });
});
