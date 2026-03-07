import { test, expect } from '@playwright/test';

test.describe('Labels for Milestones and Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Milestones should display their name as a text label', async ({ page }) => {
    // Review Investment is a default milestone in data.ts
    // We have two labels now (one hidden hover, one always visible)
    const milestoneLabel = page.getByText('Review Investment').first();
    await expect(milestoneLabel).toBeAttached();
    
    // Check if it's positioned near the icon
    const icon = page.locator('.bg-amber-100').first();
    const iconBox = await icon.boundingBox();
    const labelBox = await milestoneLabel.boundingBox();
    
    if (!iconBox || !labelBox) throw new Error("Missing boxes");
    
    // Label should be roughly at same X as icon
    expect(Math.abs(iconBox.x - labelBox.x)).toBeLessThan(100);
  });

  test('Dependency arrows should display relationship labels', async ({ page }) => {
    // Create a dependency first to test labels
    const sourceInit = page.locator('div[title*="Web Channel Integration"]').first();
    const targetInit = page.locator('div[title*="Physical Accept"]').first();

    const sourceBox = await sourceInit.boundingBox();
    const targetBox = await targetInit.boundingBox();

    if (!sourceBox || !targetBox) throw new Error("Could not find initiatives");

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();

    // Now look for the text "blocks" or similar dependency label in the SVG or as a div
    // Depending on implementation, it might be a <text> in SVG
    const dependencyLabel = page.locator('text:has-text("blocks")').first();
    // Use toBeAttached instead of toBeVisible if it's in a pointer-events-none SVG
    await expect(dependencyLabel).toBeAttached();
  });
});
