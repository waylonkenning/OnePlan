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
    await page.getByTestId('report-card-initiatives-dependencies').click();
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

    const text = await report.textContent();
    // Sentences must use subject-verb-object form — no "blocks X —" or "general connection"
    expect(text).not.toMatch(/blocks .+ —/);
    expect(text).not.toContain('general connection');
    // Must use one of the three approved sentence patterns
    expect(text).toMatch(/must finish before .+ can start\.|requires .+ to finish first\.|are related\./i);
  });
});

test.describe('Dependency sentence wording', () => {
  // Verifies the three sentence patterns used across report, tooltip, and panel

  test('blocks sentence reads "A must finish before B can start"', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-initiatives-dependencies').click();
    const text = await page.getByTestId('report-dependencies').textContent();
    // Any blocks dependency in demo data should produce this pattern
    if (text?.match(/must finish before/)) {
      expect(text).toMatch(/\w.+ must finish before \w.+ can start\./);
      expect(text).not.toMatch(/\w.+ blocks \w.+ —/);
    }
  });

  test('requires sentence reads "A requires B to finish first"', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-initiatives-dependencies').click();
    const text = await page.getByTestId('report-dependencies').textContent();
    if (text?.match(/requires .+ to finish first/)) {
      expect(text).toMatch(/\w.+ requires \w.+ to finish first\./);
      expect(text).not.toMatch(/requires .+ to be complete/);
    }
  });

  test('mobile tab bar has only Visualiser and Reports tabs', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-tab-bar"]');
    await expect(page.locator('[data-testid="mobile-tab-visualiser"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-reports"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-data"]')).not.toBeVisible();
  });

  test('footer is hidden on mobile', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    const footer = page.locator('footer');
    // Footer must not be visible on mobile (hidden md:flex)
    await expect(footer).toBeHidden();
  });
});
