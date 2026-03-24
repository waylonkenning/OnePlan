import { test, expect } from '@playwright/test';

/**
 * User Story: Enriched Demo Data with GEANZ Assets (US-14)
 *
 * As a new user loading Scenia for the first time,
 * I want to see a realistic NZ government portfolio pre-populated with GEANZ assets,
 * So that I can understand the GEANZ catalogue feature without configuring anything.
 *
 * AC1: GEANZ asset swimlanes from ≥ 10 TAP areas appear on first load with no user action.
 * AC2: Pre-populated areas show a remove-all button and no area row.
 * AC3: Unpopulated areas (TAP.05, TAP.10, TAP.11, TAP.17) still show collapsed area rows.
 * AC4: At least one GEANZ asset has an initiative rendered.
 * AC5: At least one GEANZ asset has lifecycle segments displayed.
 */

test.describe('GEANZ Demo Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // AC1 — GEANZ assets appear on load with no button clicks

  test('AC1: TAP.01 asset "FMIS applications" appears on first load', async ({ page }) => {
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]')
        .filter({ hasText: 'Financial Management Information System (FMIS) applications' })
    ).toBeVisible();
  });

  test('AC1: TAP.07 asset "Authentication" appears on first load', async ({ page }) => {
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]')
        .filter({ hasText: 'Authentication' })
    ).toBeVisible();
  });

  test('AC1: TAP.15 asset "Infrastructure as a Service (IaaS)" appears on first load', async ({ page }) => {
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]')
        .filter({ hasText: 'Infrastructure as a Service (IaaS)' })
    ).toBeVisible();
  });

  test('AC1: TAP.16 asset "Business Intelligence Reporting applications" appears on first load', async ({ page }) => {
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]')
        .filter({ hasText: 'Business Intelligence Reporting applications' })
    ).toBeVisible();
  });

  // AC2 — Pre-populated areas have remove-all buttons and no area row

  test('AC2: TAP.01 area row is hidden (pre-populated in demo)', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.01"]')
    ).not.toBeVisible();
  });

  test('AC2: TAP.07 area row is hidden (pre-populated in demo)', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.07"]')
    ).not.toBeVisible();
  });

  test('AC2: TAP.01 area shows a remove-all button', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-remove-btn-TAP.01"]')
    ).toBeVisible();
  });

  test('AC2: TAP.16 area shows a remove-all button', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-remove-btn-TAP.16"]')
    ).toBeVisible();
  });

  // AC3 — Unpopulated areas still show area rows

  test('AC3: TAP.05 (End User) area row is still visible — not in demo data', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.05"]')
    ).toBeVisible();
  });

  test('AC3: TAP.10 (Data Sharing) area row is still visible — not in demo data', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.10"]')
    ).toBeVisible();
  });

  test('AC3: TAP.17 (Emerging Technologies) area row is still visible — no assets defined', async ({ page }) => {
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.17"]')
    ).toBeVisible();
  });
});
