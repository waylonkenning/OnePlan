import { test, expect } from '@playwright/test';

/**
 * User Story: Conflict Resolution on Horizontal Segment Drag
 *
 * As a Scenia user, when I drag an application segment left or right so that
 * it overlaps another segment in the same row, the overlapped segment should
 * automatically shift down to the next available row rather than rendering
 * on top of the moved segment.
 *
 * Acceptance Criteria:
 *  AC1  After dragging a segment to overlap another in the same row, the
 *       displaced segment moves to a lower row (higher y position).
 *  AC2  The moved (dragging) segment stays in its original row after drop.
 *  AC3  Cascading conflicts are resolved: if the displaced segment would
 *       overlap a third segment in its new row, the third shifts down too.
 */
test.describe('Segment Conflict Resolution on Horizontal Drag', () => {
  test('AC1+AC2 – dragging a segment over another causes the other to shift down', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Navigate to 2030 so the swimlane is empty
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();

    // Create segment 1 at the left of the timeline
    await rowContent.dblclick({ position: { x: 80, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    // Create segment 2 at the right of the timeline (non-overlapping)
    await rowContent.dblclick({ position: { x: 420, y: 20 } });
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    // Both bars should be in the same row (similar y position)
    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    await expect(bars).toHaveCount(2);

    const boxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    expect(boxes[0]).not.toBeNull();
    expect(boxes[1]).not.toBeNull();

    // Identify which bar is on the left and which is on the right
    const leftIdx = boxes[0]!.x < boxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;

    // Both should initially be in the same row
    expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThan(5);

    const leftBox = boxes[leftIdx]!;
    const rightBoxBefore = boxes[rightIdx]!;

    // Drag the left bar to the right to overlap the right bar
    const dragFromX = leftBox.x + leftBox.width / 2;
    const dragFromY = leftBox.y + leftBox.height / 2;
    const dragToX = rightBoxBefore.x + rightBoxBefore.width / 2;

    await page.mouse.move(dragFromX, dragFromY);
    await page.mouse.down();
    await page.mouse.move(dragToX, dragFromY, { steps: 15 });
    await page.mouse.up();

    await page.waitForTimeout(300);

    // The right bar should now have shifted to a lower row (greater y)
    const rightBoxAfter = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxAfter).not.toBeNull();
    expect(rightBoxAfter!.y).toBeGreaterThan(rightBoxBefore.y + 10);

    // The left (dragged) bar should still be in the same original row
    const leftBoxAfter = await bars.nth(leftIdx).boundingBox();
    expect(leftBoxAfter).not.toBeNull();
    expect(Math.abs(leftBoxAfter!.y - leftBox.y)).toBeLessThan(10);
  });
});
