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

    // Open Display panel then toggle Relationships to 'off'
    await page.getByRole('button', { name: 'Display' }).click();
    const relationshipsSelect = page.locator('#showRelationships');
    await relationshipsSelect.selectOption('off');

    // Verify dependency lines are gone
    await expect(depGroups).toHaveCount(0);
  });

  test('Dependency lines should be shown when showRelationships is on', async ({ page }) => {
    // Open Display panel
    await page.getByRole('button', { name: 'Display' }).click();
    const relationshipsSelect = page.locator('#showRelationships');

    // Toggle to 'off' first
    await relationshipsSelect.selectOption('off');
    const depGroups = page.locator('g.cursor-pointer.group');
    // Ensure they are gone
    await expect(depGroups).toHaveCount(0);

    // Toggle back to 'on'
    await relationshipsSelect.selectOption('on');

    // Verify dependency lines are back
    await expect(depGroups.first()).toBeAttached();
    const finalCount = await depGroups.count();
    expect(finalCount).toBeGreaterThan(0);
  });
});
