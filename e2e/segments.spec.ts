import { test, expect } from '@playwright/test';

/**
 * Application Segment Creation — Application Selector
 *
 * User Story:
 *   As a user creating a new application lifecycle segment, I want to select
 *   which application within the asset the segment belongs to, so the segment
 *   is associated with the correct application.
 *
 * Acceptance Criteria:
 *   AC1: The "Add Lifecycle Segment" panel shows an Application dropdown when
 *        the asset has applications defined.
 *   AC2: The dropdown lists all applications belonging to that asset.
 *   AC3: Saving with a selected application sets applicationId on the new segment
 *        (verified by re-opening the segment and checking the panel subtitle).
 */
test.describe('Segment creation — application selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  });

  test('AC1: Add Lifecycle Segment panel shows an Application dropdown', async ({ page }) => {
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    await expect(page.getByTestId('segment-panel')).toBeVisible();
    await expect(page.locator('[data-testid="segment-application"]')).toBeVisible();
  });

  test('AC2: Application dropdown lists all applications for the asset', async ({ page }) => {
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    await expect(page.getByTestId('segment-panel')).toBeVisible();

    const select = page.locator('[data-testid="segment-application"]');
    await expect(select).toBeVisible();

    const options = select.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const texts = await options.allTextContents();
    expect(texts.some(t => t.includes('Okta'))).toBe(true);
    expect(texts.some(t => t.includes('Azure AD B2C'))).toBe(true);
    expect(texts.some(t => t.includes('Keycloak'))).toBe(true);
  });

  test('AC3: Saving with a selected application associates the segment with that application', async ({ page }) => {
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();

    const select = page.locator('[data-testid="segment-application"]');
    await select.selectOption({ label: 'Keycloak' });

    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const newBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(newBar).toBeVisible({ timeout: 5000 });
    await newBar.click();
    await page.getByTestId('segment-action-edit').click();

    const editPanel = page.getByTestId('segment-panel');
    await expect(editPanel).toBeVisible();
    await expect(editPanel).toContainText('Keycloak');
  });
});

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();

    await rowContent.dblclick({ position: { x: 80, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    await rowContent.dblclick({ position: { x: 420, y: 20 } });
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    await expect(bars).toHaveCount(2);

    const boxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    expect(boxes[0]).not.toBeNull();
    expect(boxes[1]).not.toBeNull();

    const leftIdx = boxes[0]!.x < boxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;

    expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThan(5);

    const leftBox = boxes[leftIdx]!;
    const rightBoxBefore = boxes[rightIdx]!;

    const dragFromX = leftBox.x + leftBox.width / 2;
    const dragFromY = leftBox.y + leftBox.height / 2;
    const dragToX = rightBoxBefore.x + rightBoxBefore.width / 2;

    await page.mouse.move(dragFromX, dragFromY);
    await page.mouse.down();
    await page.mouse.move(dragToX, dragFromY, { steps: 15 });
    await page.mouse.up();

    await page.waitForTimeout(300);

    const rightBoxAfter = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxAfter).not.toBeNull();
    expect(rightBoxAfter!.y).toBeGreaterThan(rightBoxBefore.y + 10);

    const leftBoxAfter = await bars.nth(leftIdx).boundingBox();
    expect(leftBoxAfter).not.toBeNull();
    expect(Math.abs(leftBoxAfter!.y - leftBox.y)).toBeLessThan(10);
  });
});

/**
 * Bug fix: segments created via double-click should show delete button after saving.
 *
 * Root cause: new segments were saved with their 'seg-new-*' placeholder ID intact.
 * ApplicationSegmentPanel.isNew checks id.includes('new'), so the delete button was
 * permanently suppressed for any segment created by double-click.
 *
 * Fix: handleSaveApplicationSegment replaces the placeholder ID with a permanent one
 * on the first save.
 */
test.describe('Segment delete button after double-click creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="application-row-content"]', { timeout: 5000 });

    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  });

  test('a segment created by double-click shows the delete button when reopened', async ({ page }) => {
    const panel = page.getByTestId('segment-panel');
    const segmentBars = page.locator('[data-testid^="segment-bar-"]');

    const countBefore = await segmentBars.count();

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });

    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    await expect(segmentBars).toHaveCount(countBefore + 1);

    const newBar = segmentBars.last();
    await newBar.click();
    await page.getByTestId('segment-action-edit').click();
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Save Changes' })).toBeVisible();

    await expect(panel.locator('button[title="Delete segment"]')).toBeVisible();
  });
});

