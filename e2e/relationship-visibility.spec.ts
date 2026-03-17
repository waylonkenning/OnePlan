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
    // Ensure dependency groups are visible by default
    const depGroups = page.locator('g.cursor-pointer.group');
    await expect(depGroups.first()).toBeAttached();

    const initialCount = await depGroups.count();
    console.log(`Initial dependency groups: ${initialCount}`);
    expect(initialCount).toBeGreaterThan(0);

    // Toggle Relationships off via inline icon toggle
    const relToggle = page.getByTestId('toggle-relationships');
    await relToggle.click();

    // Verify dependency lines are gone
    await expect(depGroups).toHaveCount(0);
  });

  test('Dependency lines should be shown when showRelationships is on', async ({ page }) => {
    const relToggle = page.getByTestId('toggle-relationships');

    // Toggle to 'off' first
    await relToggle.click();
    const depGroups = page.locator('g.cursor-pointer.group');
    // Ensure they are gone
    await expect(depGroups).toHaveCount(0);

    // Toggle back to 'on'
    await relToggle.click();

    // Verify dependency lines are back
    await expect(depGroups.first()).toBeAttached();
    const finalCount = await depGroups.count();
    expect(finalCount).toBeGreaterThan(0);
  });
});
