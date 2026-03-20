import { test, expect } from '@playwright/test';

/**
 * User Story: Vertical Resize of Application Segments (rowSpan)
 *
 * As a Scenia user I want to drag the bottom edge of an application segment
 * to make it span multiple row heights, so I can visually represent one
 * application replacing two (or more) applications that ran in parallel.
 *
 * Acceptance Criteria:
 *  AC1  Every application segment bar has a bottom drag handle.
 *  AC2  Dragging the bottom handle down snaps the segment to 2× row height.
 *  AC3  A segment that spans 2 rows is visually taller than a 1-row segment.
 *  AC5  Overlapping segments are placed in different rows with different top positions.
 */
test.describe('Application Segment Vertical Resize', () => {
  test('AC1 – every segment bar has a bottom drag handle', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    const handle = bar.locator('[data-testid="segment-resize-bottom"]');
    // Handle is opacity-0 until hover — check it exists in the DOM
    await expect(handle).toHaveCount(1);
  });

  test('AC2+AC3 – dragging the bottom handle down makes the segment taller', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Navigate to 2030 so the application swimlane is empty and we control exactly
    // which segments exist.
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    // Create one segment in the first ciam swimlane
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible();
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible();

    const boxBefore = await bar.boundingBox();
    expect(boxBefore).not.toBeNull();
    const heightBefore = boxBefore!.height;

    // Hover to reveal the bottom handle, then drag it down by one row unit (~40px)
    await bar.hover();
    const handle = bar.locator('[data-testid="segment-resize-bottom"]');
    await expect(handle).toBeVisible();

    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    const handleCx = handleBox!.x + handleBox!.width / 2;
    const handleCy = handleBox!.y + handleBox!.height / 2;

    await page.mouse.move(handleCx, handleCy);
    await page.mouse.down();
    await page.mouse.move(handleCx, handleCy + 44, { steps: 5 });
    await page.mouse.up();

    // Segment should now be taller
    const boxAfter = await bar.boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.height).toBeGreaterThan(heightBefore);
  });

  test('AC5 – overlapping segments are placed in different rows with distinct top positions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const ciamSwimlane = page.locator('[data-testid="application-swimlane-a-ciam"]');
    await expect(ciamSwimlane).toBeVisible();

    // a-ciam has 6 overlapping segments in demo data — they must be in different rows
    const bars = ciamSwimlane.locator('[data-testid^="segment-bar-"]');
    await expect(bars.first()).toBeVisible();
    const count = await bars.count();
    expect(count).toBeGreaterThan(1);

    // Collect unique top positions — there must be more than one distinct row
    const tops = new Set<number>();
    for (let i = 0; i < count; i++) {
      const box = await bars.nth(i).boundingBox();
      if (box) tops.add(Math.round(box.y));
    }
    expect(tops.size).toBeGreaterThan(1);
  });
});
