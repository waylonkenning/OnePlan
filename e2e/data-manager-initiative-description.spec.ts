import { test, expect } from '@playwright/test';

/**
 * Data Manager — Initiative Description Column
 *
 * The initiatives table in the Data Manager must include a Description column
 * that allows inline editing. The table must also scroll horizontally when
 * columns overflow the viewport, with a visual fade indicator on the right
 * edge that disappears once the user has scrolled to the end.
 */
test.describe('Data Manager — Initiative Description Column', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 768 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    // Initiatives tab is active by default
  });

  test('Description column header is visible in the initiatives table', async ({ page }) => {
    await expect(
      page.locator('th').filter({ hasText: 'Description' }).first()
    ).toBeVisible();
  });

  test('Description cells render a textarea for editing', async ({ page }) => {
    // The ghost row should have a textarea for the description field
    const ghostTextarea = page.getByTestId('ghost-textarea-description');
    await expect(ghostTextarea).toBeVisible();
  });

  test('typing in a real row description textarea saves the value', async ({ page }) => {
    // Find the first real data row description textarea
    const descTextarea = page.locator('textarea[aria-label="Description"]').first();
    await expect(descTextarea).toBeVisible();

    await descTextarea.click();
    await descTextarea.fill('Test description for initiative');
    await descTextarea.blur();

    // Value should persist after blur
    await expect(descTextarea).toHaveValue('Test description for initiative');
  });

  test('the initiatives table scrolls horizontally when content overflows', async ({ page }) => {
    // The table container (inside EditableTable) should be scrollable
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await expect(tableWrapper).toBeVisible();

    const scrollWidth = await tableWrapper.evaluate(el => el.scrollWidth);
    const clientWidth = await tableWrapper.evaluate(el => el.clientWidth);

    // With the description column added, the table should overflow horizontally
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  test('a scroll fade indicator is visible when the table is horizontally scrollable', async ({ page }) => {
    const fadeIndicator = page.locator('[data-testid="table-scroll-fade-right"]');
    await expect(fadeIndicator).toBeVisible();
  });

  test('the scroll fade indicator disappears after scrolling to the right edge', async ({ page }) => {
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    const fadeIndicator = page.locator('[data-testid="table-scroll-fade-right"]');

    // Scroll to the right edge
    await tableWrapper.evaluate(el => { el.scrollLeft = el.scrollWidth; });

    await expect(fadeIndicator).not.toBeVisible();
  });
});
