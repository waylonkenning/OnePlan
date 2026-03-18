/**
 * Captures cropped screenshots for the Features modal.
 * Run with: npx playwright test e2e/capture-feature-screenshots.spec.ts --reporter=line
 *
 * Each screenshot is cropped to the relevant UI element so the image
 * shows exactly what the feature looks like in context.
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const OUT = path.join(process.cwd(), 'public', 'features');

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Capture feature screenshots', () => {
  test('conflict detection — crop to conflict marker row', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Import two overlapping initiatives on the same asset to guarantee a conflict
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.locator('textarea').fill(
      `id,name,assetId,startDate,endDate,budget\nscr-1,Identity Platform Upgrade,a-ciam,2026-03-01,2026-09-30,500000\nscr-2,Passkey Rollout,a-ciam,2026-03-01,2026-09-30,300000`
    );
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Import Rows' }).click();
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForTimeout(800);

    // Crop to the row containing the conflict marker
    const conflictMarker = page.locator('.bg-red-500.animate-pulse').first();
    await expect(conflictMarker).toBeVisible({ timeout: 10000 });

    // Screenshot the asset row that contains the conflict
    const assetRow = page.locator('[data-testid="asset-row-content"]').first();
    await assetRow.screenshot({ path: path.join(OUT, 'conflict.png') });
  });

  test('colour by status — crop to timeline rows with status colours', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Switch to By Status colour mode
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await page.getByRole('button', { name: 'By Status' }).click();
    await page.waitForTimeout(500);

    // Crop to the first few asset rows showing coloured bars
    const timelineBody = page.locator('[data-testid="asset-row-content"]').first();
    await expect(timelineBody).toBeVisible();

    // Screenshot a slice of the timeline showing the coloured bars
    const container = page.locator('#timeline-visualiser');
    const box = await container.boundingBox();
    if (!box) throw new Error('No timeline box');
    await page.screenshot({
      path: path.join(OUT, 'colour-by-status.png'),
      clip: { x: box.x, y: box.y + 40, width: Math.min(box.width, 900), height: 280 },
    });
  });

  test('milestone dependencies — crop to the dep arrow between milestone and initiative', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.waitForTimeout(600);

    // Crop to the SVG deps overlay which contains both arrows and milestone markers
    const svg = page.locator('[data-testid="dependencies-svg"]');
    await expect(svg).toBeVisible({ timeout: 10000 });

    const container = page.locator('#timeline-visualiser');
    const box = await container.boundingBox();
    if (!box) throw new Error('No timeline box');
    await page.screenshot({
      path: path.join(OUT, 'milestone-dependency.png'),
      clip: { x: box.x, y: box.y + 40, width: Math.min(box.width, 900), height: 320 },
    });
  });

  test('resources & capacity — crop to the capacity report', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-capacity').click();
    await page.waitForSelector('[data-testid="capacity-report"]', { timeout: 10000 });
    await page.waitForTimeout(300);

    const report = page.locator('[data-testid="capacity-report"]');
    await report.screenshot({ path: path.join(OUT, 'capacity.png') });
  });

  test('version history — crop to the diff result panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Save a baseline version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Baseline');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // Make a change
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Initiative Name').fill('Passkey Rollout (Updated)');
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    // Go to version history report and run diff
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();
    await page.waitForSelector('[data-testid="report-history-diff"]', { timeout: 5000 });
    await page.getByTestId('version-select').selectOption({ label: 'Baseline' });
    await page.getByRole('button', { name: 'Run Difference Report' }).click();
    await page.waitForSelector('[data-testid="diff-result"]', { timeout: 5000 });
    await page.waitForTimeout(300);

    const diffPanel = page.locator('[data-testid="report-history-diff"]');
    await diffPanel.screenshot({ path: path.join(OUT, 'version-history.png') });
  });

  test('drag drop & resize — crop to initiative bar with resize handles visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.waitForTimeout(500);

    // Hover over an initiative to show resize handles
    const initiative = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await expect(initiative).toBeVisible({ timeout: 10000 });
    await initiative.hover();
    await page.waitForTimeout(200);

    // Crop to the initiative bar and a bit of surrounding context
    const box = await initiative.boundingBox();
    if (!box) throw new Error('No initiative box');
    await page.screenshot({
      path: path.join(OUT, 'move-resize.png'),
      clip: {
        x: Math.max(0, box.x - 80),
        y: Math.max(0, box.y - 20),
        width: box.width + 160,
        height: box.height + 40,
      },
    });
  });

  test('dependency mapping — crop to a dependency arrow between two initiatives', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.waitForTimeout(600);

    // Make sure relationships are on
    const relBtn = page.locator('[data-testid="toggle-relationships"]');
    const isOff = await relBtn.getAttribute('data-active');
    if (isOff === 'false') await relBtn.click();

    // Find the first dependency arrow
    const depArrow = page.locator('[data-dep-id]').first();
    await expect(depArrow).toBeVisible({ timeout: 10000 });

    // Crop to the SVG + surrounding rows
    const svg = page.locator('[data-testid="dependencies-svg"]');
    const box = await svg.boundingBox();
    if (!box) throw new Error('No svg box');
    await page.screenshot({
      path: path.join(OUT, 'dependency.png'),
      clip: { x: box.x, y: box.y + 40, width: Math.min(box.width, 900), height: 280 },
    });
  });
});
