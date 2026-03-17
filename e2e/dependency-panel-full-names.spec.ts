import { test, expect } from '@playwright/test';

/**
 * The source and target initiative names in the Edit Relationship panel
 * must never be truncated — long names must wrap instead of using ellipsis.
 */
test.describe('DependencyPanel — full initiative names', () => {
  test('source and target names have no truncate class', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Click a dependency arrow to open the panel
    const depArrow = page.locator('g[data-dep-id]').first();
    await expect(depArrow).toBeVisible({ timeout: 10000 });
    await depArrow.click();

    const panel = page.getByTestId('dependency-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const sourceName = page.getByTestId('dep-source-name');
    const targetName = page.getByTestId('dep-target-name');

    await expect(sourceName).toBeVisible();
    await expect(targetName).toBeVisible();

    // Neither element should have the 'truncate' CSS class
    const sourceClasses = await sourceName.getAttribute('class');
    const targetClasses = await targetName.getAttribute('class');

    expect(sourceClasses).not.toContain('truncate');
    expect(targetClasses).not.toContain('truncate');
  });
});
