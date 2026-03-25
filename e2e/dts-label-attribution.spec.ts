import { test, expect } from '@playwright/test';

/**
 * User Story 17: DTS Asset Label Wrapping and Attribution
 *
 * AC1: Long DTS asset names wrap rather than truncate
 * AC2: DTS category headers show '© Crown copyright, CC BY 4.0'
 * AC3: Non-DTS category headers do NOT show the DTS attribution note
 */

async function selectDtsTemplate(page: import('@playwright/test').Page) {
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
  await page.getByTestId('template-select-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

test.describe('DTS Label Wrapping and Attribution', () => {
  test('AC1: long DTS asset name is not truncated (no overflow ellipsis)', async ({ page }) => {
    await selectDtsTemplate(page);
    // "Headless Content Management System" is the longest DTS asset name.
    // If truncated it would show as "Headless Content Manag…" — we check the full name is present.
    const label = page.locator('[data-testid="asset-swimlane-label"]')
      .filter({ hasText: 'Headless Content Management System' });
    await expect(label).toBeVisible();
    await expect(label).toContainText('Headless Content Management System');
  });

  test('AC2: DTS category headers show Crown copyright attribution', async ({ page }) => {
    await selectDtsTemplate(page);
    // Every DTS category header should have the attribution note
    const dpiHeader = page.getByTestId('category-drag-handle-cat-dts-dpi');
    await expect(dpiHeader).toContainText('© Crown copyright, CC BY 4.0');
    const platformsHeader = page.getByTestId('category-drag-handle-cat-dts-platforms');
    await expect(platformsHeader).toContainText('© Crown copyright, CC BY 4.0');
  });

  test('AC3: non-DTS category headers do not show DTS attribution', async ({ page }) => {
    // Use the default GEANZ template (E2E mode) which has standard demo categories
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    // The "Identity & Access Management" category is from GEANZ demo, not DTS
    const iamHeader = page.getByTestId('category-drag-handle-cat-iam');
    await expect(iamHeader).not.toContainText('© Crown copyright, CC BY 4.0');
  });
});
