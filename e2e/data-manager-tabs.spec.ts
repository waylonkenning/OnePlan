import { test, expect } from '@playwright/test';

/**
 * Data Manager — Tab Strip Overflow
 *
 * On narrow viewports (tablet/iPad), all 8 table tabs must be reachable
 * without horizontal scrolling. Tabs should wrap to a second row rather
 * than overflow the container.
 */
test.describe('Data Manager — Tab Strip', () => {
  test.beforeEach(async ({ page }) => {
    // iPad Pro portrait width — where the overflow was observed
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
  });

  const tabs = [
    'initiatives',
    'dependencies',
    'assets',
    'assetCategories',
    'programmes',
    'strategies',
    'milestones',
    'resources',
  ];

  test('all tabs are visible without horizontal scrolling at 1024px', async ({ page }) => {
    for (const tabId of tabs) {
      const tab = page.getByTestId(`data-manager-tab-${tabId}`);
      await expect(tab).toBeVisible();

      // Each tab must be within the viewport width (not scrolled out of view)
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(1024 + 1); // 1px tolerance
    }
  });

  test('tab container does not require horizontal scrolling', async ({ page }) => {
    const tabContainer = page.locator('[data-testid="data-manager"] > div').first();
    const scrollWidth = await tabContainer.evaluate(el => el.scrollWidth);
    const clientWidth = await tabContainer.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px tolerance
  });

  test('all tabs are still clickable and switch the active table', async ({ page }) => {
    for (const tabId of tabs) {
      await page.getByTestId(`data-manager-tab-${tabId}`).click();
      await expect(page.getByTestId(`data-manager-tab-${tabId}`)).toHaveClass(/border-blue-500/);
    }
  });
});
