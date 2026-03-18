import { test, expect } from '@playwright/test';

/**
 * Phase 2 — Mobile header: collapsed controls, settings bottom sheet,
 * and bottom tab bar for view switching.
 */
test.describe('Mobile Phase 2 — Mobile Header', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Header collapse ──────────────────────────────────────────────────────

  test('desktop header controls are hidden on mobile', async ({ page }) => {
    // The dense desktop control row should not be visible on mobile
    const desktopControls = page.locator('[data-testid="desktop-header-controls"]');
    await expect(desktopControls).toBeHidden();
  });

  test('mobile header is visible with logo and icon buttons', async ({ page }) => {
    const mobileHeader = page.locator('[data-testid="mobile-header"]');
    await expect(mobileHeader).toBeVisible();
    await expect(page.locator('[data-testid="mobile-settings-btn"]')).toBeVisible();
  });

  // ── Settings bottom sheet ─────────────────────────────────────────────────

  test('tapping settings icon opens bottom sheet', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  test('settings sheet contains timeline controls', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await expect(sheet).toBeVisible();
    // Start date input
    await expect(sheet.locator('input[type="date"]')).toBeVisible();
    // Months select
    await expect(sheet.locator('select')).toBeVisible();
  });

  test('settings sheet closes when tapping the backdrop', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
    // Tap the backdrop (outside the sheet)
    await page.locator('[data-testid="mobile-settings-backdrop"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  test('settings sheet closes on Escape key', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  // ── Bottom tab bar ────────────────────────────────────────────────────────

  test('bottom tab bar is visible on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-tab-bar"]')).toBeVisible();
  });

  test('bottom tab bar switches to Reports view', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await expect(page.locator('[data-testid="reports-view"]')).toBeVisible();
  });

  test('bottom tab bar switches back to Visualiser', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await page.locator('[data-testid="mobile-tab-visualiser"]').click();
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
  });

  // ── Desktop unchanged ─────────────────────────────────────────────────────

  test('desktop header controls are visible at desktop width', async ({ page, browser }) => {
    const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto('/');
    await expect(desktopPage.locator('[data-testid="desktop-header-controls"]')).toBeVisible();
    await desktopCtx.close();
  });
});
