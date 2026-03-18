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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Open View Options popover to access colour-by controls
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();

    // Initial mode is 'By Programme' — its button should appear active
    const byProgBtn = page.getByRole('button', { name: 'By Programme' });
    const byStratBtn = page.getByRole('button', { name: 'By Strategy' });
    await expect(byProgBtn).toHaveClass(/bg-blue/);

    // Click By Strategy
    await byStratBtn.click();
    await expect(byStratBtn).toHaveClass(/bg-indigo/);

    // Check if legend updated (e.g. 'Customer First' is a strategy name)
    await expect(page.getByText('Strategies:').first()).toBeVisible();
    await expect(page.getByText('Customer First').first()).toBeVisible();
  });

  test('Conflict Detection', async ({ page }) => {
    // Navigate to data manager to create a conflict
    await page.getByRole('button', { name: 'Data Manager' }).click();

    // Clear initiatives and add two overlapping ones on the same asset
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    // Ensure significant overlap within 2026-2028 range
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name,assetId,startDate,endDate,budget\nconf-1,Conflict A,a-ciam,2026-04-01,2026-12-31,100\nconf-2,Conflict B,a-ciam,2026-04-01,2026-12-31,100`);

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

  test('Conflict markers layering', async ({ page }) => {
    // Navigate to ensure we have a conflict (similar to above)
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name,assetId,startDate,endDate,budget\nconf-1,Conflict A,a-ciam,2026-04-01,2026-12-31,100\nconf-2,Conflict B,a-ciam,2026-04-01,2026-12-31,100`);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Import Rows' }).click();
    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');

    // Find a conflict marker container (z-0)
    const markerContainer = page.locator('div.z-0:has-text("Conflict Detected")').first();
    await expect(markerContainer).toBeVisible({ timeout: 10000 });

    // Get the z-index of the conflict marker
    const markerZIndex = await markerContainer.evaluate(el => window.getComputedStyle(el).zIndex);
    
    // Find a sticky asset label (z-30)
    const stickyLabel = page.locator('div.sticky.left-0.z-30').first();
    await expect(stickyLabel).toBeVisible();
    
    const labelZIndex = await stickyLabel.evaluate(el => window.getComputedStyle(el).zIndex);

    // Conflict marker (0) should be behind sticky label (20)
    expect(parseInt(markerZIndex)).toBeLessThan(parseInt(labelZIndex));
  });

  test('Timeline renders correctly when an initiative has an invalid date', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // Import an initiative with a valid date and one with an empty/invalid endDate
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    const textarea = page.locator('textarea');
    await textarea.fill(`id,name,assetId,startDate,endDate,budget\ngood-1,Good Initiative,a-ciam,2026-01-01,2026-06-30,0\nbad-1,Bad Date Initiative,a-ciam,2026-01-01,,0`);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Import Rows' }).click();

    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('#timeline-visualiser');

    // The timeline should still render — column headers should be visible
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-col-0"]')).toBeVisible();
  });

  test('Milestones Render Correctly', async ({ page }) => {
    // Check if default milestone 'DR Failover Test' is rendered
    // Warning is amber (bg-amber-100)
    await expect(page.locator('.bg-amber-100').first()).toBeVisible();
  });

  test('Initiative Resizing Persistence', async ({ page }) => {
    await page.waitForSelector('#timeline-visualiser');

    // Find the first initiative bar
    const initiative = page.locator('div[title*="Passkey Rollout"]').first();

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
    await page.waitForTimeout(100);
    await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2, { steps: 25 });
    await page.waitForTimeout(100);
    await page.mouse.up();

    // Wait for state to settle
    await page.waitForTimeout(1000);

    // Width should be larger now
    const newBox = await initiative.boundingBox();
    expect(newBox!.width).toBeGreaterThan(initialBox.width + 50);

    // Refresh and check if the width is still larger (persisted)
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForTimeout(1000);
    const persistedInitiative = page.locator('div[title*="Passkey Rollout"]').first();
    const persistedBox = await persistedInitiative.boundingBox();
    expect(persistedBox!.width).toBeGreaterThan(initialBox.width + 50);
  });
});