/**
 * Application Segment — Delete Confirmation Flow
 *
 * User Story:
 *   As a user editing an application lifecycle segment, I want pressing the
 *   delete button to immediately show a confirmation modal (without closing
 *   the edit panel first), so that I can confirm or cancel the deletion in
 *   a single, uninterrupted flow.
 *
 * Acceptance Criteria:
 *   AC1: Clicking the delete (trash) button inside the Edit Lifecycle Segment
 *        panel immediately shows the confirmation modal — the edit panel does
 *        NOT disappear first.
 *   AC2: Clicking Cancel in the confirmation modal keeps the edit panel open
 *        and the segment intact.
 *   AC3: Clicking Confirm in the confirmation modal removes the segment and
 *        closes the panel.
 */
test.describe('Segment delete confirmation flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1: Delete button immediately shows confirmation modal without closing the edit panel', async ({ page }) => {
    const segBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(segBar).toBeVisible({ timeout: 10000 });
    await segBar.dblclick();

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toHaveText('Edit Lifecycle Segment');

    await panel.locator('button[title="Delete segment"]').click();

    await expect(page.getByTestId('confirm-modal')).toBeVisible();
    await expect(panel).toBeVisible();
  });

  test('AC2: Cancelling the confirmation keeps the edit panel open and segment intact', async ({ page }) => {
    const segBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(segBar).toBeVisible({ timeout: 10000 });
    await segBar.dblclick();

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();

    await panel.locator('button[title="Delete segment"]').click();
    await expect(page.getByTestId('confirm-modal')).toBeVisible();

    await page.getByTestId('confirm-modal-cancel').click();
    await expect(page.getByTestId('confirm-modal')).toBeHidden();
    await expect(panel.locator('h2')).toHaveText('Edit Lifecycle Segment');

    await expect(segBar).toBeVisible();
  });

  test('AC3: Confirming deletion removes the segment and closes the panel', async ({ page }) => {
    const segBar = page.locator('[data-testid^="segment-bar-"]').first();
    const segId = await segBar.getAttribute('data-testid');
    await expect(segBar).toBeVisible({ timeout: 10000 });
    await segBar.dblclick();

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();

    await panel.locator('button[title="Delete segment"]').click();
    await expect(page.getByTestId('confirm-modal')).toBeVisible();

    await page.getByTestId('confirm-modal-confirm').click();

    await expect(page.getByTestId('confirm-modal')).toBeHidden();
    await expect(panel).toBeHidden();

    if (segId) {
      await expect(page.locator(`[data-testid="${segId}"]`)).toBeHidden();
    }
  });
});

/**
 * Application Segment — Double-click to Edit
 *
 * User Story:
 *   As a user viewing application lifecycle segments on the timeline, I want to
 *   double-click an existing segment to open the Edit Lifecycle Segment panel,
 *   so I can quickly update its details without first single-clicking to select.
 *
 * Acceptance Criteria:
 *   AC1: Double-clicking an existing application segment opens the Edit panel
 *        (title reads "Edit Lifecycle Segment", not "Add Lifecycle Segment").
 *   AC2: Double-clicking blank space in the swimlane still opens the Add panel
 *        (title reads "Add Lifecycle Segment").
 */
test.describe('Segment double-click to edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1: Double-clicking an existing segment opens the Edit panel', async ({ page }) => {
    const segBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(segBar).toBeVisible({ timeout: 10000 });

    await segBar.dblclick();

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toHaveText('Edit Lifecycle Segment');
  });

  test('AC2: Double-clicking blank swimlane space still opens the Add panel', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toHaveText('Add Lifecycle Segment');
  });
});

/**
 * Application Segment Drag Improvements
 *
 * User Story:
 *   As a user working with application segments, I want to drag segments
 *   vertically to change their row, have the row-control buttons positioned
 *   so they don't block the right-edge resize handle, and see visible
 *   indicators on the left/right edges to know those edges are resizable.
 *
 * Acceptance Criteria:
 *   AC1: Dragging a segment body primarily downward moves it to a lower row
 *   AC2: Dragging a segment body primarily upward moves it to a higher row
 *   AC3: The row-control buttons do not overlap the right-edge resize zone
 *   AC4: Left and right resize edge indicators are present in the DOM
 */
