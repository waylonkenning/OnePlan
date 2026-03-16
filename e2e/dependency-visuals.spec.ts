import { test, expect } from '@playwright/test';

test.describe('Dependency Visual Enhancements', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#timeline-visualiser');
    });

    test('increased vertical gap for intra-asset dependencies', async ({ page }) => {
        const c1 = page.getByText('Passkey Rollout').first();
        const c2 = page.getByText('SSO Consolidation').first();

        await expect(c1).toBeVisible();
        await expect(c2).toBeVisible();

        const box1 = await c1.boundingBox();
        const box2 = await c2.boundingBox();

        const topBar = box1!.y < box2!.y ? box1! : box2!;
        const bottomBar = box1!.y > box2!.y ? box1! : box2!;

        const gap = bottomBar.y - (topBar.y + topBar.height);
        // New standard gap for intra-asset dependencies is 32px
        expect(gap).toBeGreaterThan(30);
    });

    test('dependency labels are offset and not covering the arrow segment', async ({ page }) => {
        // "Passkey Rollout" and "SSO Consolidation" have a dependency
        const dependencyLabel = page.locator('text=blocks').first();
        await expect(dependencyLabel).toBeVisible();

        const labelBox = await dependencyLabel.boundingBox();
        expect(labelBox).not.toBeNull();

        // Get the source and target to estimate the "midpoint" where the arrow would be
        const c1 = page.getByText('Passkey Rollout').first();
        const c2 = page.getByText('SSO Consolidation').first();
        const box1 = await c1.boundingBox();
        const box2 = await c2.boundingBox();

        // One ends, other starts or they overlap. 
        // In this case (Passkey -> SSO), Passkey ends before SSO starts or they overlap.
        // The midpoint segment X would be between them.
        const midX = (box1!.x + box1!.width + box2!.x) / 2;
        
        // Label should be offset from the midpoint (which is where the vertical segment is)
        // We offset by 30px in the code.
        const labelMidX = labelBox!.x + labelBox!.width / 2;
        const distance = Math.abs(labelMidX - midX);
        
        console.log(`Label MidX: ${labelMidX}, Estimated Path MidX: ${midX}, Distance: ${distance}`);
        expect(distance).toBeGreaterThan(15);
    });
});
