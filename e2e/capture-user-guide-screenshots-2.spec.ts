/**
 * Captures the 15 screenshots for pages that currently have placeholder text.
 * Run with: npx playwright test e2e/capture-user-guide-screenshots-2.spec.ts --reporter=line
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const OUT = path.resolve('public', 'features');

async function loadApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('scenia-e2e', 'true');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  await page.waitForTimeout(400);
}

// ─── 1. Configuring the timeline window ──────────────────────────────────────

test('configuring-the-window', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Crop to the header strip that contains start-date, months, and zoom buttons
  const startInput = page.locator('[data-testid="timeline-start-input"]');
  const zoomOut = page.locator('[data-testid="zoom-out"]');
  await expect(startInput).toBeVisible({ timeout: 5000 });
  await expect(zoomOut).toBeVisible({ timeout: 5000 });

  const startBox = await startInput.boundingBox();
  const zoomBox  = await zoomOut.boundingBox();
  if (!startBox || !zoomBox) throw new Error('Header controls not found');

  await page.screenshot({
    path: `${OUT}/configuring-the-window.png`,
    clip: {
      x: Math.max(0, startBox.x - 12),
      y: 0,
      width: zoomBox.x + zoomBox.width + 12 - Math.max(0, startBox.x - 12),
      height: Math.max(startBox.y + startBox.height + 12, 56),
    },
  });
});

// ─── 2. Creating an initiative ────────────────────────────────────────────────

test('creating-initiatives', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Double-click a spot in the last asset row to get a less-cluttered view
  const rows = page.locator('[data-testid="asset-row-content"]');
  const count = await rows.count();
  const row = rows.nth(Math.min(2, count - 1));
  await row.dblclick({ position: { x: 500, y: 20 } });
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 8000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/creating-initiatives.png` });
});

// ─── 3. Today indicator ───────────────────────────────────────────────────────

test('today-indicator', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  const indicator = page.locator('[data-testid="today-indicator"]');
  await expect(indicator).toBeVisible({ timeout: 10000 });

  const box = await indicator.boundingBox();
  if (!box) throw new Error('today-indicator not found');

  // Crop: indicator x ± 300px, full height of the timeline content area
  const timelineTop = await page.evaluate(() => {
    const el = document.querySelector('.flex-1.overflow-auto');
    return el ? Math.round(el.getBoundingClientRect().top) : 170;
  });

  await page.screenshot({
    path: `${OUT}/today-indicator.png`,
    clip: {
      x: Math.max(0, box.x - 300),
      y: timelineTop,
      width: 600,
      height: 360,
    },
  });
});

// ─── 4. Inline toggles ───────────────────────────────────────────────────────

test('inline-toggles', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  const conflictsBtn = page.locator('[data-testid="toggle-conflicts"]');
  const budgetBtn    = page.locator('[data-testid="toggle-budget"]');
  await expect(conflictsBtn).toBeVisible({ timeout: 5000 });
  await expect(budgetBtn).toBeVisible({ timeout: 5000 });

  const leftBox  = await conflictsBtn.boundingBox();
  const rightBox = await budgetBtn.boundingBox();
  if (!leftBox || !rightBox) throw new Error('Toggle buttons not found');

  await page.screenshot({
    path: `${OUT}/inline-toggles.png`,
    clip: {
      x: Math.max(0, leftBox.x - 8),
      y: 0,
      width: rightBox.x + rightBox.width + 8 - Math.max(0, leftBox.x - 8),
      height: Math.max(leftBox.y + leftBox.height + 12, 56),
    },
  });
});

// ─── 5. Legend expanded ───────────────────────────────────────────────────────

test('legend', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Make sure the legend is expanded
  const legendContent = page.locator('[data-testid="legend-content"]');
  const isHidden = await legendContent.isHidden();
  if (isHidden) {
    await page.locator('[data-testid="legend-toggle"]').click();
    await page.waitForTimeout(300);
  }
  await expect(legendContent).toBeVisible({ timeout: 5000 });

  const legend = page.locator('[data-testid="timeline-legend"]');
  const box = await legend.boundingBox();
  if (!box) throw new Error('timeline-legend not found');

  await page.screenshot({
    path: `${OUT}/legend.png`,
    clip: {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 8),
      width: box.width + 16,
      height: box.height + 16,
    },
  });
});

// ─── 6. Editing an initiative ─────────────────────────────────────────────────

test('editing-an-initiative', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  const initBar = page.locator('[data-testid^="initiative-bar"]').first();
  await initBar.click();
  await initBar.locator('[data-testid="initiative-edit"]').click();
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 8000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/editing-an-initiative.png` });
});

// ─── 7. Deleting an initiative (confirm modal) ────────────────────────────────

test('deleting-an-initiative', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  const initBar = page.locator('[data-testid^="initiative-bar"]').first();
  await initBar.click();
  await initBar.locator('[data-testid="initiative-edit"]').click();
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 8000 });

  // Click the "Delete Initiative" trash button inside the panel
  await page.getByRole('button', { name: 'Delete Initiative' }).click();
  await page.waitForSelector('[data-testid="confirm-modal"]', { timeout: 5000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/deleting-an-initiative.png` });
});

// ─── 8. Lifecycle segments swimlane ──────────────────────────────────────────

test('lifecycle-segments', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // The first application swimlane (CIAM has Okta, Azure AD B2C, Keycloak)
  const swimlane = page.locator('[data-testid="application-row-content"]').first();
  await expect(swimlane).toBeVisible({ timeout: 10000 });
  await swimlane.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const box = await swimlane.boundingBox();
  if (!box) throw new Error('application-row-content not found');

  // Include some context above (the asset initiatives row)
  await page.screenshot({
    path: `${OUT}/lifecycle-segments.png`,
    clip: {
      x: box.x,
      y: Math.max(0, box.y - 40),
      width: Math.min(box.width, 1200),
      height: box.height + 80,
    },
  });
});

// ─── 9. Managing segments (selected segment) ──────────────────────────────────

test('managing-segments', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Click the first segment bar to select it
  const segBar = page.locator('[data-testid^="segment-bar-"]').first();
  await expect(segBar).toBeVisible({ timeout: 10000 });
  await segBar.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await segBar.click({ force: true });
  await page.waitForTimeout(400);

  // Screenshot the swimlane with the selected bar visible
  const swimlane = page.locator('[data-testid="application-row-content"]').first();
  const box = await swimlane.boundingBox();
  if (!box) throw new Error('swimlane not found');

  await page.screenshot({
    path: `${OUT}/managing-segments.png`,
    clip: {
      x: box.x,
      y: Math.max(0, box.y - 10),
      width: Math.min(box.width, 1200),
      height: box.height + 20,
    },
  });
});

// ─── 10. Adding applications (Data Manager tab) ───────────────────────────────

test('adding-applications', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  await page.getByTestId('nav-data-manager').click();
  await page.getByTestId('data-manager-tab-applications').click();
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  await page.waitForTimeout(300);

  const dm = page.locator('[data-testid="data-manager"]');
  const box = await dm.boundingBox();
  if (!box) throw new Error('data-manager not found');

  await page.screenshot({
    path: `${OUT}/adding-applications.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 700) },
  });
});

// ─── 11. Display mode: Applications Only ──────────────────────────────────────

test('display-mode', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  await page.getByTestId('view-options-btn').click();
  await page.waitForSelector('[data-testid="view-options-popover"]', { timeout: 5000 });
  await page.locator('[data-testid="show-applications"]').click();
  await page.waitForTimeout(500);

  const timelineTop = await page.evaluate(() => {
    const el = document.querySelector('.flex-1.overflow-auto');
    return el ? Math.round(el.getBoundingClientRect().top) : 170;
  });

  await page.screenshot({
    path: `${OUT}/display-mode.png`,
    clip: { x: 0, y: timelineTop, width: 1280, height: 400 },
  });
});

// ─── 12. Editing a dependency (panel open) ────────────────────────────────────

test('editing-dependencies', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Ensure relationship arrows are visible
  const relBtn = page.locator('[data-testid="toggle-relationships"]');
  const isOff = await relBtn.getAttribute('data-active');
  if (isOff === 'false') await relBtn.click();
  await page.waitForTimeout(400);

  // Click the first dependency arrow to open its edit panel
  const arrow = page.locator('[data-dep-id]').first();
  await expect(arrow).toBeVisible({ timeout: 10000 });
  await arrow.click({ force: true });
  await page.waitForSelector('[data-testid="dependency-panel"]', { timeout: 8000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/editing-dependencies.png` });
});

// ─── 13. Dependency types (blocks + requires + related visible) ───────────────

test('dependency-types', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Add a "related" dependency via CSV to ensure all three types appear
  await page.getByTestId('nav-data-manager').click();
  await page.getByTestId('data-manager-tab-dependencies').click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Paste CSV' }).click();
  await page.locator('textarea').fill(
    'id,sourceId,targetId,type\ndep-related-1,i-ciam-passkey,i-eiam-ztna,related'
  );
  await page.getByRole('button', { name: 'Import Rows' }).click();
  await page.waitForTimeout(400);

  await page.getByTestId('nav-visualiser').click();
  await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 15000 });

  // Ensure relationships are on
  const relBtn = page.locator('[data-testid="toggle-relationships"]');
  const isOff = await relBtn.getAttribute('data-active');
  if (isOff === 'false') await relBtn.click();
  await page.waitForTimeout(500);

  // Crop to the SVG+rows that contain the mixed dependency arrows
  const svg = page.locator('[data-testid="dependencies-svg"]');
  const box = await svg.boundingBox();
  if (!box) throw new Error('dependencies-svg not found');

  await page.screenshot({
    path: `${OUT}/dependency-types.png`,
    clip: { x: box.x, y: box.y + 20, width: Math.min(box.width, 1200), height: 340 },
  });
});

// ─── 14. Critical path highlighting ──────────────────────────────────────────

test('critical-path', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Ensure relationships are on first
  const relBtn = page.locator('[data-testid="toggle-relationships"]');
  const isOff = await relBtn.getAttribute('data-active');
  if (isOff === 'false') await relBtn.click();

  await page.locator('[data-testid="toggle-critical-path"]').click();
  await page.waitForTimeout(500);

  const timelineTop = await page.evaluate(() => {
    const el = document.querySelector('.flex-1.overflow-auto');
    return el ? Math.round(el.getBoundingClientRect().top) : 170;
  });

  await page.screenshot({
    path: `${OUT}/critical-path.png`,
    clip: { x: 0, y: timelineTop, width: 1280, height: 380 },
  });
});

// ─── 15. CSV paste dialog ─────────────────────────────────────────────────────

test('csv-paste', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  await page.getByTestId('nav-data-manager').click();
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  await page.getByRole('button', { name: 'Paste CSV' }).click();
  await page.waitForSelector('textarea', { timeout: 5000 });
  await page.waitForTimeout(300);

  // Type a sample CSV so the dialog looks populated
  await page.locator('textarea').fill(
    'id,name,assetId,startDate,endDate,budget\ni-new-1,Cloud Migration Phase 3,a-ciam,2026-10-01,2027-03-31,320000'
  );
  await page.waitForTimeout(200);

  const dm = page.locator('[data-testid="data-manager"]');
  const box = await dm.boundingBox();
  if (!box) throw new Error('data-manager not found');

  await page.screenshot({
    path: `${OUT}/csv-paste.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 700) },
  });
});
