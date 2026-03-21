import { test, expect } from '@playwright/test';

test.describe('Timeline Start Date', () => {
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

  test('can configure exact start date in timeline', async ({ page }) => {
    // Wait for Visualiser to load
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    // Start date input in the header
    const startDateInput = page.getByLabel('Start');

    // Check default value (migrated or default)
    await expect(startDateInput).toHaveValue('2026-01-01');

    // Change start date to 2025-06-15
    await startDateInput.fill('2025-06-15');
    await page.waitForTimeout(500);

    // Verify first column reflects the change
    // When start date is mid-month, weekly view (3 months) should show the exact week
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(500);
    
    const firstCol = page.getByTestId('timeline-col-0');
    // 15 Jun 2025 is a Sunday — weekly columns snap to the Monday of that week (09 Jun)
    await expect(firstCol).toContainText('09 Jun');

    // Verify it persisted after reload
    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByLabel('Start')).toHaveValue('2025-06-15');
  });
});
