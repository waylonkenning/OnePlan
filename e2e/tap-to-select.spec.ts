import { test, expect } from '@playwright/test';

/**
 * User Story: Tap-to-Select for Segments and Initiatives
 *
 * As a Scenia user on any device (including iPad/touch), I want to tap or
 * click a segment or initiative to select it, so that I can see visible
 * affordance handles that show me what interactions are available — resize
 * left/right, resize taller/shorter, move up/down a row — without needing
 * to hover.
 *
 * Acceptance Criteria:
 *  AC1  Clicking a segment selects it (bar gets data-selected="true").
 *  AC2  Selected segment shows the bottom resize handle without needing to hover.
 *  AC3  Selected segment shows row-up and row-down buttons.
 *  AC4  Clicking the row-down button moves the segment to a lower row.
 *  AC5  Clicking the row-up button moves the segment back up.
 *  AC6  Clicking elsewhere deselects the segment.
 *  AC7  Clicking an initiative selects it (bar gets data-selected="true").
 *  AC8  Clicking elsewhere deselects the initiative.
 */
test.describe('Tap-to-Select for Segments and Initiatives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC1 – clicking a segment selects it', async ({ page }) => {
    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');
  });

  test('AC2 – selected segment shows bottom resize handle without hovering', async ({ page }) => {
    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });

    // Before selection, the handle is opacity-0 (hidden)
    const handle = bar.locator('[data-testid="segment-resize-bottom"]');
    await expect(handle).toHaveCount(1);

    // Click to select — handle must now be visible without a hover
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');

    // The handle should have opacity-100 class (not relying on group-hover)
    await expect(handle).toHaveClass(/opacity-100/);
  });

  test('AC3 – selected segment shows row-up and row-down buttons', async ({ page }) => {
    // Navigate to 2030 and create a segment so we have a clean test subject
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible();
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');

    await expect(bar.locator('[data-testid="segment-row-up"]')).toBeVisible();
    await expect(bar.locator('[data-testid="segment-row-down"]')).toBeVisible();
  });

  test('AC4+AC5 – row-down moves segment lower; row-up moves it back', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible();
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await bar.click();
    const boxBefore = await bar.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Move down
    await bar.locator('[data-testid="segment-row-down"]').click();
    await page.waitForTimeout(100);
    const boxAfterDown = await bar.boundingBox();
    expect(boxAfterDown).not.toBeNull();
    expect(boxAfterDown!.y).toBeGreaterThan(boxBefore!.y + 10);

    // Move back up
    await bar.click();
    await bar.locator('[data-testid="segment-row-up"]').click();
    await page.waitForTimeout(100);
    const boxAfterUp = await bar.boundingBox();
    expect(boxAfterUp).not.toBeNull();
    expect(boxAfterUp!.y).toBeLessThan(boxAfterDown!.y - 10);
  });

  test('AC6 – clicking elsewhere deselects the segment', async ({ page }) => {
    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');

    // Click on a timeline column header (inside the timeline visualiser, not on any bar)
    await page.locator('[data-testid^="timeline-col-"]').first().click();
    await expect(bar).not.toHaveAttribute('data-selected', 'true');
  });

  test('AC7 – clicking an initiative selects it', async ({ page }) => {
    const initBar = page.locator('[data-testid^="initiative-bar-"]').first();
    await expect(initBar).toBeVisible({ timeout: 10000 });
    await initBar.click();
    await expect(initBar).toHaveAttribute('data-selected', 'true');
  });

  test('AC8 – clicking elsewhere deselects the initiative', async ({ page }) => {
    const initBar = page.locator('[data-testid^="initiative-bar-"]').first();
    await expect(initBar).toBeVisible({ timeout: 10000 });
    await initBar.click();
    await expect(initBar).toHaveAttribute('data-selected', 'true');

    // Click on a timeline column header (inside timeline-visualiser, not on any bar)
    await page.locator('[data-testid^="timeline-col-"]').first().click();
    await expect(initBar).not.toHaveAttribute('data-selected', 'true');
  });
});
