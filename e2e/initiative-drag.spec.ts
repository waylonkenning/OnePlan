import { test, expect } from '@playwright/test';

test.describe('Initiative Interaction Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Move Initiative horizontally should update dates and persist', async ({ page }) => {
    const initiative = page.locator('div[title*="Passkey Rollout"]').first();
    const initialBox = await initiative.boundingBox();
    if (!initialBox) throw new Error("Could not find initiative");

    // Drag from center horizontally
    const centerX = initialBox.x + initialBox.width / 2;
    const centerY = initialBox.y + initialBox.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 150, centerY, { steps: 10 }); // Move right with steps
    await page.mouse.up();

    // Give it a moment to settle
    await page.waitForTimeout(500);

    // Verify position changed
    const newBox = await initiative.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox.x + 50);
    expect(Math.abs(newBox!.width - initialBox.width)).toBeLessThan(5); // Duration should stay roughly same

    // Verify persistence
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    const persistedBox = await page.locator('div[title*="Passkey Rollout"]').first().boundingBox();
    expect(persistedBox!.x).toBeGreaterThan(initialBox.x + 50);
  });

  test('Draw relationship by dragging vertically between initiatives', async ({ page }) => {
    // i-ciam-passkey: Passkey Rollout (Asset Customer IAM (CIAM))
    // i-ciam-sso: SSO Consolidation (Asset Customer IAM (CIAM))
    const sourceInit = page.locator('div[title*="Passkey Rollout"]').first();
    const targetInit = page.locator('div[title*="SSO Consolidation"]').first();

    const sourceBox = await sourceInit.boundingBox();
    const targetBox = await targetInit.boundingBox();

    if (!sourceBox || !targetBox) throw new Error("Could not find initiatives");

    // Start drag on source
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    
    // Drag to target
    // We need to move vertically enough to trigger the "relationship" mode instead of "move" mode
    // Let's move to target center
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    
    // An arrow should be visible during drag (svg path)
    // Actually we'll check for the final dependency line after mouse up
    await page.mouse.up();

    // Check if a dependency line exists in the SVG
    // Dependency lines are paths with marker-end="url(#arrowhead)"
    const dependencyLine = page.locator('svg path[marker-end="url(#arrowhead)"]');
    await expect(dependencyLine.first()).toBeAttached();
  });
});
