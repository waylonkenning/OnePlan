import { test, expect } from '@playwright/test';

test.describe('Floating Legend Box', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('legend box is present inside #timeline-visualiser', async ({ page }) => {
    const visualiser = page.locator('#timeline-visualiser');
    await expect(visualiser).toBeVisible();
    const legend = visualiser.locator('[data-testid="timeline-legend"]');
    await expect(legend).toBeVisible();
  });

  test('legend is anchored to the bottom-right of the visualiser', async ({ page }) => {
    const visualiser = page.locator('#timeline-visualiser');
    const legend = visualiser.locator('[data-testid="timeline-legend"]');

    const visBox = await visualiser.boundingBox();
    const legBox = await legend.boundingBox();
    expect(visBox).not.toBeNull();
    expect(legBox).not.toBeNull();

    // Legend right edge should be near the visualiser right edge
    const legRight = legBox!.x + legBox!.width;
    const visRight = visBox!.x + visBox!.width;
    expect(visRight - legRight).toBeLessThan(40);

    // Legend bottom edge should be near the visualiser bottom edge
    const legBottom = legBox!.y + legBox!.height;
    const visBottom = visBox!.y + visBox!.height;
    expect(visBottom - legBottom).toBeLessThan(40);
  });

  test('toggle button collapses and expands the legend', async ({ page }) => {
    const legend = page.locator('[data-testid="timeline-legend"]');
    const content = page.locator('[data-testid="legend-content"]');
    const toggleBtn = page.locator('[data-testid="legend-toggle"]');

    // Default: expanded
    await expect(content).toBeVisible();

    // Collapse
    await toggleBtn.click();
    await expect(content).not.toBeVisible();

    // Expand again
    await toggleBtn.click();
    await expect(content).toBeVisible();
  });

  test('collapsed/expanded state persists across page reloads', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="legend-toggle"]');
    const content = page.locator('[data-testid="legend-content"]');

    // Collapse it
    await toggleBtn.click();
    await expect(content).not.toBeVisible();

    // Reload
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Should still be collapsed
    await expect(page.locator('[data-testid="legend-content"]')).not.toBeVisible();
  });

  test('legend content shows programme colour swatches by default', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    // Programme colour swatches should be present
    await expect(content.locator('[data-testid="legend-colour-swatches"]')).toBeVisible();
  });

  test('legend content shows milestone icon types', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-milestones"]')).toBeVisible();
  });

  test('legend content shows dependency arrow key', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-dependencies"]')).toBeVisible();
  });

  test('legend content shows conflict indicator', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-conflict"]')).toBeVisible();
  });

  test('legend shows current date and time', async ({ page }) => {
    const timestamp = page.locator('[data-testid="legend-timestamp"]');
    await expect(timestamp).toBeVisible();
    // Should contain a year (4 digits) and a time separator ':'
    const text = await timestamp.textContent();
    expect(text).toMatch(/\d{4}/);
    expect(text).toContain(':');
  });

  test('legend appears behind initiative panel (lower z-index)', async ({ page }) => {
    // Open initiative panel
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible();

    // Legend should still be in the DOM but visually behind the panel
    const legend = page.locator('[data-testid="timeline-legend"]');
    await expect(legend).toBeAttached();
    const legendZ = await legend.evaluate(el => getComputedStyle(el).zIndex);
    const panelOverlay = page.getByTestId('initiative-panel');
    const panelZ = await panelOverlay.evaluate(el => getComputedStyle(el).zIndex);
    expect(Number(legendZ)).toBeLessThan(Number(panelZ));
  });

  test('colour-legend is inside the floating legend, not the header bar', async ({ page }) => {
    // The colour-legend testid must live inside #timeline-visualiser (floating legend),
    // not in the header bar above the timeline
    const visualiserLegend = page.locator('#timeline-visualiser [data-testid="colour-legend"]');
    await expect(visualiserLegend).toBeVisible();

    // No colour-legend should exist outside the visualiser
    const headerLegend = page.locator('[data-testid="desktop-header-controls"] [data-testid="colour-legend"]');
    await expect(headerLegend).toHaveCount(0);
  });
});
