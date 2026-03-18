import { test, expect } from '@playwright/test';

/**
 * The timeline renders a vertical "Today" line at today's date so planners
 * can immediately orient themselves in time.
 */
test.describe('Today indicator line', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('today indicator is visible when today is within the timeline range', async ({ page }) => {
    // Demo data is always centred around today, so the indicator must be visible
    await expect(page.getByTestId('today-indicator')).toBeVisible();
  });

  test('indicator carries a "Today" label', async ({ page }) => {
    const indicator = page.getByTestId('today-indicator');
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText('Today');
  });

  test('indicator is not rendered when today is before the timeline start', async ({ page }) => {
    // Set timeline start to 5 years in the future — today will be before the range
    const futureStart = new Date();
    futureStart.setFullYear(futureStart.getFullYear() + 5);
    const futureDateStr = futureStart.toISOString().slice(0, 10); // YYYY-MM-DD

    await page.getByLabel('Start').fill(futureDateStr);
    await page.getByLabel('Start').press('Tab');

    // Indicator should no longer be present
    await expect(page.getByTestId('today-indicator')).toBeHidden();
  });

  test('indicator reappears when timeline start is moved back to include today', async ({ page }) => {
    const futureStart = new Date();
    futureStart.setFullYear(futureStart.getFullYear() + 5);
    const futureDateStr = futureStart.toISOString().slice(0, 10);

    // Push start into future — indicator disappears
    await page.getByLabel('Start').fill(futureDateStr);
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeHidden();

    // Set start back to a year ago — indicator should reappear
    const pastStart = new Date();
    pastStart.setFullYear(pastStart.getFullYear() - 1);
    const pastDateStr = pastStart.toISOString().slice(0, 10);

    await page.getByLabel('Start').fill(pastDateStr);
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeVisible();
  });
});
