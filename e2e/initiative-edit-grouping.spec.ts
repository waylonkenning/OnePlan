import { test, expect, Page } from '@playwright/test';

/**
 * US-01: Edit initiative interaction in programme/strategy/DTS phase grouping
 *
 * When grouped by programme, strategy, or DTS phase, single-clicking an
 * initiative should show the edit icon (top-right) and double-clicking should
 * open the Edit Initiative modal — matching the behaviour in group-by-asset.
 */

async function openViewOptions(page: Page) {
  const popover = page.getByTestId('view-options-popover');
  if (!await popover.isVisible()) {
    await page.getByTestId('view-options-btn').click();
    await expect(popover).toBeVisible();
  }
}

async function switchGrouping(page: Page, groupBy: 'programme' | 'strategy' | 'dts-phase') {
  await openViewOptions(page);
  await page.getByTestId(`group-by-${groupBy}`).click();
  // Close popover by clicking the button again (toggle)
  await page.getByTestId('view-options-btn').click();
  await expect(page.getByTestId('view-options-popover')).not.toBeVisible();
}

test.describe('Initiative edit interaction — swimlane groupings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  for (const groupBy of ['programme', 'strategy'] as const) {
    test(`single-click shows edit icon when grouped by ${groupBy}`, async ({ page }) => {
      await switchGrouping(page, groupBy);

      const bar = page.locator('[data-initiative-id]').first();
      await expect(bar).toBeVisible();

      // Single-click to select
      await bar.click();

      // Edit icon should appear
      const editBtn = page.getByTestId('initiative-action-edit');
      await expect(editBtn).toBeVisible();
    });

    test(`clicking edit icon opens Edit Initiative modal when grouped by ${groupBy}`, async ({ page }) => {
      await switchGrouping(page, groupBy);

      const bar = page.locator('[data-initiative-id]').first();
      await expect(bar).toBeVisible();

      // Single-click then click edit icon
      await bar.click();
      await page.getByTestId('initiative-action-edit').click();

      // Initiative panel should open
      await expect(page.getByTestId('initiative-panel')).toBeVisible();
    });

    test(`double-click opens Edit Initiative modal when grouped by ${groupBy}`, async ({ page }) => {
      await switchGrouping(page, groupBy);

      const bar = page.locator('[data-initiative-id]').first();
      await expect(bar).toBeVisible();

      await bar.dblclick();

      await expect(page.getByTestId('initiative-panel')).toBeVisible();
    });
  }
});
