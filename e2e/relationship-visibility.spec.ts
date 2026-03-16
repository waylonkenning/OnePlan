import { test, expect } from '@playwright/test';

test.describe('Relationship Visibility Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Load the app and ensure we are on the visualiser view
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
    // Wait for at least one initiative to be visible to ensure data is loaded
    await page.waitForSelector('[data-initiative-id]');
  });

  test('Dependency lines should be hidden when showRelationships is off', async ({ page }) => {
    // Ensure dependencies are visible by default (or check if they are)
    const svg = page.locator('[data-testid="dependencies-svg"]');
    await expect(svg).toBeAttached();

    // Check if at least one dependency line exists initially
    const initialPaths = svg.locator('path[marker-end="url(#arrowhead)"]');
    // Wait for the first one to be attached (it might take a moment due to layout effects)
    await expect(initialPaths.first()).toBeAttached();
    
    const initialCount = await initialPaths.count();
    console.log(`Initial dependency paths: ${initialCount}`);
    expect(initialCount).toBeGreaterThan(0);
    
    // Open Display panel then toggle Relationships to 'off'
    await page.getByRole('button', { name: 'Display' }).click();
    const relationshipsSelect = page.locator('#showRelationships');
    await relationshipsSelect.selectOption('off');

    // Verify dependency lines are gone
    const pathsAfterToggle = svg.locator('path[marker-end="url(#arrowhead)"]');
    await expect(pathsAfterToggle).toHaveCount(0);
  });

  test('Dependency lines should be shown when showRelationships is on', async ({ page }) => {
    // Open Display panel
    await page.getByRole('button', { name: 'Display' }).click();
    const relationshipsSelect = page.locator('#showRelationships');

    // Toggle to 'off' first
    await relationshipsSelect.selectOption('off');
    const svg = page.locator('[data-testid="dependencies-svg"]');
    // Ensure they are gone
    await expect(svg.locator('path[marker-end="url(#arrowhead)"]')).toHaveCount(0);

    // Toggle back to 'on'
    await relationshipsSelect.selectOption('on');
    
    // Verify dependency lines are back
    const pathsAfterToggle = svg.locator('path[marker-end="url(#arrowhead)"]');
    // Wait for them to reappear
    await expect(pathsAfterToggle.first()).toBeAttached();
    
    const finalCount = await pathsAfterToggle.count();
    expect(finalCount).toBeGreaterThan(0);
  });
});
