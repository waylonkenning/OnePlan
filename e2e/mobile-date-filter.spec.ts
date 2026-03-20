import { test, expect } from '@playwright/test';

/**
 * User Story: Mobile card view start date and months settings filter initiatives.
 *
 * As a mobile user, I want the start date and months settings to filter the
 * initiatives shown in card view, so I only see initiatives relevant to my
 * selected time window.
 *
 * Acceptance Criteria:
 * AC1: Initiatives starting before the settings start date are not shown.
 * AC2: Initiatives ending after start date + monthsToShow are not shown.
 * AC3: Initiatives that start exactly on the start date are shown (if end is within window).
 * AC4: Setting start date far in the future results in no initiatives shown.
 * AC5: Wide 36-month window shows long-running initiatives.
 */
test.describe('Mobile card view — date window filter', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  const openSettings = (page: import('@playwright/test').Page) =>
    page.locator('[data-testid="mobile-settings-btn"]').click();

  const closeSettings = (page: import('@playwright/test').Page) =>
    page.locator('[data-testid="mobile-settings-backdrop"]').click({ position: { x: 10, y: 10 } });

  const setStartDate = async (page: import('@playwright/test').Page, date: string) => {
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    const input = sheet.locator('input[type="date"]');
    await input.fill(date);
  };

  const setMonths = async (page: import('@playwright/test').Page, months: number) => {
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await sheet.locator('select').selectOption(String(months));
  };

  // AC4: Far-future start date → no initiatives visible anywhere
  test('setting start date far in the future hides all initiatives', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();

    const initiativeRows = page.locator('[data-testid^="initiative-row-"]');
    expect(await initiativeRows.count()).toBe(0);

    const noInitiativesMessages = page.locator('[data-testid="card-no-initiatives"]');
    expect(await noInitiativesMessages.count()).toBeGreaterThan(0);
  });

  // AC1: Initiative starting before start date is hidden
  test('initiative starting before the start date is not shown', async ({ page }) => {
    // "Passkey Rollout" starts Jan 1 of the current year.
    // Setting start date to Aug 1 current year excludes it (starts 7 months before).
    const currentYear = new Date().getFullYear();

    await openSettings(page);
    await setStartDate(page, `${currentYear}-08-01`);
    await setMonths(page, 36);
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="initiative-row-i-ciam-passkey"]')).not.toBeVisible();
  });

  // AC2: Initiative ending beyond the window is hidden
  test('initiative ending beyond the months window is not shown', async ({ page }) => {
    // "SSO Consolidation" ends Mar 31 next year (~15 months from Jan 1 current year).
    // With monthsToShow=3, window ends Apr 1 → SSO Consolidation must be hidden.
    const currentYear = new Date().getFullYear();

    await openSettings(page);
    await setStartDate(page, `${currentYear}-01-01`);
    await setMonths(page, 3);
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="initiative-row-i-ciam-sso"]')).not.toBeVisible();
  });

  // AC3: Initiative starting exactly on start date IS shown when it ends within the window
  test('initiative starting exactly on start date is shown when it ends within the window', async ({ page }) => {
    // "API Gateway v2 Migration" starts Jan 1 current year, ends Jun 30 current year (6 months).
    // With start = Jan 1 and monthsToShow = 12, the window fully covers it.
    const currentYear = new Date().getFullYear();

    await openSettings(page);
    await setStartDate(page, `${currentYear}-01-01`);
    await setMonths(page, 12);
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="initiative-row-i-apigw-v2"]')).toBeVisible();
  });

  // AC5: Wide window shows long-running initiatives
  test('36-month window from start of year shows long-running initiatives', async ({ page }) => {
    // "ESB Decommission" starts Jan 1 next year, ends Jun 30 two years from now.
    // With start = Jan 1 current year and 36 months it is fully within the window.
    const currentYear = new Date().getFullYear();

    await openSettings(page);
    await setStartDate(page, `${currentYear}-01-01`);
    await setMonths(page, 36);
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="initiative-row-i-esb-decomm"]')).toBeVisible();
  });
});
