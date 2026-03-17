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

    // Settings are now inline in the header — find by label
    const startYearInput = page.getByLabel('Start');
    const monthsSelect = page.getByLabel('Months');

    // Check default values
    await expect(startYearInput).toHaveValue('2026-01-01');
    await expect(monthsSelect).toHaveValue('36');

    // Verify we have 12 quarterly columns (36 months = 12 quarters)
    await expect(page.getByTestId('timeline-col-0')).toBeVisible();
    await expect(page.getByTestId('timeline-col-11')).toBeVisible();

    // Change start date to 2024-01-01
    await startYearInput.fill('2024-01-01');
    await page.waitForTimeout(500);

    // Verify first column now starts at 2024
    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toContainText('2024');

    // Change to 12 months (should show monthly columns)
    await monthsSelect.selectOption('12');
    await page.waitForTimeout(500);

    // Verify we have 12 monthly columns
    await expect(page.getByTestId('timeline-col-0')).toBeVisible();
    await expect(page.getByTestId('timeline-col-11')).toBeVisible();
    // First column should show "Jan"
    await expect(page.getByTestId('timeline-col-0')).toContainText('Jan');

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByLabel('Months')).toHaveValue('12');
    await expect(page.getByLabel('Start')).toHaveValue('2024-01-01');
  });

  test('timeline dynamically extends columns to fit out-of-bounds initiatives', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    // Set to 3 months (Weekly view, normally 12 columns max)
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(500);

    // Initial check: Since we have demo data that extends past 3 months (e.g. 2+ years of data),
    // the timeline should ALREADY have way more than 12 columns generated.

    // We can verify this by checking for a column index that would not exist in a strict 3-month view
    // A 3 month view has 12 weeks. If it scaled dynamically, col-20 should exist.
    const outOfBoundsCol = page.getByTestId('timeline-col-20');
    await expect(outOfBoundsCol).toBeVisible();

    // Additionally, verify that if we delete ALL rows, it shrinks back down to the 3 month default
    await page.getByRole('button', { name: 'Data Manager' }).click();

    // Delete initiatives
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // Delete milestones
    await page.getByRole('button', { name: 'Milestones' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // Go back to visualiser
    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');

    // Due to Calendar math, 3 months from Jan 1 equals ~13 weeks.
    // So columns 0 through 12 are visible. We'll assert that column 20 is NO LONGER visible
    // to prove the timeline bounds shrunk.
    await expect(page.getByTestId('timeline-col-12')).toBeVisible();
    await expect(page.getByTestId('timeline-col-20')).not.toBeVisible();
  });
});
