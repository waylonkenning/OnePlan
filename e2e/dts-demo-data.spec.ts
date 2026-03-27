import { test, expect } from '@playwright/test';

/**
 * User Story 16: DTS Template Demo Data
 *
 * AC1: At least 6 initiative bars visible after selecting DTS template
 * AC2: Initiatives appear across at least 3 DTS layers
 * AC3: At least one application lifecycle segment is visible
 * AC4: Specific named initiatives are present
 * AC5: DTS demo data also loads in Mixed template
 */

async function selectTemplate(page: import('@playwright/test').Page, templateId: 'dts' | 'mixed') {
  await page.goto('/');
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId(`template-select-with-demo-btn-${templateId}`).click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

test.describe('DTS Template Demo Data', () => {
  test('AC1: at least 6 initiative bars visible after selecting DTS template', async ({ page }) => {
    await selectTemplate(page, 'dts');
    const bars = page.locator('[data-testid^="initiative-bar"]');
    const count = await bars.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('AC2: initiatives appear across DPI, Channels, and Platforms layers', async ({ page }) => {
    await selectTemplate(page, 'dts');
    // DPI, Channels and Common Consolidated Platforms category rows must exist
    await expect(page.getByTestId('category-row-cat-dts-dpi')).toBeVisible();
    await expect(page.getByTestId('category-row-cat-dts-channels')).toBeVisible();
    await expect(page.getByTestId('category-row-cat-dts-platforms')).toBeVisible();
    // Each layer must have at least one initiative bar
    const dpiCategory = page.locator('[data-testid="category-row-cat-dts-dpi"]');
    await expect(dpiCategory.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    const channelsCategory = page.locator('[data-testid="category-row-cat-dts-channels"]');
    await expect(channelsCategory.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    const platformsCategory = page.locator('[data-testid="category-row-cat-dts-platforms"]');
    await expect(platformsCategory.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
  });

  test('AC3: at least one application lifecycle segment is visible', async ({ page }) => {
    await selectTemplate(page, 'dts');
    await expect(page.locator('[data-testid^="segment-bar-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('AC4: specific named initiatives are visible', async ({ page }) => {
    await selectTemplate(page, 'dts');
    await expect(page.getByText('Service Rules Digitalisation').first()).toBeVisible();
    await expect(page.getByText('Payment Flows Migration to AoG Platform').first()).toBeVisible();
  });

  test('AC5: DTS demo data also loads in Mixed template', async ({ page }) => {
    await selectTemplate(page, 'mixed');
    const bars = page.locator('[data-testid^="initiative-bar"]');
    const count = await bars.count();
    expect(count).toBeGreaterThanOrEqual(6);
    await expect(page.getByText('Service Rules Digitalisation').first()).toBeVisible();
  });
});
