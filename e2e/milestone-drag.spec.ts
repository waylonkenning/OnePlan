import { test, expect } from '@playwright/test';

test.describe('Milestone Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear IndexedDB to ensure fresh state
    await page.evaluate(async () => {
        const dbInfo = await window.indexedDB.databases();
        for (const db of dbInfo) {
            if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
            }
        }
    });
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Move Milestone horizontally should update its date and persist', async ({ page }) => {
    // Target the 'DR Failover Test' milestone container specifically
    const milestoneContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const milestoneIcon = milestoneContainer.locator('[data-testid="milestone-dep-handle"]');
    
    await milestoneIcon.scrollIntoViewIfNeeded();
    const initialBox = await milestoneIcon.boundingBox();
    if (!initialBox) throw new Error("Could not find milestone icon");

    const centerX = initialBox.x + initialBox.width / 2;
    const centerY = initialBox.y + initialBox.height / 2;

    // Drag right by 300px
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 300, centerY, { steps: 60 });
    await page.mouse.up();

    // Verify position changed
    const newBox = await milestoneIcon.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox.x + 200);

    // Verify persistence after reload
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForSelector('[data-testid="milestone-dep-handle"]');
    
    // Look for it again after reload
    const persistedContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const persistedBox = await persistedContainer.locator('[data-testid="milestone-dep-handle"]').boundingBox();
    expect(persistedBox!.x).toBeGreaterThan(initialBox.x + 200);
  });
});
