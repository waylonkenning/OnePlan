import { test, expect } from '@playwright/test';

/**
 * Application Segment — Label Visible When Segment Starts Before Timeline
 *
 * User Story:
 *   As an IT portfolio manager viewing the timeline, I want lifecycle segment
 *   labels to remain visible at the left edge of the timeline even when the
 *   segment starts before the visible window, so I can always identify what
 *   each segment represents.
 *
 * Acceptance Criteria:
 *   AC1: When a segment starts before the visible timeline window and its bar
 *        extends into the visible area, the segment label is visible at the
 *        left edge of the content area (not clipped off-screen to the left).
 *   AC2: When a segment is fully within the visible window, its label is
 *        positioned normally (at the start of the bar).
 */
test.describe('Segment label clamps to visible edge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC1: Label is visible when segment starts before the timeline window', async ({ page }) => {
    // The demo "Okta In Production" segment starts Jan 1 of last year (relDate(-1,1,1)).
    // Navigate to mid-current-year so the segment's start is well off-screen to the left
    // but its bar still extends into the visible window.
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2026-06-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    // The Okta segment bar should still be visible (its end is 2027-12-31)
    const segBar = page.locator('[data-testid="segment-bar-seg-okta-prod"]');
    await expect(segBar).toBeVisible({ timeout: 5000 });

    // Get the timeline content area left edge (after the sidebar)
    const contentArea = page.locator('[data-testid="application-row-content"]').first();
    const contentBox = await contentArea.boundingBox();
    expect(contentBox).not.toBeNull();

    // The label inside the bar should be within the visible content area
    const label = segBar.locator('[data-testid="segment-label"]');
    await expect(label).toBeVisible();
    const labelBox = await label.boundingBox();
    expect(labelBox).not.toBeNull();

    // Label should not be clipped off to the left of the content area
    expect(labelBox!.x).toBeGreaterThanOrEqual(contentBox!.x - 1); // -1px tolerance
  });

  test('AC2: Label is at the bar start when segment is fully within the window', async ({ page }) => {
    // Navigate to 2026-01-01: Keycloak "Planned" segment starts relDate(0,1,1) = 2026-01-01
    // so it is within the visible window
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2026-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const segBar = page.locator('[data-testid="segment-bar-seg-keycloak-planned"]');
    await expect(segBar).toBeVisible({ timeout: 5000 });

    const label = segBar.locator('[data-testid="segment-label"]');
    await expect(label).toBeVisible();

    // Label x should be close to the bar's left edge (within the bar, near its start)
    const labelBox = await label.boundingBox();
    const barBox = await segBar.boundingBox();
    expect(labelBox).not.toBeNull();
    expect(barBox).not.toBeNull();

    // Label should start within a few pixels of the bar's left edge (the px-2 = 8px padding)
    expect(labelBox!.x - barBox!.x).toBeLessThan(20);
  });
});
