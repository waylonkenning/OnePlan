import { test, expect } from '@playwright/test';

/**
 * Regression test: if getAllVersions() rejects in ReportsView, the component
 * must display a visible error message rather than silently remaining in the
 * empty/loading state with no feedback to the user.
 */
test.describe('ReportsView — versions load error handling', () => {
  test('shows an error message when versions cannot be loaded from IndexedDB', async ({ page }) => {
    // Set a test hook flag before the page loads so the useEffect simulates a failure
    await page.addInitScript(() => {
      localStorage.setItem('oneplan-test-versions-fail', 'true');
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Navigate to Reports view
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();

    // The History Differences section must show an error, not the silent empty state
    const histDiff = page.getByTestId('report-history-diff');
    await expect(histDiff.getByTestId('versions-load-error')).toBeVisible({ timeout: 5000 });
  });

  test('normal operation shows no error when versions load successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();

    const histDiff = page.getByTestId('report-history-diff');
    await expect(histDiff.getByTestId('versions-load-error')).not.toBeVisible({ timeout: 5000 });
  });
});