test.describe('Application Segment Drag Improvements', () => {

  async function goToEmptyYear(page: import('@playwright/test').Page) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  }

  async function createSegment(page: import('@playwright/test').Page) {
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();
    await expect(page.locator('[data-testid^="segment-bar-"]').first()).toBeVisible();
  }

  test('AC1: dragging segment body downward moves it to a lower row', async ({ page }) => {
    await goToEmptyYear(page);
    await createSegment(page);

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    const boxBefore = await bar.boundingBox();
    expect(boxBefore).not.toBeNull();

    const cx = boxBefore!.x + boxBefore!.width / 2;
    const cy = boxBefore!.y + boxBefore!.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy + 50, { steps: 8 });
    await page.mouse.up();

    const boxAfter = await bar.boundingBox();
    expect(boxAfter).not.toBeNull();

    expect(boxAfter!.y).toBeGreaterThan(boxBefore!.y + 30);
  });

  test('AC2: dragging segment body upward moves it to a higher row', async ({ page }) => {
    await goToEmptyYear(page);
    await createSegment(page);

    const bar = page.locator('[data-testid^="segment-bar-"]').first();

    let box = await bar.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2 + 50, { steps: 8 });
    await page.mouse.up();

    const boxAtRow1 = await bar.boundingBox();
    expect(boxAtRow1).not.toBeNull();

    await page.mouse.move(boxAtRow1!.x + boxAtRow1!.width / 2, boxAtRow1!.y + boxAtRow1!.height / 2);
    await page.mouse.down();
    await page.mouse.move(boxAtRow1!.x + boxAtRow1!.width / 2, boxAtRow1!.y + boxAtRow1!.height / 2 - 50, { steps: 8 });
    await page.mouse.up();

    const boxAfterUp = await bar.boundingBox();
    expect(boxAfterUp).not.toBeNull();

    expect(boxAfterUp!.y).toBeLessThan(boxAtRow1!.y - 10);
  });

  test('AC3: row-control buttons do not overlap the right edge of the segment', async ({ page }) => {
    await goToEmptyYear(page);
    await createSegment(page);

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await bar.click();

    const upBtn = page.locator('[data-testid="segment-row-up"]');
    await expect(upBtn).toBeVisible();

    const segBox = await bar.boundingBox();
    const btnBox = await upBtn.boundingBox();
    expect(segBox).not.toBeNull();
    expect(btnBox).not.toBeNull();

    const segRight = segBox!.x + segBox!.width;
    const btnRight = btnBox!.x + btnBox!.width;

    expect(btnRight).toBeLessThanOrEqual(segRight - 10);
  });

  test('AC4: segment bars have left and right resize edge indicators', async ({ page }) => {
    await goToEmptyYear(page);
    await createSegment(page);

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible();

    await expect(bar.locator('[data-testid="segment-resize-left"]')).toHaveCount(1);
    await expect(bar.locator('[data-testid="segment-resize-right"]')).toHaveCount(1);
  });
});

/**
 * Application Segment — Label Visible When Segment Starts Before Timeline
 *
 * User Story:
 *   As an IT portfolio manager viewing the timeline, I want lifecycle segment
 *   labels to remain visible at the left edge of the timeline even when the
 *   segment starts before the visible window, so I can always identify what
 *   each segment represents.
 *
 * Acceptance Criteria:
 *   AC1: When a segment starts before the visible timeline window and its bar
 *        extends into the visible area, the segment label is visible at the
 *        left edge of the content area (not clipped off-screen to the left).
 *   AC2: When a segment is fully within the visible window, its label is
 *        positioned normally (at the start of the bar).
 */
test.describe('Segment label clamps to visible edge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1: Label is visible when segment starts before the timeline window', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2026-06-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const segBar = page.locator('[data-testid="segment-bar-seg-okta-prod"]');
    await expect(segBar).toBeVisible({ timeout: 5000 });

    const contentArea = page.locator('[data-testid="application-row-content"]').first();
    const contentBox = await contentArea.boundingBox();
    expect(contentBox).not.toBeNull();

    const label = segBar.locator('[data-testid="segment-label"]');
    await expect(label).toBeVisible();
    const labelBox = await label.boundingBox();
    expect(labelBox).not.toBeNull();

    expect(labelBox!.x).toBeGreaterThanOrEqual(contentBox!.x - 1);
  });

  test('AC2: Label is at the bar start when segment is fully within the window', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2026-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const segBar = page.locator('[data-testid="segment-bar-seg-keycloak-planned"]');
    await expect(segBar).toBeVisible({ timeout: 5000 });

    const label = segBar.locator('[data-testid="segment-label"]');
    await expect(label).toBeVisible();

    const labelBox = await label.boundingBox();
    const barBox = await segBar.boundingBox();
    expect(labelBox).not.toBeNull();
    expect(barBox).not.toBeNull();

    expect(labelBox!.x - barBox!.x).toBeLessThan(20);
  });
});

