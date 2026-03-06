import { test, expect } from '@playwright/test';

test.describe('Asset Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Assets should swap positions when dragged', async ({ page }) => {
    // We'll target the "Identity Assets" category
    // Let's verify the initial order in the sidebar
    const sidebarAssetNames = page.locator('.sticky.left-0.w-64 .font-semibold');
    
    // First 2 should be CIAM and PAM
    await expect(sidebarAssetNames.nth(0)).toHaveText('CIAM');
    await expect(sidebarAssetNames.nth(1)).toHaveText('PAM');

    // Find the draggable containers in the sidebar
    const ciamHandle = page.locator('.sticky.left-0.w-64:has-text("CIAM")').filter({ hasText: /CIAM/ }).first();
    const pamHandle = page.locator('.sticky.left-0.w-64:has-text("PAM")').filter({ hasText: /PAM/ }).first();

    const ciamBox = await ciamHandle.boundingBox();
    const pamBox = await pamHandle.boundingBox();

    if (!ciamBox || !pamBox) throw new Error("Could not find bounding boxes");

    // Drag CIAM over PAM
    // We move to center of CIAM, down, move to center of PAM, up
    await page.mouse.move(ciamBox.x + ciamBox.width / 2, ciamBox.y + ciamBox.height / 2);
    await page.mouse.down();
    // Move slightly below PAM's center to trigger the dragover on the bottom half
    await page.mouse.move(pamBox.x + pamBox.width / 2, pamBox.y + pamBox.height / 2 + 5, { steps: 10 });
    await page.mouse.up();

    // Wait for potential state update
    await page.waitForTimeout(1000);

    // After reordering, PAM should be first and CIAM second
    const newFirstName = await sidebarAssetNames.nth(0).innerText();
    const newSecondName = await sidebarAssetNames.nth(1).innerText();

    console.log(`Order after drag: 1: ${newFirstName}, 2: ${newSecondName}`);

    // This is expected to FAIL currently because onUpdateAssets is not passed to Timeline
    expect(newFirstName).toBe('PAM');
    expect(newSecondName).toBe('CIAM');
  });
});
