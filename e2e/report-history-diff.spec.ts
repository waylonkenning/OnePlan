import { test, expect } from '@playwright/test';

/**
 * The Reports view includes a "History Differences" section where
 * the user can select a saved version and run a diff report inline.
 */
test.describe('History Differences report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('Reports view shows History Differences section', async ({ page }) => {
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('report-history-diff')).toBeVisible();
  });

  test('shows empty state when no versions are saved', async ({ page }) => {
    await page.getByTestId('nav-reports').click();
    const section = page.getByTestId('report-history-diff');
    await expect(section).toBeVisible();
    await expect(section).toContainText('No saved versions');
  });

  test('shows version selector after saving a version', async ({ page }) => {
    // Save a version via the History button
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Test Snapshot');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // Navigate to Reports
    await page.getByTestId('nav-reports').click();
    const section = page.getByTestId('report-history-diff');
    await expect(section).toBeVisible();

    // Version selector should be visible
    await expect(section.getByTestId('version-select')).toBeVisible();
    await expect(section).toContainText('Test Snapshot');
  });

  test('running the diff report shows results inline', async ({ page }) => {
    // Save a version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Baseline Snapshot');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // Rename an initiative to create a difference
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await panel.getByLabel('Initiative Name').fill('Passkey Rollout MODIFIED');
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    // Navigate to Reports and run diff
    await page.getByTestId('nav-reports').click();
    const section = page.getByTestId('report-history-diff');
    await section.getByTestId('version-select').selectOption({ label: 'Baseline Snapshot' });
    await section.getByRole('button', { name: 'Run Difference Report' }).click();

    // The diff result should appear inline
    const diffResult = section.getByTestId('diff-result');
    await expect(diffResult).toBeVisible({ timeout: 5000 });
    await expect(diffResult).toContainText('MODIFIED');
  });
});
