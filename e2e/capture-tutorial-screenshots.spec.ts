import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Tutorial Screenshots', () => {
  test('capture screenshots for tutorial modal', async ({ page }) => {
    // Ensure the output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'tutorial');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 1. Overview (Visualiser main view)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.lucide-layout-grid')).toBeVisible(); // Ensure loaded
    await page.screenshot({ path: path.join(outputDir, '1-overview.png') });

    // 2. Visualiser (Zoomed in or specific view)
    // Toggling some settings to show variation
    await page.getByLabel('Months').selectOption('12');
    await page.screenshot({ path: path.join(outputDir, '2-visualiser.png') });

    // 3. Interactive (Hover state)
    // We'll hover over an initiative to show the tooltip/resize handles
    const firstInitiative = page.locator('[data-testid^="initiative-"]').first();
    if (await firstInitiative.isVisible()) {
      await firstInitiative.hover();
      await page.waitForTimeout(500); // Give time for any hover effects
      await page.screenshot({ path: path.join(outputDir, '3-interactive.png') });
    }

    // 4. Insights (Conflict detected)
    // Turn on conflict detection explicitly
    await page.getByLabel('Conflict').selectOption('on');
    // Hover over a conflict marker if present
    const conflictMarker = page.locator('[title*="Conflict detected"]').first();
    if (await conflictMarker.isVisible()) {
      await conflictMarker.hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, '4-insights.png') });
    } else {
      // Fallback if no conflict
      await page.screenshot({ path: path.join(outputDir, '4-insights.png') });
    }

    // 5. Data Manager
    await page.getByTestId('nav-data-manager').click();
    await page.waitForTimeout(500); // Wait for transition
    await page.screenshot({ path: path.join(outputDir, '5-data-manager.png') });

    console.log('Screenshots captured successfully in public/tutorial/');
  });
});