/**
 * US-30: Unified Application Segment Model
 *
 * All ApplicationSegment records link via an Application record (applicationId)
 * rather than directly to an asset (assetId). After unification:
 *  - GEANZ demo data: gz-* assets have Application records visible in Data Manager
 *  - DTS template checks are covered in dts-segment-labels.spec.ts
 */
test.describe('US-30: Unified segment model — GEANZ Application records', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-applications').click();
  });

  test('GEANZ template: gz-* assets have Application records in Data Manager', async ({ page }) => {
    const rows = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)');
    const count = await rows.count();

    expect(count).toBeGreaterThanOrEqual(17);
  });

  test('GEANZ template: Application record exists for Financial Management Information System', async ({ page }) => {
    const match = page.locator('[data-testid="data-manager"] tbody').getByText('Financial Management Information System', { exact: false });
    expect(await match.count()).toBeGreaterThan(0);
  });

  test('GEANZ template: Application record exists for API Management', async ({ page }) => {
    const match = page.locator('[data-testid="data-manager"] tbody').getByText('API Management', { exact: false });
    expect(await match.count()).toBeGreaterThan(0);
  });
});

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
  async function setupCleanSwimlane(page: any) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  }

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

    await addSegment(page, rowContent, 80);
    await addSegment(page, rowContent, 420);

    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    await expect(bars).toHaveCount(2);

    const boxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    const leftIdx = boxes[0]!.x < boxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;

    const rightBoxBefore = boxes[rightIdx]!;

    const leftBox = boxes[leftIdx]!;
    const fromX = leftBox.x + leftBox.width / 2;
    const fromY = leftBox.y + leftBox.height / 2;

    await page.mouse.move(fromX, fromY);
    await page.mouse.down();
    await page.mouse.move(fromX, fromY + 40, { steps: 10 });

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

    const leftBox = boxes[leftIdx]!;
    await page.mouse.click(leftBox.x + leftBox.width / 2, leftBox.y + leftBox.height / 2);
    await page.waitForTimeout(200);

    const rightBoxAfter = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxAfter).not.toBeNull();
    expect(Math.abs(rightBoxAfter!.y - rightBoxBefore.y)).toBeLessThan(5);
  });

  test('AC-C – conflict resolution fires after releasing a vertical drag onto an occupied row', async ({ page }) => {
    await setupCleanSwimlane(page);
    const rowContent = page.locator('[data-testid="application-row-content"]').first();

    await addSegment(page, rowContent, 80);
    await addSegment(page, rowContent, 420);

    const bars = rowContent.locator('[data-testid^="segment-bar-"]');
    const initialBoxes = await Promise.all([0, 1].map(i => bars.nth(i).boundingBox()));
    const leftIdx = initialBoxes[0]!.x < initialBoxes[1]!.x ? 0 : 1;
    const rightIdx = 1 - leftIdx;

    const leftBox = initialBoxes[leftIdx]!;
    const rightBox = initialBoxes[rightIdx]!;
    await page.mouse.move(leftBox.x + leftBox.width / 2, leftBox.y + leftBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(rightBox.x + rightBox.width / 2, leftBox.y + leftBox.height / 2, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const rightBoxAfter = await bars.nth(rightIdx).boundingBox();
    expect(rightBoxAfter).not.toBeNull();
    expect(rightBoxAfter!.y).toBeGreaterThan(initialBoxes[rightIdx]!.y + 10);
  });
});

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    const handle = bar.locator('[data-testid="segment-resize-bottom"]');
    await expect(handle).toHaveCount(1);
  });

  test('AC2+AC3 – dragging the bottom handle down makes the segment taller', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

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
    await expect(bar).toBeVisible();

    const boxBefore = await bar.boundingBox();
    expect(boxBefore).not.toBeNull();
    const heightBefore = boxBefore!.height;

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

    const boxAfter = await bar.boundingBox();
    expect(boxAfter).not.toBeNull();
    expect(boxAfter!.height).toBeGreaterThan(heightBefore);
  });

  test('AC5 – overlapping segments are placed in different rows with distinct top positions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const ciamSwimlane = page.locator('[data-testid="application-swimlane-a-ciam"]');
    await expect(ciamSwimlane).toBeVisible();

    const bars = ciamSwimlane.locator('[data-testid^="segment-bar-"]');
    await expect(bars.first()).toBeVisible();
    const count = await bars.count();
    expect(count).toBeGreaterThan(1);

    const tops = new Set<number>();
    for (let i = 0; i < count; i++) {
      const box = await bars.nth(i).boundingBox();
      if (box) tops.add(Math.round(box.y));
    }
    expect(tops.size).toBeGreaterThan(1);
  });
});
