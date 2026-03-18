import { test, expect } from '@playwright/test';

/**
 * Data Manager — Column Header Rendering
 *
 * All column headers in the initiatives table must be visible without
 * overlapping. The declared column widths were summing to >100%, causing
 * the Progress and Owner headers to collide.
 */
test.describe('Data Manager — Initiatives Table Columns', () => {
  test.beforeEach(async ({ page }) => {
    // Use iPad Pro landscape width to reproduce the header overlap observed on device
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    // Initiatives tab is active by default
  });

  const expectedHeaders = [
    'Initiative Name',
    'Asset',
    'Programme',
    'Strategy',
    'Start Date',
    'End Date',
    'Budget ($)',
    'Status',
    'Progress (%)',
    'Owner',
    'Placeholder?',
  ];

  test('all initiative column headers are visible', async ({ page }) => {
    for (const header of expectedHeaders) {
      await expect(
        page.locator('th').filter({ hasText: header }).first()
      ).toBeVisible();
    }
  });

  test('Progress and Owner headers do not overlap each other', async ({ page }) => {
    const progressHeader = page.locator('th').filter({ hasText: 'Progress (%)' }).first();
    const ownerHeader = page.locator('th').filter({ hasText: 'Owner' }).first();

    const progressBox = await progressHeader.boundingBox();
    const ownerBox = await ownerHeader.boundingBox();

    expect(progressBox).not.toBeNull();
    expect(ownerBox).not.toBeNull();

    // Owner header must start to the right of where Progress header ends
    const progressRight = progressBox!.x + progressBox!.width;
    expect(ownerBox!.x).toBeGreaterThanOrEqual(progressRight - 1); // 1px tolerance
  });
});
