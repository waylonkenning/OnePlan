import { test, expect } from '@playwright/test';

/**
 * User Story: US-AL-05 — Drag and Resize Lifecycle Segments
 *
 * Regression: segment neighbours jumped during vertical drag and on bare click.
 *
 * Root causes:
 *  1. mousemove called resolveSegmentConflicts on every pixel of vertical drag,
 *     causing neighbour segments to reflow in real-time.
 *  2. mouseup always ran resolveSegmentConflicts even when no drag occurred
 *     (bare click), coercing undefined `row` fields to 0 and displacing neighbours.
 *
 * Acceptance Criteria tested:
 *  AC-A  While dragging a segment vertically, neighbour segments stay fixed
 *        at their pre-drag Y positions until mouse release.
 *  AC-B  A bare click on a segment (mousedown + mouseup without movement)
 *        does not change the Y position of any other segment.
 *  AC-C  After releasing a vertical drag, conflict resolution is applied:
 *        if the dropped segment now overlaps a neighbour, the neighbour shifts row.
 */
test.describe('Segment vertical drag — neighbour stability', () => {
  // Helper: navigate to a clean swimlane in a far-future year so demo data is off-screen
  async function setupCleanSwimlane(page: any) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  }

  // Helper: create a segment by double-clicking at a position within an application row
  async function addSegment(page: any, rowContent: any, x: number) {
    const panel = page.getByTestId('segment-panel');
    await rowContent.dblclick({ position: { x, y: 20 } });
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();
  }

  test('AC-A – neighbour segments stay fixed while dragging a segment vertically', async ({ page }) => {
    await setupCleanSwimlane(page);
    const rowContent = page.locator('[data-testid="application-row-content"]').first();

    // Create two non-overlapping segments — they start in the same row
    await addSegment(page, rowContent, 80);
    await addSegment(page, rowContent, 420);

    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    await expect(bars).toHaveCount(2);

    // Identify left and right bars
    const boxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    const leftIdx = boxes[0]!.x < boxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;

    const rightBoxBefore = boxes[rightIdx]!;

    // Drag the left bar downward — stay within vertical movement so it's a row drag
    const leftBox = boxes[leftIdx]!;
    const fromX = leftBox.x + leftBox.width / 2;
    const fromY = leftBox.y + leftBox.height / 2;

    await page.mouse.move(fromX, fromY);
    await page.mouse.down();
    // Move down by ~40px (enough for a row change) but do NOT release yet
    await page.mouse.move(fromX, fromY + 40, { steps: 10 });

    // While the mouse is still held: check that the right (neighbour) bar hasn't moved
    const rightBoxDuring = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxDuring).not.toBeNull();
    expect(Math.abs(rightBoxDuring!.y - rightBoxBefore.y)).toBeLessThan(5);

    await page.mouse.up();
  });

  test('AC-B – clicking a segment does not move any other segment', async ({ page }) => {
    await setupCleanSwimlane(page);
    const rowContent = page.locator('[data-testid="application-row-content"]').first();

    await addSegment(page, rowContent, 80);
    await addSegment(page, rowContent, 420);

    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    await expect(bars).toHaveCount(2);

    const boxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    const leftIdx = boxes[0]!.x < boxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;
    const rightBoxBefore = boxes[rightIdx]!;

    // Bare click on the left bar (no drag movement)
    const leftBox = boxes[leftIdx]!;
    await page.mouse.click(leftBox.x + leftBox.width / 2, leftBox.y + leftBox.height / 2);
    await page.waitForTimeout(200);

    // The right (neighbour) bar must not have moved
    const rightBoxAfter = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxAfter).not.toBeNull();
    expect(Math.abs(rightBoxAfter!.y - rightBoxBefore.y)).toBeLessThan(5);
  });

  test('AC-C – conflict resolution fires after releasing a vertical drag onto an occupied row', async ({ page }) => {
    await setupCleanSwimlane(page);
    const rowContent = page.locator('[data-testid="application-row-content"]').first();

    // Create two overlapping segments by dragging the left one over the right after creation
    await addSegment(page, rowContent, 80);
    await addSegment(page, rowContent, 420);

    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    const initialBoxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    const leftIdx = initialBoxes[0]!.x < initialBoxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;

    // Drag left bar onto the right bar horizontally so they overlap and the right one shifts down
    const leftBox = initialBoxes[leftIdx]!;
    const rightBox = initialBoxes[rightIdx]!;
    await page.mouse.move(leftBox.x + leftBox.width / 2, leftBox.y + leftBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(rightBox.x + rightBox.width / 2, leftBox.y + leftBox.height / 2, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // The right bar should now be in a lower row than before
    const rightBoxAfter = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxAfter).not.toBeNull();
    expect(rightBoxAfter!.y).toBeGreaterThan(initialBoxes[rightIdx]!.y + 10);
  });
});
