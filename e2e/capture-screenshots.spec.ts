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
  await page.screenshot({
    path: `${OUT}/features/dependency.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
  });
});

test('features/conflict — overlapping initiatives flagged', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Scroll the timeline scroll container to reveal Core Ledger / Payments Engine rows
  await page.evaluate(() => {
    // The timeline uses a flex-1 overflow-auto container
    const container = document.querySelector('.flex-1.overflow-auto');
    if (container) container.scrollTop = 800;
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${OUT}/features/conflict.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
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
  await page.screenshot({
    path: `${OUT}/features/grouped.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
  });
});

test('features/inline-editing — data manager table', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.getByTestId('nav-data-manager').click();
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  // Click into first cell to show editing
  const firstInput = page.locator('table tbody tr[data-real="true"]').first().locator('input').first();
  await firstInput.click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/features/inline-editing.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
  });
});

test('features/column-resize — data manager column resize handle', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.getByTestId('nav-data-manager').click();
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  // Hover over the border between first and second column headers to show resize cursor
  const firstTh = page.locator('table thead th').first();
  const box = await firstTh.boundingBox();
  if (box) {
    // Hover right at the right edge of the first header (resize handle zone)
    await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  }
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/features/column-resize.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
  });
});

test('features/global-search — search bar with results', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Open search if there's a search input/button
  const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.click();
    await searchInput.fill('Cloud');
    await page.waitForTimeout(400);
  } else {
    // Try clicking a search button
    const searchBtn = page.locator('[data-testid="search-btn"], [aria-label*="Search"]').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(200);
      const input = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      await input.fill('Cloud');
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({
    path: `${OUT}/features/global-search.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
  });
});

test('features/move-resize — initiative bar selected/focused', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 700 });
  await loadAppWithDemoData(page);
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
  // Hover over an initiative bar to show resize handles
  const bar = page.locator('[data-testid="initiative-bar"]').first();
  await bar.hover();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: `${OUT}/features/move-resize.png`,
    clip: { x: 0, y: 0, width: 1200, height: 700 },
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
