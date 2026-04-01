import { test, expect } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openDataManager(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  await page.getByTestId('nav-data-manager').click();
  await expect(page.getByTestId('data-manager')).toBeVisible();
}

// ─── Tab strip ────────────────────────────────────────────────────────────────

test.describe('Data Manager — tab strip', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

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

  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('all tabs are visible within the 1024px viewport', async ({ page }) => {
    for (const tabId of tabs) {
      const tab = page.getByTestId(`data-manager-tab-${tabId}`);
      await expect(tab).toBeVisible();
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x + box!.width).toBeLessThanOrEqual(1024 + 1); // 1px tolerance
    }
  });

  test('tab container does not require horizontal scrolling', async ({ page }) => {
    const tabContainer = page.locator('[data-testid="data-manager"] > div').first();
    const scrollWidth = await tabContainer.evaluate(el => el.scrollWidth);
    const clientWidth = await tabContainer.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('all tabs are clickable and activate the correct table', async ({ page }) => {
    for (const tabId of tabs) {
      const tab = page.getByTestId(`data-manager-tab-${tabId}`);
      await tab.click();
      // Active tab has blue bottom border (border-blue-500 = rgb(59, 130, 246))
      // toHaveCSS retries until the style resolves, handling async React updates
      await expect(tab).toHaveCSS('border-bottom-color', 'rgb(59, 130, 246)');
    }
  });
});

// ─── Column headers ───────────────────────────────────────────────────────────

test.describe('Data Manager — initiatives column headers', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  const expectedHeaders = [
    'Initiative Name',
    'Asset',
    'Programme',
    'Strategy',
    'Start Date',
    'End Date',
    'CapEx ($)',
    'OpEx ($)',
    'Status',
    'Progress (%)',
    'Owner',
    'Placeholder?',
  ];

  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('all initiative column headers are visible', async ({ page }) => {
    for (const header of expectedHeaders) {
      await expect(page.locator('th').filter({ hasText: header }).first()).toBeVisible();
    }
  });

  test('Progress and Owner headers do not overlap', async ({ page }) => {
    const progressBox = await page.locator('th').filter({ hasText: 'Progress (%)' }).first().boundingBox();
    const ownerBox = await page.locator('th').filter({ hasText: 'Owner' }).first().boundingBox();
    expect(progressBox).not.toBeNull();
    expect(ownerBox).not.toBeNull();
    expect(ownerBox!.x).toBeGreaterThanOrEqual(progressBox!.x + progressBox!.width - 1);
  });
});

// ─── Description column & horizontal scroll ───────────────────────────────────

test.describe('Data Manager — description column and scroll', () => {
  test.use({ viewport: { width: 1280, height: 768 } });

  test.beforeEach(async ({ page }) => {
    await openDataManager(page);
  });

  test('Description column header is visible', async ({ page }) => {
    await expect(page.locator('th').filter({ hasText: 'Description' }).first()).toBeVisible();
  });

  test('Description cells render a textarea for editing', async ({ page }) => {
    await expect(page.getByTestId('ghost-textarea-description')).toBeVisible();
  });

  test('typing in a description textarea saves the value', async ({ page }) => {
    const descTextarea = page.locator('textarea[aria-label="Description"]').first();
    await expect(descTextarea).toBeVisible();
    await descTextarea.click();
    await descTextarea.fill('Test description for initiative');
    await descTextarea.blur();
    await expect(descTextarea).toHaveValue('Test description for initiative');
  });

  test('initiatives table scrolls horizontally when content overflows', async ({ page }) => {
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await expect(tableWrapper).toBeVisible();
    const scrollWidth = await tableWrapper.evaluate(el => el.scrollWidth);
    const clientWidth = await tableWrapper.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  test('scroll fade indicator is visible when table overflows', async ({ page }) => {
    await expect(page.locator('[data-testid="table-scroll-fade-right"]')).toBeVisible();
  });

  test('scroll fade indicator disappears after scrolling to the right edge', async ({ page }) => {
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await tableWrapper.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await expect(page.locator('[data-testid="table-scroll-fade-right"]')).not.toBeVisible();
  });
});
