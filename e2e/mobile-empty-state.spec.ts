import { test, expect } from '@playwright/test';

/**
 * User Story: Mobile card view empty state distinguishes "no initiatives"
 * from "initiatives hidden by filters".
 *
 * As a mobile user, I want to know whether an asset card is empty because
 * there are genuinely no initiatives, or because my date filter is hiding them,
 * so I can adjust my settings quickly.
 *
 * Acceptance Criteria:
 * AC1: Asset with no initiatives at all shows "No initiatives".
 * AC2: Asset with initiatives hidden by the date filter shows "X initiatives hidden by filters".
 * AC3: The "filters" text in AC2 is a link/button that opens the settings sheet.
 */
test.describe('Mobile card view — empty state messaging', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  const openSettings = (page: import('@playwright/test').Page) =>
    page.locator('[data-testid="mobile-settings-btn"]').click();

  const closeSettings = (page: import('@playwright/test').Page) =>
    page.locator('[data-testid="mobile-settings-backdrop"]').click({ position: { x: 10, y: 10 } });

  // AC2: Date filter active → shows "hidden by filters" message
  test('shows hidden-by-filters message when date window excludes all initiatives', async ({ page }) => {
    await openSettings(page);
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await sheet.locator('input[type="date"]').fill('2099-01-01');
    await sheet.locator('select').selectOption('36');
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();

    // At least one card should show the filtered empty state
    // At least one card should show the filtered empty state
    await expect(page.locator('[data-testid="card-initiatives-filtered"]').first()).toBeVisible();
    // The plain "No initiatives" message must NOT appear on the CIAM asset (it has initiatives)
    await expect(page.locator('[data-testid="asset-card-a-ciam"] [data-testid="card-no-initiatives"]')).not.toBeVisible();
  });

  // AC2: Message includes the hidden count
  test('filtered empty state shows the number of hidden initiatives', async ({ page }) => {
    // CIAM asset has Passkey Rollout (starts Jan current year) and SSO Consolidation.
    // With start date far in future, both are hidden → message should say "2 initiatives hidden..."
    await openSettings(page);
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await sheet.locator('input[type="date"]').fill('2099-01-01');
    await sheet.locator('select').selectOption('36');
    await closeSettings(page);

    const ciamCard = page.locator('[data-testid="asset-card-a-ciam"]');
    await expect(ciamCard.getByTestId('card-initiatives-filtered')).toContainText('2');
  });

  // AC3: Clicking "filters" link opens the settings sheet
  test('clicking the filters link opens the settings sheet', async ({ page }) => {
    await openSettings(page);
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await sheet.locator('input[type="date"]').fill('2099-01-01');
    await sheet.locator('select').selectOption('36');
    await closeSettings(page);

    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).not.toBeVisible();

    // Click the filters link on any card showing the filtered state
    await page.locator('[data-testid="card-filter-link"]').first().click();

    // Settings sheet should now be open
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  // AC1: With no filter active, the normal "No initiatives" state still works
  // (We test this by verifying that with default settings, no "filtered" message appears)
  test('with default settings no filtered-empty-state is shown', async ({ page }) => {
    // Default settings (Jan 1 current year, 36 months) — all demo initiatives are visible
    await expect(page.locator('[data-testid="card-initiatives-filtered"]')).not.toBeVisible();
  });
});
