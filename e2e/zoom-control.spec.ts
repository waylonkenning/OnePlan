import { test, expect } from '@playwright/test';

test.describe('Zoom Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('zoom in button widens timeline columns', async ({ page }) => {
    const timeline = page.locator('#timeline-visualiser');
    await expect(timeline).toBeVisible();

    // Measure the initial scrollable content width
    const initialWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);

    // Click zoom in
    await page.getByTestId('zoom-in').click();

    // Content should be wider after zooming in
    const zoomedWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    expect(zoomedWidth).toBeGreaterThan(initialWidth);
  });

  test('zoom out button narrows timeline columns', async ({ page }) => {
    const timeline = page.locator('#timeline-visualiser');
    await expect(timeline).toBeVisible();

    // Zoom in first so we have room to zoom out
    await page.getByTestId('zoom-in').click();
    const zoomedInWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);

    // Now zoom out
    await page.getByTestId('zoom-out').click();
    const zoomedOutWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    expect(zoomedOutWidth).toBeLessThan(zoomedInWidth);
  });

  test('zoom level persists across page reloads', async ({ page }) => {
    await page.getByTestId('zoom-in').click();
    await page.getByTestId('zoom-in').click();

    const widthBefore = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    const widthAfter = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    expect(widthAfter).toBeCloseTo(widthBefore, -1);
  });

  test('zoom out is disabled at minimum zoom level', async ({ page }) => {
    // Zoom out as far as possible
    for (let i = 0; i < 5; i++) {
      const btn = page.getByTestId('zoom-out');
      const disabled = await btn.getAttribute('disabled');
      if (disabled !== null) break;
      await btn.click();
    }

    await expect(page.getByTestId('zoom-out')).toBeDisabled();
  });

  test('zoom in is disabled at maximum zoom level', async ({ page }) => {
    // Zoom in as far as possible
    for (let i = 0; i < 10; i++) {
      const btn = page.getByTestId('zoom-in');
      const disabled = await btn.getAttribute('disabled');
      if (disabled !== null) break;
      await btn.click();
    }

    await expect(page.getByTestId('zoom-in')).toBeDisabled();
  });
});
