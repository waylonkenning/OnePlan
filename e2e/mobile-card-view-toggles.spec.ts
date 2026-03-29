import { test, expect } from '@playwright/test';

/**
 * Mobile Card View — Display Toggles
 *
 * User Story:
 *   As a mobile user viewing the card view, I want the Descriptions, Budget, and
 *   Relationships toggles in the settings sheet to show/hide that detail on each
 *   initiative row, so I can control how much information is displayed.
 *
 * Acceptance Criteria:
 *   AC1: Descriptions toggle ON  → initiative rows show description text
 *   AC2: Descriptions toggle OFF → description text is hidden
 *   AC3: Budget toggle ON        → initiative rows show formatted budget
 *   AC4: Budget toggle OFF       → budget is hidden
 *   AC5: Relationships toggle ON → initiative rows with deps show related initiative name
 *   AC6: Relationships toggle OFF → relationship info is hidden
 */
test.describe('Mobile Card View — display toggles', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  // i-ciam-passkey: has description, budget $350,000, and is source of dep-1 (blocks i-ciam-sso)
  const INITIATIVE_ID = 'i-ciam-passkey';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    // Ensure the initiative row is visible (expand any collapsed bucket)
    await page.waitForSelector(`[data-testid="initiative-row-${INITIATIVE_ID}"]`, { timeout: 10000 });
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  type Page = import('@playwright/test').Page;

  async function openSettings(page: Page) {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await page.waitForSelector('[data-testid="mobile-settings-sheet"]');
  }

  async function closeSettings(page: Page) {
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { state: 'hidden' });
  }

  /** Toggle an on/off button to the desired state (blue = on, slate = off). */
  async function setToggle(page: Page, testid: string, desiredOn: boolean) {
    const btn = page.locator(`[data-testid="${testid}"]`);
    const currentlyOn = !(await btn.getAttribute('class'))?.includes('text-slate-500');
    if (currentlyOn !== desiredOn) await btn.click();
  }

  /**
   * Cycle the budget button until its text matches the desired mode.
   * Modes cycle: off → label → bar-height → off
   */
  async function setBudgetMode(page: Page, desired: 'off' | 'label' | 'bar-height') {
    const btn = page.locator('[data-testid="mobile-toggle-budget"]');
    for (let i = 0; i < 3; i++) {
      const text = await btn.textContent() ?? '';
      if (text.includes(`Budget: ${desired}`)) return;
      await btn.click();
    }
  }

  // ── AC1 & AC2: Descriptions ────────────────────────────────────────────────

  test('AC1: Descriptions toggle ON shows description text on initiative row', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-descriptions', true);
    await closeSettings(page);

    await expect(
      page.locator(`[data-testid="initiative-description-${INITIATIVE_ID}"]`)
    ).toBeVisible();
  });

  test('AC2: Descriptions toggle OFF hides description text', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-descriptions', false);
    await closeSettings(page);

    await expect(
      page.locator(`[data-testid="initiative-description-${INITIATIVE_ID}"]`)
    ).not.toBeVisible();
  });

  // ── AC3 & AC4: Budget ──────────────────────────────────────────────────────

  test('AC3: Budget toggle ON shows formatted budget on initiative row', async ({ page }) => {
    await openSettings(page);
    await setBudgetMode(page, 'label');
    await closeSettings(page);

    const budgetEl = page.locator(`[data-testid="initiative-budget-${INITIATIVE_ID}"]`);
    await expect(budgetEl).toBeVisible();
    // Should contain the budget value ($350,000)
    await expect(budgetEl).toContainText('350');
  });

  test('AC4: Budget toggle OFF hides budget', async ({ page }) => {
    await openSettings(page);
    await setBudgetMode(page, 'off');
    await closeSettings(page);

    await expect(
      page.locator(`[data-testid="initiative-budget-${INITIATIVE_ID}"]`)
    ).not.toBeVisible();
  });

  // ── AC5 & AC6: Relationships ───────────────────────────────────────────────

  test('AC5: Relationships toggle ON shows related initiative on row', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-relationships', true);
    await closeSettings(page);

    const relEl = page.locator(`[data-testid="initiative-relationships-${INITIATIVE_ID}"]`);
    await expect(relEl).toBeVisible();
    // dep-1: i-ciam-passkey blocks i-ciam-sso (SSO Consolidation)
    await expect(relEl).toContainText('SSO');
  });

  test('AC6: Relationships toggle OFF hides relationship info', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-relationships', false);
    await closeSettings(page);

    await expect(
      page.locator(`[data-testid="initiative-relationships-${INITIATIVE_ID}"]`)
    ).not.toBeVisible();
  });
});
