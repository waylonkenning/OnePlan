import { test, expect } from '@playwright/test';

test.describe('Capture Feature Screenshots', () => {

  test.beforeEach(async ({ page }) => {
    // E2E flag skips initial tutorial
    await page.addInitScript(() => {
      window.localStorage.setItem('scenia-e2e', 'true');
    });
    // Set a consistent viewport for standard aspect ratios
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    
    // Ensure we're loaded
    await page.waitForSelector('[data-testid="asset-row-content"]');
    
    // Expand a category to ensure consistent layout
    const cisGrp = page.getByRole('button', { name: 'Customer Information Systems' });
    if (await cisGrp.isVisible()) {
      await cisGrp.click();
    }
    
    // Wait for animation
    await page.waitForTimeout(500);
  });

  test('capture screenshots for features modal', async ({ page }) => {
    // Hide UI elements we don't want in screenshots (like the modal buttons)
    // We want the features to be clean
    
    // --- 1. Global Search ---
    const searchInput = page.getByPlaceholder('Search initiatives...');
    await searchInput.fill('SSO');
    await page.waitForTimeout(500); // Wait for filtering
    // Get the bounding box of the header and some of the timeline
    await page.screenshot({ path: 'public/features/global-search.png', clip: { x: 0, y: 0, width: 800, height: 250 } });
    await searchInput.clear();
    await page.waitForTimeout(500);

    // --- 2. View Switching ---
    // Screenshot the toggle buttons
    const navToggles = page.locator('.flex.bg-slate-100.rounded-lg.p-0\\.5.border.border-slate-200').first();
    await navToggles.screenshot({ path: 'public/features/view-switching.png' });

    // --- 3. Drag to Move / Resize ---
    const ssoInitiative = page.locator('div').filter({ hasText: /^SSO Consolidation$/ }).first();
    await ssoInitiative.hover();
    await page.waitForTimeout(200);
    // Take a screenshot of the initiative row
    await page.screenshot({ path: 'public/features/move-resize.png', clip: { x: 200, y: 100, width: 800, height: 200 } });

    // --- 4. Dependency Drawing ---
    // We'll simulate a hover over a dependency line
    const dependencyPath = page.locator('path[stroke-dasharray="4,4"]').first();
    if (await dependencyPath.isVisible()) {
       await dependencyPath.hover();
       await page.waitForTimeout(200);
       await page.screenshot({ path: 'public/features/dependency.png', clip: { x: 200, y: 50, width: 800, height: 400 } });
    } else {
        // Fallback if not visible
        await page.screenshot({ path: 'public/features/dependency.png', clip: { x: 200, y: 50, width: 800, height: 400 } });
    }

    // --- 5. Conflict Detection ---
    // Ensure conflict detection is on (toggle it on if currently off)
    const conflictToggle = page.getByTestId('toggle-conflicts');
    if ((await conflictToggle.getAttribute('data-active')) !== 'true') {
      await conflictToggle.click();
    }
    // Move SSO over Passkey to create a conflict
    const passkey = page.locator('div').filter({ hasText: /^Passkey Rollout$/ }).first();
    const passkeyBox = await passkey.boundingBox();
    const ssoBox = await ssoInitiative.boundingBox();
    
    if (passkeyBox && ssoBox) {
      await page.mouse.move(ssoBox.x + ssoBox.width / 2, ssoBox.y + ssoBox.height / 2);
      await page.mouse.down();
      // Move over passkey
      await page.mouse.move(passkeyBox.x + passkeyBox.width / 2, passkeyBox.y + passkeyBox.height / 2, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      
      // Screenshot the area around the conflict
      await page.screenshot({ path: 'public/features/conflict.png', clip: { x: 200, y: 100, width: 800, height: 300 } });
      
      // Undo the move
      await page.getByTitle('Undo').click();
      await page.waitForTimeout(500);
    }

    // --- 6. Grouped Initiatives ---
    // Turn on budget labels and descriptions via inline toggles
    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
      await budgetToggle.click();
    }
    const descToggle = page.getByTestId('toggle-descriptions');
    if ((await descToggle.getAttribute('data-active')) !== 'true') {
      await descToggle.click();
    }
    await page.waitForTimeout(200);

    // Collapse the PAM asset row
    const ciamLabel = page.getByText('Customer IAM (CIAM)', { exact: true });
    await ciamLabel.click();
    await page.waitForTimeout(500); // Wait for collapse animation

    // Find the grouped initiative and screenshot the row
    await page.screenshot({ path: 'public/features/grouped.png', clip: { x: 200, y: 100, width: 800, height: 200 } });
    
    // Expand it again
    await ciamLabel.click();
    await page.waitForTimeout(500);

    // --- 7. Inline Editing & Column Resizing in Data Manager ---
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await expect(page.getByPlaceholder('Search initiatives...')).toBeVisible();
    await page.waitForTimeout(500);

    // Screenshot the table for inline editing
    await page.screenshot({ path: 'public/features/inline-editing.png', clip: { x: 0, y: 150, width: 1280, height: 400 } });

    // Hover over a column resizer
    const resizer = page.locator('.resize-handle').first();
    await resizer.hover({ force: true });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'public/features/column-resize.png', clip: { x: 0, y: 150, width: 1280, height: 300 } });
    
    console.log('Screenshots captured successfully in public/features/');
  });
});
