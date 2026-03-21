import { test, expect } from '@playwright/test';

/**
 * Initiative Panel — Date Fields Mobile Layout
 *
 * User Story:
 *   As a mobile user on a narrow iPhone viewport, I want the Start Date and
 *   End Date fields in the initiative edit panel to not overlap, so I can read
 *   and tap both fields clearly.
 *
 * Acceptance Criteria:
 *   AC1: On a 390px viewport the Start Date and End Date inputs do not overlap
 *        (their right/left edges do not cross).
 *   AC2: Both inputs remain side-by-side (each occupies less than 70% of panel
 *        width, confirming a 2-column layout is preserved).
 *
 * Note: The original overlap was only visible in iOS Safari, which renders
 * native date inputs wider than Chromium. These tests serve as regression
 * guards for the layout but cannot reproduce the iOS-specific rendering.
 * The fix (gap-4 → gap-2 on the date grid) reduces the gap between columns
 * so the inputs have more room on narrow viewports.
 */
test.describe('Initiative Panel — date fields do not overlap on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    // Open the first initiative row to trigger the panel
    const firstRow = page.locator('[data-testid^="initiative-row-"]').first();
    await firstRow.click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
  });

  test('AC1: Start Date and End Date inputs do not overlap', async ({ page }) => {
    const startInput = page.locator('#startDate');
    const endInput = page.locator('#endDate');

    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    const startBox = await startInput.boundingBox();
    const endBox = await endInput.boundingBox();

    expect(startBox).not.toBeNull();
    expect(endBox).not.toBeNull();

    // Start input's right edge must not extend past the end input's left edge
    const startRight = startBox!.x + startBox!.width;
    const endLeft = endBox!.x;

    expect(startRight).toBeLessThanOrEqual(endLeft);
  });

  test('AC2: Both date inputs are side-by-side (2-column layout preserved)', async ({ page }) => {
    const startInput = page.locator('#startDate');
    const endInput = page.locator('#endDate');

    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    const startBox = await startInput.boundingBox();
    const endBox = await endInput.boundingBox();

    expect(startBox).not.toBeNull();
    expect(endBox).not.toBeNull();

    // Each input should be less than 70% of the viewport width — confirms side-by-side layout
    expect(startBox!.width).toBeLessThan(390 * 0.7);
    expect(endBox!.width).toBeLessThan(390 * 0.7);

    // Start input should be to the left of end input
    expect(startBox!.x).toBeLessThan(endBox!.x);
  });
});
