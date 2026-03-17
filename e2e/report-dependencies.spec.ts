import { test, expect } from '@playwright/test';

/**
 * The Reports view shows an "Initiatives & Dependencies" report grouped
 * by asset, with plain-language dependency sentences.
 */
test.describe('Initiatives & Dependencies report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('reports-view')).toBeVisible();
  });

  test('report is grouped by asset with asset headings', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toBeVisible();

    // Demo data has Customer IAM (CIAM) as an asset
    await expect(report).toContainText('Customer IAM (CIAM)');
  });

  test('lists initiatives under their asset', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toBeVisible();

    // Passkey Rollout and SSO Consolidation are both on the CIAM asset
    await expect(report).toContainText('Passkey Rollout');
    await expect(report).toContainText('SSO Consolidation');
  });

  test('shows plain-language dependency sentence', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toBeVisible();

    // Demo data has a dependency between Passkey Rollout and SSO Consolidation
    // The sentence should include both initiative names
    await expect(report).toContainText('Passkey Rollout');
    await expect(report).toContainText('SSO Consolidation');

    // The report should contain a relational verb
    const text = await report.textContent();
    const hasRelation = text?.includes('blocks') || text?.includes('requires') || text?.includes('related') || text?.includes('finish') || text?.includes('Blocks') || text?.includes('Requires') || text?.includes('Related');
    expect(hasRelation).toBe(true);
  });
});
