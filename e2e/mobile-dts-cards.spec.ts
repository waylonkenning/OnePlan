import { test, expect } from '@playwright/test';

/**
 * User Story 27: DTS Fields in Mobile Card View
 *
 * AC1: Asset cards show a DTS adoption status badge when the adoption status
 *      display toggle is enabled in mobile settings
 * AC2: Initiative rows show the DTS phase label when a phase is set
 * AC3: The mobile settings sheet includes a "DTS Phase" bucket mode option
 *      (only for DTS workspaces)
 * AC4: The mobile settings sheet includes an "Adoption Status" toggle
 *      (only for DTS workspaces)
 */

// Force mobile viewport for all tests in this file
test.use({ viewport: { width: 390, height: 844 } });

async function simulateFirstRun(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
}

async function loadDtsTemplateMobile(page: import('@playwright/test').Page) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 20000 });
  // Dismiss tutorial modal if it appears (wait briefly for it)
  const tutorialModal = page.getByTestId('tutorial-modal');
  await tutorialModal.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function openMobileSettings(page: import('@playwright/test').Page) {
  await page.getByTestId('mobile-settings-btn').click();
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { timeout: 5000 });
}

test.describe('US-27: DTS Fields in Mobile Card View', () => {

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: mobile settings includes DTS Phase bucket mode for DTS workspaces', async ({ page }) => {
    await loadDtsTemplateMobile(page);
    await openMobileSettings(page);

    // DTS Phase bucket option should be present
    await expect(page.getByTestId('bucket-mode-dts-phase')).toBeVisible();
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: mobile settings includes Adoption Status toggle for DTS workspaces', async ({ page }) => {
    await loadDtsTemplateMobile(page);
    await openMobileSettings(page);

    await expect(page.getByTestId('mobile-toggle-dts-adoption')).toBeVisible();
  });

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: enabling adoption status shows badges on asset cards', async ({ page }) => {
    await loadDtsTemplateMobile(page);
    await openMobileSettings(page);

    // Enable adoption status display
    await page.getByTestId('mobile-toggle-dts-adoption').click();
    await page.getByTestId('mobile-settings-backdrop').click();

    // At least one asset card should now show an adoption status badge
    const badge = page.locator('[data-testid^="mobile-adoption-badge-"]').first();
    await expect(badge).toBeVisible();
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: initiative rows show DTS phase label when phase is set', async ({ page }) => {
    await loadDtsTemplateMobile(page);

    // The demo data has dtsPhase set on all initiatives.
    // At least one initiative row should show a phase label.
    const phaseLabel = page.locator('[data-testid^="initiative-phase-label-"]').first();
    await expect(phaseLabel).toBeVisible();
  });

});
