/**
 * Screenshot capture script — overwrites all tutorial and feature PNGs.
 * Run with: npx playwright test e2e/capture-screenshots.spec.ts --headed
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const OUT = path.resolve('public');

async function loadAppWithDemoData(page: import('@playwright/test').Page) {
  // Skip landing page and tutorial, use demo data
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('oneplan-e2e', 'true');
    localStorage.setItem('oneplan_has_seen_landing', 'true');
  });
  await page.reload();
  // Wait for timeline to be ready
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

/** Y coordinate where the scrollable timeline content starts (below all header rows). */
async function timelineContentY(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector('.flex-1.overflow-auto');
    return el ? Math.round(el.getBoundingClientRect().top) : 170;
  });
}

/** Y coordinate where the data-manager table content starts (including tab strip). */
async function dataManagerContentY(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    // Tab strip sits above the table — find it
    const tabs = document.querySelector('[data-testid="data-manager-tabs"], .border-b.border-slate-200');
    if (tabs) return Math.max(0, Math.round(tabs.getBoundingClientRect().top) - 4);
    const table = document.querySelector('table');
    return table ? Math.max(0, Math.round(table.getBoundingClientRect().top) - 50) : 130;
  });
}

// ─── TUTORIAL SCREENSHOTS ────────────────────────────────────────────────────

test('tutorial/1-overview — full timeline', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 820 });
  await loadAppWithDemoData(page);
  // Ensure Today indicator and some initiatives are visible
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Let SVG arrows settle
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${OUT}/tutorial/1-overview.png`,
    clip: { x: 0, y: 0, width: 1400, height: 820 },
  });
});

test('tutorial/2-visualiser — timeline zoomed in', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 820 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Zoom in to 12 months for a more detailed, intimate timeline view
  await page.getByTestId('zoom-in').click();
  await page.getByTestId('zoom-in').click();
  await page.getByTestId('zoom-in').click();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${OUT}/tutorial/2-visualiser.png`,
    clip: { x: 0, y: 0, width: 1400, height: 820 },
  });
});

test('tutorial/3-interactive — initiative edit panel open', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 820 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Click the first initiative to open edit panel
  await page.locator('[data-testid="initiative-bar"]').first().click();
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/tutorial/3-interactive.png`,
    clip: { x: 0, y: 0, width: 1400, height: 820 },
  });
});

test('tutorial/5-data-manager — data manager view', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 820 });
  await loadAppWithDemoData(page);
  await page.getByTestId('nav-data-manager').click();
  // Wait for data table
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/tutorial/5-data-manager.png`,
    clip: { x: 0, y: 0, width: 1400, height: 820 },
  });
});

test('tutorial/4-insights — reports view', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 820 });
  await loadAppWithDemoData(page);
  await page.getByTestId('nav-reports').click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: `${OUT}/tutorial/4-insights.png`,
    clip: { x: 0, y: 0, width: 1400, height: 820 },
  });
});

// ─── FEATURE SCREENSHOTS ─────────────────────────────────────────────────────

test('features/dependency — dependency arrows on timeline', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  await page.waitForTimeout(600);
  const y = await timelineContentY(page);
  await page.screenshot({
    path: `${OUT}/features/dependency.png`,
    clip: { x: 0, y, width: 1200, height: 400 },
  });
});

test('features/conflict — overlapping initiatives flagged', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Scroll to Core Ledger / Payments Engine rows which have overlapping initiatives
  await page.evaluate(() => {
    const container = document.querySelector('.flex-1.overflow-auto');
    if (container) container.scrollTop = 800;
  });
  await page.waitForTimeout(500);
  const y = await timelineContentY(page);
  await page.screenshot({
    path: `${OUT}/features/conflict.png`,
    clip: { x: 0, y, width: 1200, height: 400 },
  });
});

test('features/grouped — collapsed asset row', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  // Collapse the first asset row by clicking the collapse button
  const collapseBtn = page.locator('[data-testid="collapse-group-btn"]').first();
  if (await collapseBtn.isVisible()) {
    await collapseBtn.click();
    await page.waitForTimeout(400);
  }
  const y = await timelineContentY(page);
  await page.screenshot({
    path: `${OUT}/features/grouped.png`,
    clip: { x: 0, y, width: 1200, height: 400 },
  });
});

test('features/inline-editing — data manager table', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.getByTestId('nav-data-manager').click();
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  const firstInput = page.locator('table tbody tr[data-real="true"]').first().locator('input').first();
  await firstInput.click();
  await page.waitForTimeout(300);
  const y = await dataManagerContentY(page);
  await page.screenshot({
    path: `${OUT}/features/inline-editing.png`,
    clip: { x: 0, y, width: 1200, height: 400 },
  });
});

test('features/column-resize — data manager column resize handle', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.getByTestId('nav-data-manager').click();
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  const firstTh = page.locator('table thead th').first();
  const box = await firstTh.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  }
  await page.waitForTimeout(300);
  const y = await dataManagerContentY(page);
  await page.screenshot({
    path: `${OUT}/features/column-resize.png`,
    clip: { x: 0, y, width: 1200, height: 400 },
  });
});

test('features/global-search — search bar with results', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.click();
    await searchInput.fill('Cloud');
    await page.waitForTimeout(400);
  }
  // For search: show the nav bar (search input) + filtered timeline results below it
  const y = await timelineContentY(page);
  await page.screenshot({
    path: `${OUT}/features/global-search.png`,
    clip: { x: 0, y: 0, width: 1200, height: y + 280 },
  });
});

test('features/move-resize — initiative bar hovered', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  const bar = page.locator('[data-testid="initiative-bar"]').first();
  await bar.hover();
  await page.waitForTimeout(300);
  const y = await timelineContentY(page);
  await page.screenshot({
    path: `${OUT}/features/move-resize.png`,
    clip: { x: 0, y, width: 1200, height: 400 },
  });
});

test('features/view-switching — header navigation tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Capture just the header area showing nav tabs
  const header = await page.locator('header, [data-testid="app-header"]').first().boundingBox();
  if (header) {
    await page.screenshot({
      path: `${OUT}/features/view-switching.png`,
      clip: { x: 0, y: 0, width: 1200, height: Math.max(header.height + 20, 120) },
    });
  } else {
    await page.screenshot({
      path: `${OUT}/features/view-switching.png`,
      clip: { x: 0, y: 0, width: 1200, height: 100 },
    });
  }
});
