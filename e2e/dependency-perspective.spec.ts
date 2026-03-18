import { test, expect } from '@playwright/test';

/**
 * Dependency sentences in the Reports view must be perspective-aware:
 * the sentence focuses on the current initiative first and uses
 * "Blocking:" / "Blocked:" / "Required:" / "Required by:" prefixes.
 *
 * Demo data facts used here:
 *  dep-5: i-apigw-v2 (API Gateway v2 Migration) BLOCKS i-apigw-portal (Developer Portal Launch)
 *  dep-7: i-pay-rtp (Real-Time Payments Gateway) REQUIRES i-pay-fraud (Transaction Fraud ML)
 */

test.describe('Perspective-aware dependency sentences in Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('reports-view')).toBeVisible();
    await page.getByTestId('report-card-initiatives-dependencies').click();
  });

  test('blocked initiative shows "Blocked:" sentence with its own name first', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    // Developer Portal Launch is the TARGET of a blocks dep — it is blocked
    // Sentence must read: "Blocked: Developer Portal Launch can't start until API Gateway v2 Migration has finished."
    await expect(report).toContainText("Blocked: Developer Portal Launch can't start until API Gateway v2 Migration has finished.");
  });

  test('blocking initiative shows "Blocking:" sentence with its own name first', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    // API Gateway v2 Migration is the SOURCE of a blocks dep — it is blocking
    // Sentence must read: "Blocking: API Gateway v2 Migration must finish before Developer Portal Launch can start."
    await expect(report).toContainText('Blocking: API Gateway v2 Migration must finish before Developer Portal Launch can start.');
  });

  test('requiring initiative shows "Required:" sentence with its own name first', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    // Real-Time Payments Gateway is the SOURCE of a requires dep
    // Sentence must read: "Required: Real-Time Payments Gateway requires Transaction Fraud ML to start first."
    await expect(report).toContainText('Required: Real-Time Payments Gateway requires Transaction Fraud ML to start first.');
  });

  test('required initiative shows "Required by:" sentence naming both initiatives', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    // Transaction Fraud ML is the TARGET of a requires dep (must start first)
    // Sentence must read: "Required by: Transaction Fraud ML must start first before Real-Time Payments Gateway."
    await expect(report).toContainText('Required by: Transaction Fraud ML must start first before Real-Time Payments Gateway.');
  });

  test('no legacy wording remains', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    // Old patterns must not appear
    expect(text).not.toMatch(/blocks .+ —/);
    expect(text).not.toContain('general connection');
    // Old "requires ... to finish first" wording must be gone (replaced by "to start first")
    expect(text).not.toMatch(/requires .+ to finish first/);
  });
});

test.describe('Perspective-aware labels in InitiativePanel', () => {
  test('blocked initiative panel shows "Blocked:" label', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Click Developer Portal Launch bar to open its panel
    const bar = page.locator('[data-initiative-id="i-apigw-portal"]').first();
    await bar.click();

    const section = page.getByTestId('related-initiatives-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Blocked');
  });

  test('blocking initiative panel shows "Blocking:" label', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Click API Gateway v2 Migration bar
    const bar = page.locator('[data-initiative-id="i-apigw-v2"]').first();
    await bar.click();

    const section = page.getByTestId('related-initiatives-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Blocking');
  });
});
