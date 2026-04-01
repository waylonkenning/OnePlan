import { test, expect, Page } from '@playwright/test';

/**
 * US-06: Entity key uniqueness across all entity types.
 *
 * AC1: Adding new rows to a Data Manager table, saving, reloading, and adding
 *      more rows produces no ID collision — all row IDs remain unique.
 * AC2: All entities loaded from a saved workspace have unique IDs within their type.
 */

async function openDataManager(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  // Open the Data Manager panel
  await page.getByRole('button', { name: /data manager/i }).click();
  await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
}

async function goToTab(page: Page, tabId: string) {
  const tab = page.locator(`[data-testid="data-manager-tab-${tabId}"]`);
  await tab.click();
  await expect(tab).toHaveAttribute('aria-pressed', 'true');
}

/** Returns all data-id values from real rows in the current table. */
async function getRowIds(page: Page): Promise<string[]> {
  const ids = await page.locator('[data-real="true"]').evaluateAll(
    (els) => els.map(el => el.getAttribute('data-id') ?? '')
  );
  return ids.filter(Boolean);
}

// ── AC1 ──────────────────────────────────────────────────────────────────────
test('AC1: new rows added across page reloads have unique IDs', async ({ page }) => {
  await openDataManager(page);
  await goToTab(page, 'programmes');

  // Add first row
  const initialCount = await page.locator('[data-real="true"]').count();
  await page.locator('[data-testid="add-row-btn-programmes"]').click();
  await expect(page.locator('[data-real="true"]')).toHaveCount(initialCount + 1);
  const idsAfterFirstAdd = await getRowIds(page);
  const firstNewId = idsAfterFirstAdd[idsAfterFirstAdd.length - 1];
  expect(firstNewId).toBeTruthy();

  // Reload the page — this resets the in-memory rowIdCounter to 0
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  await page.getByRole('button', { name: /data manager/i }).click();
  await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
  await goToTab(page, 'programmes');

  // Add second row after reload — without a fix this would also get id="new-0"
  const countBeforeSecond = await page.locator('[data-real="true"]').count();
  await page.locator('[data-testid="add-row-btn-programmes"]').click();
  await expect(page.locator('[data-real="true"]')).toHaveCount(countBeforeSecond + 1);
  const idsAfterSecondAdd = await getRowIds(page);
  const secondNewId = idsAfterSecondAdd[idsAfterSecondAdd.length - 1];
  expect(secondNewId).toBeTruthy();

  // The two new rows must have different IDs
  expect(secondNewId).not.toEqual(firstNewId);

  // All IDs in the table must be unique
  const unique = new Set(idsAfterSecondAdd);
  expect(unique.size).toEqual(idsAfterSecondAdd.length);
});

// ── AC2 ──────────────────────────────────────────────────────────────────────
test('AC2: all loaded entities have unique IDs within each type', async ({ page }) => {
  await openDataManager(page);

  const tabs: string[] = [
    'initiatives', 'assets', 'assetCategories', 'programmes',
    'strategies', 'milestones', 'resources', 'applications', 'appStatuses',
  ];

  for (const tab of tabs) {
    await goToTab(page, tab);
    const ids = await getRowIds(page);
    const unique = new Set(ids);
    expect(unique.size).toEqual(ids.length);
  }
});
