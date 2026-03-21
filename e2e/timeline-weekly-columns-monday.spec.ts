import { test, expect } from '@playwright/test';

/**
 * Timeline — Weekly Columns Start on Monday
 *
 * User Story:
 *   As a user viewing the 3-month timeline, I want week columns to start on
 *   Monday so that the date labels reflect real calendar weeks.
 *
 * Bug:
 *   In 3-month view, week column dates were anchored to the timeline start date
 *   (e.g. Thursday 1 Jan 2026) rather than being snapped to the Monday of that
 *   week (29 Dec 2025). This made the week labels misleading.
 *
 * Acceptance Criteria:
 *   AC1: When the timeline start date is a Thursday (2026-01-01), the first
 *        weekly column in 3-month view shows the Monday of that week (29 Dec).
 *   AC2: The first weekly column date label is always a Monday regardless of
 *        what day of the week the configured start date falls on.
 */
test.describe('Timeline — weekly columns start on Monday', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear IndexedDB so defaults are used
    await page.evaluate(async () => {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) { if (db.name) window.indexedDB.deleteDatabase(db.name); }
    });
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser', { timeout: 15000 });
  });

  test('AC1: first weekly column shows Monday 29 Dec when start date is Thursday 1 Jan 2026', async ({ page }) => {
    // Set start date to 2026-01-01 (a Thursday) and 3-month view
    await page.getByLabel('Start').fill('2026-01-01');
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(300);

    // The first column should be the Monday of that week: 29 Dec 2025
    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toBeVisible();
    await expect(firstCol).toContainText('29 Dec');
  });

  test('AC2: first weekly column date is always a Monday', async ({ page }) => {
    // Use a Wednesday start date: 2026-03-04 (Wednesday)
    await page.getByLabel('Start').fill('2026-03-04');
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(300);

    // Monday of the week containing 2026-03-04 is 2026-03-02
    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toBeVisible();
    await expect(firstCol).toContainText('02 Mar');
  });
});
