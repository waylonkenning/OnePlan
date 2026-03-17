import { test, expect } from '@playwright/test';

/**
 * Phase 3 — Timeline touch optimisation and panel touch targets.
 */
test.describe('Mobile Phase 3 — Touch Optimisation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]');
  });

  // ── Drag disabled on mobile ───────────────────────────────────────────────

  test('initiative bars have no drag cursor on mobile', async ({ page }) => {
    // On desktop bars have cursor-grab; on mobile they should not
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible();
    const cursor = await bar.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).not.toBe('grab');
  });

  test('initiative bars do not have resize handles on mobile', async ({ page }) => {
    // Resize handle divs should not be rendered on mobile
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible();
    const handles = bar.locator('[data-testid="resize-handle-start"], [data-testid="resize-handle-end"]');
    await expect(handles).toHaveCount(0);
  });

  // ── Panel touch targets ───────────────────────────────────────────────────

  test('InitiativePanel inputs are at least 44px tall on mobile', async ({ page }) => {
    // Open an initiative panel by tapping a bar
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Check first text input height
    const input = panel.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('budget field has inputmode="numeric"', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const budgetInput = panel.locator('input[inputmode="numeric"]');
    await expect(budgetInput).toBeVisible();
  });
});
