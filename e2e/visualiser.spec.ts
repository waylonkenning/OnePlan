import { test, expect } from '@playwright/test';

test.describe('Visualiser (Timeline)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    /*
    await page.evaluate(async () => {
      ...
    });
    await page.reload();
    */
  });

  test('Coloring Logic: Toggle Color Mode', async ({ page }) => {
    // Initial mode is 'By Programme'
    const byProgBtn = page.getByRole('button', { name: 'By Programme' });
    const byStratBtn = page.getByRole('button', { name: 'By Strategy' });

    await expect(byProgBtn).toHaveClass(/bg-white text-blue-600/);

    // Click By Strategy
    await byStratBtn.click();
    await expect(byStratBtn).toHaveClass(/bg-white text-indigo-600/);
    
    // Check if legend updated (e.g. 'Customer First' is a strategy name)
    await expect(page.getByText('Strategies:').first()).toBeVisible();
    await expect(page.getByText('Customer First').first()).toBeVisible();
  });

  test('Conflict Detection', async ({ page }) => {
    // Navigate to data manager to create a conflict
    await page.getByRole('button', { name: 'Data Manager' }).click();
    
    // Clear initiatives and add two overlapping ones on the same asset
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear All' }).click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    // Ensure significant overlap within 2026-2028 range
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name,assetId,startDate,endDate,budget\nconf-1,Conflict A,asset-1,2026-04-01,2026-12-31,100\nconf-2,Conflict B,asset-1,2026-04-01,2026-12-31,100`);
    
    await page.waitForTimeout(1000);
    const importBtn = page.getByRole('button', { name: 'Import Rows' });
    await expect(importBtn).toBeEnabled();
    await importBtn.click();
    await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

    // Go back to visualiser
    await page.getByRole('button', { name: 'Visualiser' }).click();

    // Wait for visualiser to load
    await page.waitForSelector('#timeline-visualiser');

    // The conflict marker should be visible
    // It's a div containing an AlertTriangle icon with animate-pulse
    // The specific marker is .bg-red-500.animate-pulse
    await expect(page.locator('.bg-red-500.animate-pulse').first()).toBeVisible({ timeout: 15000 });
  });

  test('Milestones Render Correctly', async ({ page }) => {
    // Check if default milestone 'Review Investment' is rendered
    // Warning is amber (bg-amber-100)
    await expect(page.locator('.bg-amber-100').first()).toBeVisible();
  });

  test('Initiative Resizing Persistence', async ({ page }) => {
    await page.waitForSelector('#timeline-visualiser');

    // Find the first initiative bar
    const initiative = page.locator('div[title*="Web Channel Integration"]').first();
    
    // Get initial position and width
    const initialBox = await initiative.boundingBox();
    if (!initialBox) throw new Error("Could not find bounding box");

    // The handles are absolute positioned divs at left and right
    // Target the right handle specifically
    const rightHandle = initiative.locator('.cursor-ew-resize').nth(1);
    
    await rightHandle.hover();
    const handleBox = await rightHandle.boundingBox();
    if (!handleBox) throw new Error("Could not find handle box");

    // Drag from center of handle
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 200, handleBox.y + handleBox.height / 2);
    await page.mouse.up();

    // Wait for state to settle
    await page.waitForTimeout(1000);

    // Width should be larger now
    const newBox = await initiative.boundingBox();
    expect(newBox!.width).toBeGreaterThan(initialBox.width + 20);

    // Refresh and check if the width is still larger (persisted)
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    const persistedInitiative = page.locator('div[title*="Web Channel Integration"]').first();
    const persistedBox = await persistedInitiative.boundingBox();
    expect(persistedBox!.width).toBeGreaterThan(initialBox.width + 20);
  });
});
