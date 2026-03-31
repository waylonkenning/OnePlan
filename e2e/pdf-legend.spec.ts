import { test, expect } from '@playwright/test';

/**
 * US-07: Legend always shown expanded in PDF export.
 *
 * AC1: When the legend is collapsed and PDF is exported, the legend is
 *      temporarily expanded during capture and then restored to collapsed.
 * AC2: When the legend is already expanded and PDF is exported, the legend
 *      remains expanded after export (state is preserved).
 */

// PDF export can take 30–50 s — give each test ample time.
test.setTimeout(90000);

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
});

// ── AC1 ──────────────────────────────────────────────────────────────────────
test('AC1: PDF export with collapsed legend temporarily expands it then restores collapsed state', async ({ page }) => {
  // Collapse the legend
  const toggle = page.locator('[data-testid="legend-toggle"]');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  const isExpanded = await page.locator('[data-testid="legend-content"]').isVisible();
  if (isExpanded) {
    await toggle.click();
    await expect(page.locator('[data-testid="legend-content"]')).toBeHidden();
  }

  // Verify legend is definitely collapsed before export
  await expect(page.locator('[data-testid="legend-content"]')).toBeHidden();

  // Install a mutation observer BEFORE clicking so we can detect the brief expansion.
  await page.evaluate(() => {
    (window as any).__legendAppearedDuringExport = false;
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-testid="legend-content"]')) {
        (window as any).__legendAppearedDuringExport = true;
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    (window as any).__legendObserver = observer;
  });

  // Trigger PDF export and wait for download
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60000 }),
    page.locator('button[title="Download roadmap as PDF"]').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

  // Legend must have been visible at some point during the export
  const legendAppearedDuringExport = await page.evaluate(() => (window as any).__legendAppearedDuringExport);
  expect(legendAppearedDuringExport).toBe(true);

  // After export, legend must be restored to collapsed state
  await expect(page.locator('[data-testid="legend-content"]')).toBeHidden();
});

// ── AC2 ──────────────────────────────────────────────────────────────────────
test('AC2: PDF export with expanded legend preserves expanded state', async ({ page }) => {
  // Ensure legend is expanded
  const toggle = page.locator('[data-testid="legend-toggle"]');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  const isExpanded = await page.locator('[data-testid="legend-content"]').isVisible();
  if (!isExpanded) {
    await toggle.click();
    await expect(page.locator('[data-testid="legend-content"]')).toBeVisible();
  }

  // Trigger PDF export and wait for download
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60000 }),
    page.locator('button[title="Download roadmap as PDF"]').click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

  // Legend must still be expanded after export
  await expect(page.locator('[data-testid="legend-content"]')).toBeVisible();
});
