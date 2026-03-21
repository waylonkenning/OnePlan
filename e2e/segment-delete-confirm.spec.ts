import { test, expect } from '@playwright/test';

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('AC1: Delete button immediately shows confirmation modal without closing the edit panel', async ({ page }) => {
    // Double-click an existing segment to open the edit panel
    const segBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(segBar).toBeVisible({ timeout: 10000 });
    await segBar.dblclick();

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toHaveText('Edit Lifecycle Segment');

    // Click the delete (trash) button
    await panel.locator('button[title="Delete segment"]').click();

    // The confirmation modal should appear immediately — panel should still be in the DOM
    await expect(page.getByTestId('confirm-modal')).toBeVisible();
    // The edit panel backdrop is still present (it's behind the confirm modal)
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

    // Cancel — should return to the edit panel
    await page.getByTestId('confirm-modal-cancel').click();
    await expect(page.getByTestId('confirm-modal')).toBeHidden();
    await expect(panel.locator('h2')).toHaveText('Edit Lifecycle Segment');

    // Segment should still be on the canvas
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

    // Confirm deletion
    await page.getByTestId('confirm-modal-confirm').click();

    await expect(page.getByTestId('confirm-modal')).toBeHidden();
    await expect(panel).toBeHidden();

    // Segment bar should be gone from the canvas
    if (segId) {
      await expect(page.locator(`[data-testid="${segId}"]`)).toBeHidden();
    }
  });
});
