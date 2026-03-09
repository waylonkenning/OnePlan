import { test, expect } from '@playwright/test';

test.describe('Timeline Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(async () => {
      const dbInfo = await window.indexedDB.databases();
      for (const db of dbInfo) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    });
    // Reload to start fresh
    await page.goto('http://localhost:3000');
  });

  test('can configure start year and duration in timeline', async ({ page }) => {
    // Wait for Visualiser to load
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    // Verify default state: 2026 to 2028
    await expect(page.getByTestId('timeline-col-2024-q1')).toHaveCount(0);
    await expect(page.getByTestId('timeline-col-2029-q1')).toHaveCount(0);

    // Settings are now inline in the header — find by label
    const startYearInput = page.getByLabel('Start');
    const yearsInput = page.getByLabel('Years');

    // Check default values
    await expect(startYearInput).toHaveValue('2026');
    await expect(yearsInput).toHaveValue('3');

    // Change settings — they apply immediately, no Save button needed
    await startYearInput.fill('2024');
    await yearsInput.fill('5');

    // Wait for state update
    await page.waitForTimeout(500);

    // Verify the timeline has updated
    await expect(page.getByTestId('timeline-col-2024-q1')).toBeVisible();
    await expect(page.getByTestId('timeline-col-2028-q4')).toBeVisible();

    // Verify it persisted
    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByTestId('timeline-col-2024-q1')).toBeVisible();
    await expect(page.getByTestId('timeline-col-2028-q4')).toBeVisible();
  });
});
