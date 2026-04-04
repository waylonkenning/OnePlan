import { test, expect } from '@playwright/test';

test.describe('Timeline Create Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(async () => {
            const databases = await window.indexedDB.databases();
            for (const db of databases) {
                if (db.name) window.indexedDB.deleteDatabase(db.name);
            }
        });
        await page.reload();
    });

    test('can double click empty timeline row to open creation panel pre-filled', async ({ page }) => {
        const allDivs = await page.locator('div').all();
        console.log(`Found ${allDivs.length} divs`);

        const timelineRows = page.locator('.group.relative');
        const count = await timelineRows.count();
        console.log(`Found ${count} timeline rows with .group.relative`);

        await expect(timelineRows.first()).toBeVisible();

        const firstRowContent = timelineRows.first().locator('[data-testid="asset-row-content"]');
        await expect(firstRowContent).toBeVisible();

        await firstRowContent.dblclick({ position: { x: 300, y: 20 } });

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();
        await expect(panel.locator('h2')).toContainText('Initiative');

        const nameInput = panel.locator('input[type="text"]').first();
        await expect(nameInput).toHaveValue('');

        const startDateInput = panel.locator('input[type="date"]').first();
        const startDateValue = await startDateInput.inputValue();
        expect(startDateValue).not.toBe('');

        const endDateInput = panel.locator('input[type="date"]').nth(1);
        const endDateValue = await endDateInput.inputValue();
        expect(endDateValue).not.toBe('');

        await nameInput.fill('Timeline Click Built Initiative');
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        await expect(panel).toBeHidden();

        const newBar = page.locator('div[title*="Timeline Click Built Initiative"]');
        await expect(newBar).toBeVisible();
    });
});

test.describe('Timeline Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(async () => {
      const dbInfo = await window.indexedDB.databases();
      for (const db of dbInfo) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    });
    await page.goto('http://localhost:3000');
  });

  test('can configure start year and duration in timeline', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    const startYearInput = page.getByLabel('Start');
    const monthsSelect = page.getByLabel('Months');

    await expect(startYearInput).toHaveValue('2026-01-01');
    await expect(monthsSelect).toHaveValue('36');

    await expect(page.getByTestId('timeline-col-0')).toBeVisible();
    await expect(page.getByTestId('timeline-col-11')).toBeVisible();

    await startYearInput.fill('2024-01-01');
    await startYearInput.press('Enter');

    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toContainText('2024');

    await monthsSelect.selectOption('12');

    await expect(page.getByTestId('timeline-col-0')).toBeVisible();
    await expect(page.getByTestId('timeline-col-11')).toBeVisible();
    await expect(page.getByTestId('timeline-col-0')).toContainText('Jan');

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByLabel('Months')).toHaveValue('12');
    await expect(page.getByLabel('Start')).toHaveValue('2024-01-01');
  });

  test('timeline dynamically extends columns to fit out-of-bounds initiatives', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    await page.getByLabel('Months').selectOption('3');

    const outOfBoundsCol = page.getByTestId('timeline-col-20');
    await expect(outOfBoundsCol).toBeVisible();

    await page.getByRole('button', { name: 'Data Manager' }).click();

    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Milestones' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');

    await expect(page.getByTestId('timeline-col-12')).toBeVisible();
    await expect(page.getByTestId('timeline-col-20')).not.toBeVisible();
  });
});

test.describe('Timeline Start Date', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(async () => {
      const dbInfo = await window.indexedDB.databases();
      for (const db of dbInfo) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    });
    await page.goto('http://localhost:3000');
  });

  test('can configure exact start date in timeline', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    const startDateInput = page.getByLabel('Start');

    await expect(startDateInput).toHaveValue('2026-01-01');

    await startDateInput.fill('2025-06-15');
    await startDateInput.press('Enter');

    await page.getByLabel('Months').selectOption('3');
    
    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toContainText('09 Jun');

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByLabel('Start')).toHaveValue('2025-06-15');
  });
});

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
    await page.evaluate(async () => {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) { if (db.name) window.indexedDB.deleteDatabase(db.name); }
    });
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser', { timeout: 15000 });
  });

  test('AC1: first weekly column shows Monday 29 Dec when start date is Thursday 1 Jan 2026', async ({ page }) => {
    await page.getByLabel('Start').fill('2026-01-01');
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(300);

    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toBeVisible();
    await expect(firstCol).toContainText('29 Dec');
  });

  test('AC2: first weekly column date is always a Monday', async ({ page }) => {
    await page.getByLabel('Start').fill('2026-03-04');
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(300);

    const firstCol = page.getByTestId('timeline-col-0');
    await expect(firstCol).toBeVisible();
    await expect(firstCol).toContainText('02 Mar');
  });
});
