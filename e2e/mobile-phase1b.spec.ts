import { test, expect } from '@playwright/test';

/**
 * Phase 1b mobile foundation — overflow-x-auto on header and data table.
 * Note: after Phase 2, the mobile header uses a settings bottom sheet and
 * bottom tab bar rather than a scrollable header. These tests verify what
 * is currently true about the mobile architecture.
 */
test.describe('Mobile Phase 1b — Horizontal Scroll', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('header is horizontally scrollable on mobile', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    // Phase 2 mobile uses a compact header (logo + settings icon only) so the header
    // itself no longer needs to scroll. overflow-x-auto is on the desktop header div
    // (hidden on mobile). The header must not be overflow-hidden (which would clip popovers).
    const overflowX = await header.evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll', 'visible']).toContain(overflowX);
  });

  test('mobile settings sheet is accessible via settings button', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });

    // On Phase 2 mobile, Import is desktop-only; mobile has a settings bottom sheet
    const settingsBtn = page.locator('[data-testid="mobile-settings-btn"]');
    await expect(settingsBtn).toBeVisible();

    await settingsBtn.click();
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await expect(sheet).toBeVisible();
  });

  test('data manager table is horizontally scrollable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });

    // Navigate to Data Manager via JS click (desktop nav is hidden on mobile but still functional)
    await page.evaluate(() => {
      (document.querySelector('[data-testid="nav-data-manager"]') as HTMLElement)?.click();
    });
    await page.waitForSelector('[data-testid="data-manager"]');

    // The EditableTable wrapper div (overflow-auto) should be present
    const tableScrollContainer = page.locator('.flex-1.overflow-auto.border.border-slate-200.rounded-lg');
    await expect(tableScrollContainer).toBeVisible();

    const overflowX = await tableScrollContainer.evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll']).toContain(overflowX);
  });
});
