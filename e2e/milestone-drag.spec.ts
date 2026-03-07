import { test, expect } from '@playwright/test';

test.describe('Milestone Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Move Milestone horizontally should update its date and persist', async ({ page }) => {
    // Target the 'Review Investment' milestone icon (amber)
    const milestone = page.locator('.bg-amber-100').first();
    const initialBox = await milestone.boundingBox();
    if (!initialBox) throw new Error("Could not find milestone");

    const centerX = initialBox.x + initialBox.width / 2;
    const centerY = initialBox.y + initialBox.height / 2;

    // Drag right by 200px
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 200, centerY, { steps: 10 });
    await page.mouse.up();

    // Wait for state to settle
    await page.waitForTimeout(500);

    // Verify position changed
    const newBox = await milestone.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox.x + 100);

    // Verify persistence after reload
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    const persistedBox = await page.locator('.bg-amber-100').first().boundingBox();
    expect(persistedBox!.x).toBeGreaterThan(initialBox.x + 100);
  });
});
