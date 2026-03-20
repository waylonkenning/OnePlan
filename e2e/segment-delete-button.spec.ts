import { test, expect } from '@playwright/test';

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
    await page.waitForSelector('[data-testid="application-row-content"]', { timeout: 20000 });

    // Navigate to 2030 so no demo segments appear in the application rows,
    // giving us clean empty rows to double-click on.
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  });

  test('a segment created by double-click shows the delete button when reopened', async ({ page }) => {
    const panel = page.getByTestId('segment-panel');
    const segmentBars = page.locator('[data-testid^="segment-bar-"]');

    // Count bars before (should be 0 in 2030)
    const countBefore = await segmentBars.count();

    // Double-click on an application row to open the create panel
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });

    // Save the new segment
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    // A new bar should appear
    await expect(segmentBars).toHaveCount(countBefore + 1);

    // Click to select the segment, then open edit panel via the ✎ button
    const newBar = segmentBars.last();
    await newBar.click();
    await newBar.locator('[data-testid="segment-edit"]').click();
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Save Changes' })).toBeVisible();

    // The delete button must be visible — this is the bug fix assertion
    await expect(panel.locator('button[title="Delete segment"]')).toBeVisible();
  });
});
