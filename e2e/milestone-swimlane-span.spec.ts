import { test, expect } from '@playwright/test';

/**
 * User Story: Milestone markers span both the initiatives swimlane and the
 * applications swimlane so planners can see how milestones relate to both
 * planned work and the application lifecycle at a glance.
 *
 * Acceptance Criteria:
 *  AC1  When display is 'both', milestone vertical lines extend through the
 *       full height of both swimlanes (initiatives + applications).
 *  AC2  When display is 'initiatives' only, milestone behaviour is unchanged.
 *  AC3  When display is 'applications' only, milestones are visible and span
 *       the applications swimlane.
 *  AC4  The milestone icon badge remains anchored at the top of the swimlane
 *       area (above the applications swimlane).
 */
test.describe('Milestone vertical line spans both swimlanes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC1 – milestone line extends to the bottom of the applications swimlane when display is both', async ({ page }) => {
    // Demo data: a-mobile has milestone ms-4 AND an applications swimlane
    const milestone = page.locator('[data-milestone-id="ms-4"]');
    const appSwimlane = page.locator('[data-testid="application-swimlane-a-mobile"]');

    await expect(milestone).toBeVisible();
    await expect(appSwimlane).toBeVisible();

    const milestoneBox = await milestone.boundingBox();
    const appBox = await appSwimlane.boundingBox();

    expect(milestoneBox).not.toBeNull();
    expect(appBox).not.toBeNull();

    // The milestone container's bottom edge must reach the applications swimlane's bottom edge
    const milestoneBottom = milestoneBox!.y + milestoneBox!.height;
    const appBottom = appBox!.y + appBox!.height;

    expect(milestoneBottom).toBeGreaterThanOrEqual(appBottom - 2);
  });

  test('AC2 – milestone visible and scoped to initiatives swimlane when display is initiatives only', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await page.mouse.click(100, 100); // close popover

    // Applications swimlane hidden
    await expect(page.locator('[data-testid^="application-swimlane-"]')).toHaveCount(0);

    // Milestone still visible
    const milestone = page.locator('[data-milestone-id]').first();
    await expect(milestone).toBeVisible();
  });

  test('AC3 – milestones visible and spanning applications swimlane when display is applications only', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100);

    // Initiatives swimlane hidden
    await expect(page.locator('[data-testid="asset-row-content"]')).toHaveCount(0);

    // Milestone for a-mobile must still be visible
    const milestone = page.locator('[data-milestone-id="ms-4"]');
    const appSwimlane = page.locator('[data-testid="application-swimlane-a-mobile"]');

    await expect(appSwimlane).toBeVisible();
    await expect(milestone).toBeVisible();

    // Milestone container should span the full applications swimlane height
    const milestoneBox = await milestone.boundingBox();
    const appBox = await appSwimlane.boundingBox();

    expect(milestoneBox).not.toBeNull();
    expect(appBox).not.toBeNull();

    expect(milestoneBox!.y).toBeLessThanOrEqual(appBox!.y + 2);
    expect(milestoneBox!.y + milestoneBox!.height).toBeGreaterThanOrEqual(appBox!.y + appBox!.height - 2);
  });

  test('AC4 – milestone badge is positioned above the applications swimlane top edge', async ({ page }) => {
    // In 'both' mode, the badge should live above the applications swimlane,
    // i.e. within the initiatives swimlane area
    const milestone = page.locator('[data-milestone-id="ms-4"]');
    const appSwimlane = page.locator('[data-testid="application-swimlane-a-mobile"]');

    const badge = milestone.locator('[data-testid="milestone-dep-handle"]');
    await expect(badge).toBeVisible();

    const badgeBox = await badge.boundingBox();
    const appBox = await appSwimlane.boundingBox();

    expect(badgeBox).not.toBeNull();
    expect(appBox).not.toBeNull();

    // Badge bottom edge must be at or above the applications swimlane top edge
    expect(badgeBox!.y + badgeBox!.height).toBeLessThanOrEqual(appBox!.y + 2);
  });
});
