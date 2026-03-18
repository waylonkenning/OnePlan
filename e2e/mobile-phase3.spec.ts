import { test, expect } from '@playwright/test';

/**
 * Phase 3 — Timeline touch optimisation and panel touch targets.
 */
test.describe('Mobile Phase 3 — Touch Optimisation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  // ── Drag disabled on mobile ───────────────────────────────────────────────

  test('initiative bars have no drag cursor on mobile', async ({ page }) => {
    // On mobile the Visualiser shows MobileCardView (card rows), not draggable timeline bars.
    // Verify initiative rows (cards) are present and have no grab cursor.
    const row = page.locator('[data-testid^="initiative-row-"]').first();
    await expect(row).toBeVisible();
    const cursor = await row.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).not.toBe('grab');
  });

  test('initiative bars do not have resize handles on mobile', async ({ page }) => {
    // MobileCardView has no resize handles — the entire concept of bar resizing
    // is absent on mobile (card-based layout, not timeline bars).
    const handles = page.locator('[data-testid="resize-handle-start"], [data-testid="resize-handle-end"]');
    await expect(handles).toHaveCount(0);
  });

  // ── Panel touch targets ───────────────────────────────────────────────────

  test('InitiativePanel inputs are at least 44px tall on mobile', async ({ page }) => {
    // Open an initiative panel by tapping a card row
    const bar = page.locator('[data-testid^="initiative-row-"]').first();
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
    const bar = page.locator('[data-testid^="initiative-row-"]').first();
    await bar.click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const budgetInput = panel.locator('input[inputmode="numeric"]');
    await expect(budgetInput).toBeVisible();
  });
});
