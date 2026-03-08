import { test, expect } from '@playwright/test';

test.describe('Intra-Asset Dependency Spacing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('dynamically increases vertical gap between dependent initiatives in the same asset', async ({ page }) => {
        // Find the "Local Authentication" asset in the Customer IAM (CIAM) category
        // In the default data, this has 2 overlapping initiatives: 
        // "Passkey Rollout" and "SSO Consolidation"
        // And they have a dependency between them "blocks"
        const c1 = page.getByText('Passkey Rollout');
        const c2 = page.getByText('SSO Consolidation');

        await expect(c1).toBeVisible();
        await expect(c2).toBeVisible();

        // Get their bounding boxes to calculate the vertical gap
        const box1 = await c1.boundingBox();
        const box2 = await c2.boundingBox();

        expect(box1).not.toBeNull();
        expect(box2).not.toBeNull();

        // One should be below the other
        const topBar = box1!.y < box2!.y ? box1! : box2!;
        const bottomBar = box1!.y > box2!.y ? box1! : box2!;

        // The gap is the vertical distance between the bottom of the top bar and the top of the bottom bar
        const gap = bottomBar.y - (topBar.y + topBar.height);

        // Standard gap is 8px. The dynamic gap for intra-asset dependencies is 32px.
        // It might not be exactly 32px due to subpixel rendering or border boxes, but it should be > 20px
        expect(gap).toBeGreaterThan(20);
    });
});
