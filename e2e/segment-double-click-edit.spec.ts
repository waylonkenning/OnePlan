import { test, expect } from '@playwright/test';

/**
 * Application Segment — Double-click to Edit
 *
 * User Story:
 *   As a user viewing application lifecycle segments on the timeline, I want to
 *   double-click an existing segment to open the Edit Lifecycle Segment panel,
 *   so I can quickly update its details without first single-clicking to select.
 *
 * Acceptance Criteria:
 *   AC1: Double-clicking an existing application segment opens the Edit panel
 *        (title reads "Edit Lifecycle Segment", not "Add Lifecycle Segment").
 *   AC2: Double-clicking blank space in the swimlane still opens the Add panel
 *        (title reads "Add Lifecycle Segment").
 */
test.describe('Segment double-click to edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC1: Double-clicking an existing segment opens the Edit panel', async ({ page }) => {
    // Use default view which shows demo segments
    const segBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(segBar).toBeVisible({ timeout: 10000 });

    await segBar.dblclick();

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toHaveText('Edit Lifecycle Segment');
  });

  test('AC2: Double-clicking blank swimlane space still opens the Add panel', async ({ page }) => {
    // Navigate to 2030 where there are no demo segments
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toHaveText('Add Lifecycle Segment');
  });
});
