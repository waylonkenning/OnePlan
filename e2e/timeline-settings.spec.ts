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
    const columns = page.locator('#timeline-visualiser .flex-shrink-0.border-r');
    // First column year label
    await expect(columns.locator('.text-xs').first()).toHaveText('2026');
    // We expect 3 years * 4 quarters = 12 column headers + 1 for 'IT Asset'
    // But depending on the exact DOM structure we might have exactly 12 time column divs
    // We can check that 2029 is NOT visible by default
    await expect(page.getByTestId('timeline-col-2024-q1')).toHaveCount(0);
    await expect(page.getByTestId('timeline-col-2029-q1')).toHaveCount(0);

    // Open Data Controls / Settings (We'll add a 'Timeline Settings' button)
    const settingsButton = page.getByRole('button', { name: 'Timeline Settings' });
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();

    // Verify popover/modal appears with inputs
    const startYearInput = page.getByLabel('Start Year');
    const durationInput = page.getByLabel('Years to Show');

    // Check default values
    await expect(startYearInput).toHaveValue('2026');
    await expect(durationInput).toHaveValue('3');

    // Change settings to 2024 and 5 years
    await startYearInput.fill('2024');
    await durationInput.fill('5');

    // Click outside to close or submit if there's a button
    // (We'll implement a 'Save' button in the popover)
    await page.getByRole('button', { name: 'Save Settings' }).click();

    // Verify the timeline has updated
    // 2024 should now be visible
    await expect(page.getByTestId('timeline-col-2024-q1')).toBeVisible();
    // 2028 should still be visible (2024, 25, 26, 27, 28 = 5 years)
    await expect(page.getByTestId('timeline-col-2028-q4')).toBeVisible();

    // Verify persistence across reload
    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByTestId('timeline-col-2024-q1')).toBeVisible();
    await expect(page.getByTestId('timeline-col-2028-q4')).toBeVisible();
  });
});
