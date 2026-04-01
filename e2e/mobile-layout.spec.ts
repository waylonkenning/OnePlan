import { test, expect } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function waitForMobile(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
}

// ─── Foundation (Phase 1) ─────────────────────────────────────────────────────

test.describe('Mobile layout — foundation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mobile shows card view, not timeline', async ({ page }) => {
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
    await expect(page.locator('#timeline-visualiser')).toBeHidden();
  });

  test('app outer padding is reduced on mobile', async ({ page }) => {
    const root = page.locator('#root > div');
    const paddingLeft = await root.evaluate(el => parseInt(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeLessThanOrEqual(16);
  });

  test('card view renders at least one asset card', async ({ page }) => {
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('[data-testid^="asset-card-"]').first()).toBeVisible();
  });
});

// ─── Horizontal scroll (Phase 1b) ─────────────────────────────────────────────

test.describe('Mobile layout — horizontal scroll', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('header overflow is not clipped', async ({ page }) => {
    await page.goto('/');
    const overflowX = await page.locator('header').evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll', 'visible']).toContain(overflowX);
  });

  test('data manager table is horizontally scrollable', async ({ page }) => {
    await waitForMobile(page);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="nav-data-manager"]') as HTMLElement)?.click();
    });
    await page.waitForSelector('[data-testid="data-manager"]');
    const wrapper = page.getByTestId('initiatives-table-scroll-wrapper');
    await expect(wrapper).toBeVisible();
    const overflowX = await wrapper.evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll']).toContain(overflowX);
  });
});

// ─── Header & settings sheet (Phase 2) ───────────────────────────────────────

test.describe('Mobile layout — header and settings sheet', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('desktop header controls are hidden on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="desktop-header-controls"]')).toBeHidden();
  });

  test('mobile header shows logo and settings button', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-settings-btn"]')).toBeVisible();
  });

  test('tapping settings opens the bottom sheet', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  test('settings sheet contains date and months controls', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await expect(sheet.locator('input[type="date"]')).toBeVisible();
    await expect(sheet.locator('select')).toBeVisible();
  });

  test('settings sheet closes on backdrop tap', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
    await page.locator('[data-testid="mobile-settings-backdrop"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  test('settings sheet closes on Escape', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  test('desktop shows timeline, not card view', async ({ page, browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.goto('/');
    await p.waitForSelector('#timeline-visualiser', { timeout: 15000 });
    await expect(p.locator('#timeline-visualiser')).toBeVisible();
    await expect(p.locator('[data-testid="mobile-card-view"]')).not.toBeVisible();
    await ctx.close();
  });
});

// ─── Bottom tab bar (Phase 2) ─────────────────────────────────────────────────

test.describe('Mobile layout — bottom tab bar', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('tab bar is visible on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-tab-bar"]')).toBeVisible();
  });

  test('tab bar switches to Reports view', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await expect(page.locator('[data-testid="reports-view"]')).toBeVisible();
  });

  test('tab bar switches back to Visualiser', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await page.locator('[data-testid="mobile-tab-visualiser"]').click();
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
  });
});

// ─── Touch optimisation (Phase 3) ─────────────────────────────────────────────

test.describe('Mobile layout — touch optimisation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await waitForMobile(page);
  });

  test('initiative rows have no grab cursor', async ({ page }) => {
    const row = page.locator('[data-testid^="initiative-row-"]').first();
    await expect(row).toBeVisible();
    const cursor = await row.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).not.toBe('grab');
  });

  test('no timeline resize handles are present', async ({ page }) => {
    await expect(page.locator('[data-testid="resize-handle-start"], [data-testid="resize-handle-end"]')).toHaveCount(0);
  });

  test('InitiativePanel inputs are at least 44px tall', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    const box = await panel.locator('input[type="text"]').first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('budget field has inputmode="numeric"', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator('input[inputmode="numeric"]').first()).toBeVisible();
  });
});
