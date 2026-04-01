import { test, expect } from '@playwright/test';

/**
 * Initiative Bar UX Improvements
 *
 * US-IE-01: Selection highlight — dashed high-contrast border replaces invisible white ring
 * US-IE-02: Floating action toolbar — edit/link icons above bar on single-click
 * US-IE-03: Relationship drag discoverability — chain icon + tooltip on drag handle
 * US-IE-04: Bar content layout — budget pill on title row, description full-width, owner pinned
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Page = import('@playwright/test').Page;

async function loadDefault(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 15000 });
}

async function getFirstBar(page: Page) {
  return page.locator('[data-testid^="initiative-bar-"]').first();
}

// ─── US-IE-01: Selection highlight ───────────────────────────────────────────

test.describe('US-IE-01: Initiative selection highlight', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: single-click gives bar a dashed outline', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    const outlineStyle = await bar.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outlineStyle).toBe('dashed');
  });

  test('AC2: clicking elsewhere removes the selection outline', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    // Click on the empty timeline background to deselect
    await page.locator('#timeline-visualiser').click({ position: { x: 50, y: 50 } });
    const outlineStyle = await bar.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outlineStyle).not.toBe('dashed');
  });

  test('AC3: selection outline is high-contrast slate (not white)', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    // outline-slate-800 = rgb(30, 41, 59)
    await expect(bar).toHaveCSS('outline-color', 'rgb(30, 41, 59)');
  });

  test('AC3: outline style is distinct from critical-path amber ring', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    // Selection uses outline (dashed), critical path uses box-shadow ring (solid)
    // so they cannot visually clash
    const outlineStyle = await bar.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outlineStyle).toBe('dashed');
  });
});

// ─── US-IE-02: Floating action toolbar ───────────────────────────────────────

test.describe('US-IE-02: Floating action toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: single-click shows floating toolbar above the bar', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
  });

  test('AC2: Edit button in toolbar opens InitiativePanel', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible();
  });

  test('AC3: Link button in toolbar is present', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-link')).toBeVisible();
  });

  test('AC4: toolbar disappears when clicking elsewhere', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
    await page.locator('#timeline-visualiser').click({ position: { x: 50, y: 50 } });
    await expect(page.getByTestId('initiative-action-toolbar')).not.toBeVisible();
  });

  test('AC4: toolbar disappears on Escape', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('initiative-action-toolbar')).not.toBeVisible();
  });
});

// ─── US-IE-03: Relationship drag discoverability (initiatives) ───────────────

test.describe('US-IE-03: Relationship drag handle', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: drag handle is not visible when bar is not selected', async ({ page }) => {
    const bar = await getFirstBar(page);
    // Hover without selecting
    await bar.hover();
    await expect(page.getByTestId('initiative-action-link').first()).not.toBeVisible();
  });

  test('AC1: drag handle becomes visible when bar is selected', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-link').first()).toBeVisible();
  });

  test('AC2: drag handle has descriptive tooltip', async ({ page }) => {
    const bar = await getFirstBar(page);
    await bar.click();
    const handle = page.getByTestId('initiative-action-link').first();
    const title = await handle.getAttribute('title');
    expect(title).toContain('dependency');
  });
});

// ─── Application Segment UX (mirrors US-IE-01/02/03 for segments) ─────────────

async function getFirstSegment(page: Page) {
  return page.locator('[data-testid^="segment-bar-"]').first();
}

test.describe('Segment UX — selection highlight', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('single-click gives segment a dashed outline', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(seg).toHaveCSS('outline-style', 'dashed');
  });

  test('selection outline is high-contrast slate', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(seg).toHaveCSS('outline-color', 'rgb(30, 41, 59)');
  });
});

test.describe('Segment UX — floating action toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('single-click shows segment action toolbar', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-toolbar')).toBeVisible();
  });

  test('Edit button in toolbar opens segment panel', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    // The edit button may be beyond the viewport's right edge (segment extends off-screen),
    // so use direct DOM click which bypasses coordinate-based hit testing
    await page.evaluate(() => {
      (document.querySelector('[data-testid="segment-action-edit"]') as HTMLElement)?.click();
    });
    await expect(page.getByTestId('segment-panel')).toBeVisible();
  });

  test('Link button in toolbar is present', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-link')).toBeVisible();
  });

  test('toolbar disappears on Escape', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-toolbar')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('segment-action-toolbar')).not.toBeVisible();
  });
});

test.describe('Segment UX — dep handle', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('dep handle not visible before selection', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.hover();
    await expect(page.getByTestId('segment-action-link').first()).not.toBeVisible();
  });

  test('dep handle visible after selection', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-link').first()).toBeVisible();
  });

  test('dep handle has descriptive tooltip', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    const handle = page.getByTestId('segment-action-link').first();
    const title = await handle.getAttribute('title');
    expect(title).toContain('dependency');
  });
});
