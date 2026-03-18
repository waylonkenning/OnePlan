import { test, expect, Page } from '@playwright/test';

/** Wait for SVG dep arrows to be measured and rendered (50ms DOM delay + buffer). */
async function waitForDepsRendered(page: Page) {
  await page.waitForTimeout(500);
}

/**
 * Drag from the first milestone's icon (dep-handle) downward to an initiative
 * that is positioned below the milestone row, creating a dependency.
 * Caller must have already called waitForDepsRendered if counting deps before this.
 */
async function dragMilestoneToBelowInitiative(page: Page) {
  const milestone = page.locator('[data-milestone-id]').first();
  const handle = milestone.locator('[data-testid="milestone-dep-handle"]');
  await handle.scrollIntoViewIfNeeded();
  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();

  const milestoneBottom = handleBox!.y + handleBox!.height;

  // Find an initiative whose top edge is clearly below the milestone row
  const initId = await page.evaluate((minY: number) => {
    const els = document.querySelectorAll('[data-initiative-id]');
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.top > minY + 20) return el.getAttribute('data-initiative-id');
    }
    return null;
  }, milestoneBottom);

  expect(initId).not.toBeNull();
  const initBar = page.locator(`[data-initiative-id="${initId}"]`);
  const initBox = await initBar.boundingBox();
  expect(initBox).not.toBeNull();

  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
  await page.mouse.up();
}

test.describe('Milestone Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('milestone markers show a dep-draw handle on hover', async ({ page }) => {
    const milestone = page.locator('[data-milestone-id]').first();
    await milestone.hover();
    const handle = milestone.locator('[data-testid="milestone-dep-handle"]');
    await expect(handle).toBeVisible();
  });

  test('dragging from milestone handle to an initiative creates a dependency', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    await dragMilestoneToBelowInitiative(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  test('milestone dependency arrow renders with correct data attribute', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    const initialMilestoneDepCount = await page.locator('[data-testid="milestone-dep-source"]').count();
    await dragMilestoneToBelowInitiative(page);

    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
    await expect(page.locator('[data-testid="milestone-dep-source"]')).toHaveCount(initialMilestoneDepCount + 1);
  });

  test('clicking a milestone dependency arrow opens the dependency panel', async ({ page }) => {
    await waitForDepsRendered(page);
    await dragMilestoneToBelowInitiative(page);

    // Click the new dependency arrow
    const newDep = page.locator('[data-dep-id]').last();
    await newDep.click();

    // Dependency panel should open showing source as the milestone name
    await expect(page.locator('[data-testid="dep-source-name"]')).toBeVisible();
  });

  test('milestone dependency persists across page reload', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    await dragMilestoneToBelowInitiative(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await waitForDepsRendered(page);

    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  test('milestone dependencies appear in the reports view', async ({ page }) => {
    await waitForDepsRendered(page);
    await dragMilestoneToBelowInitiative(page);

    // Go to reports
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-initiatives-dependencies').click();
    await expect(page.locator('[data-testid="report-milestone-dependencies"]')).toBeVisible();
  });
});
