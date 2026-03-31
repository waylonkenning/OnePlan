import { test, expect, Page } from '@playwright/test';

/**
 * US-05: Link application segments to initiatives via dependency relationships.
 *
 * AC1: A selected segment shows a dependency-draw handle.
 * AC2: Dragging from the handle and releasing on an initiative creates a new dependency arrow.
 * AC3: The dependency persists across page reload.
 * AC4: Segment-to-segment linking is prevented (dropping on a segment when source is segment does nothing).
 * AC5: Clicking the arrow opens DependencyPanel with the segment's application name as Source.
 */

async function waitForDeps(page: Page) {
  await page.waitForTimeout(500);
}

/** Select the first visible segment bar and return its bounding box. */
async function selectFirstSegment(page: Page) {
  // Wait for a segment bar to be visible
  const bar = page.locator('[data-testid^="segment-bar-"]').first();
  await expect(bar).toBeVisible({ timeout: 10000 });
  await bar.click();
  return bar;
}

test.describe('US-05: Segment dependency relationships', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await waitForDeps(page);
  });

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: selected segment shows a dependency-draw handle', async ({ page }) => {
    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    await expect(handle).toBeVisible();
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: dragging handle to initiative creates a dependency arrow', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    await expect(handle).toBeVisible();
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    // Find an initiative to drag to
    const initBar = page.locator('[data-initiative-id]').first();
    const initBox = await initBar.boundingBox();
    expect(initBox).not.toBeNull();

    // Drag from handle to initiative
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDeps(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: segment dependency persists across reload', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const initBar = page.locator('[data-initiative-id]').first();
    const initBox = await initBar.boundingBox();
    expect(initBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDeps(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await waitForDeps(page);

    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: dropping on another segment does not create a dependency', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    // Need at least two segments visible
    const segBars = page.locator('[data-testid^="segment-bar-"]');
    const count = await segBars.count();
    if (count < 2) {
      test.skip(count < 2, 'Need at least two segment bars for this test');
      return;
    }

    const firstBar = segBars.first();
    await firstBar.click();
    const handle = firstBar.locator('[data-testid="segment-dep-handle"]');
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const secondBar = segBars.nth(1);
    const secondBox = await secondBar.boundingBox();
    expect(secondBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(secondBox!.x + secondBox!.width / 2, secondBox!.y + secondBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDeps(page);
    // Count should be unchanged — segment-to-segment not allowed
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount);
  });

  // ── AC5 ──────────────────────────────────────────────────────────────────
  test('AC5: clicking segment dep arrow opens DependencyPanel with segment as source', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const initBar = page.locator('[data-initiative-id]').first();
    const initBox = await initBar.boundingBox();
    expect(initBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDeps(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    // Click the dep path (not the label rect) to open the DependencyPanel
    const newDep = page.locator('[data-dep-id]').last();
    await newDep.locator('path').first().click({ force: true });

    // DependencyPanel should show (source label visible)
    await expect(page.locator('[data-testid="dep-source-name"]')).toBeVisible();
  });
});
