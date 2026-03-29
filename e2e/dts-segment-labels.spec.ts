import { test, expect } from '@playwright/test';

/**
 * User Story 28 / US-30: DTS segment application names and unified model
 *
 * AC1: Each application segment has a meaningful label (not generic status text).
 * AC2: Segments for the same system across phases share the same label.
 * AC3: Timeline renders Application.name on the segment bar.
 * US-30: DTS Application records are visible in the Data Manager Applications tab.
 */

async function loadDtsTemplate(page: import('@playwright/test').Page) {
  await page.goto('/');
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
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  // Dismiss tutorial modal if it appears (shown on first-time template load)
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await tutorialModal.getByRole('button', { name: 'Close' }).click();
  }
}

test.describe('DTS Segment Application Labels', () => {
  test('AC1+AC3: specific application names are visible on the timeline', async ({ page }) => {
    await loadDtsTemplate(page);

    // Identity row
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'RealMe+' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Legacy IdP' }).first()).toBeVisible();

    // Notifications row
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Notify.govt.nz' }).first()).toBeVisible();

    // Agency Portal row
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Agency Portal' }).first()).toBeVisible();

    // AoG channel
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Govt.nz App' }).first()).toBeVisible();
  });

  test('AC1: remaining application names visible on timeline', async ({ page }) => {
    await loadDtsTemplate(page);

    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'AI Platform' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Services Exchange API' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Legacy Payments Engine' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'Agency ITSM (Standalone)' }).first()).toBeVisible();
    await expect(page.locator('[data-testid="segment-label"]', { hasText: 'On-Premise HRIS' }).first()).toBeVisible();
  });

  test('AC2: same-system segments share their label across production and sunset phases', async ({ page }) => {
    await loadDtsTemplate(page);

    // Payments: both production and sunset segments should show 'Legacy Payments Engine'
    const paymentLabels = page.locator('[data-testid="segment-label"]', { hasText: 'Legacy Payments Engine' });
    await expect(paymentLabels.first()).toBeVisible();
    const count = await paymentLabels.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // ITSM: both production and sunset segments should show 'Agency ITSM (Standalone)'
    const itsmLabels = page.locator('[data-testid="segment-label"]', { hasText: 'Agency ITSM (Standalone)' });
    await expect(itsmLabels.first()).toBeVisible();
    const itsmCount = await itsmLabels.count();
    expect(itsmCount).toBeGreaterThanOrEqual(2);
  });

});

test.describe('US-30: DTS Application records in Data Manager', () => {
  test.describe.configure({ timeout: 60000 });

  test('DTS Application records are visible in Data Manager', async ({ page }) => {
    await loadDtsTemplate(page);

    await page.getByTestId('nav-data-manager').click();
    await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
    await page.getByTestId('data-manager-tab-applications').click();
    // Wait for the applications tab to be rendered (ghost row has assetId select unique to this tab)
    await page.waitForSelector('[data-testid="ghost-select-assetId"]', { timeout: 10000 });

    const rows = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(10);

    // Spot-check application names by reading input values directly
    const nameValues = await page.locator('[data-testid="data-manager"] tbody input[aria-label="Name"]').evaluateAll(
      (els) => els.map(el => (el as HTMLInputElement).value)
    );
    expect(nameValues).toContain('RealMe+');
    expect(nameValues).toContain('Legacy IdP');
  });
});
