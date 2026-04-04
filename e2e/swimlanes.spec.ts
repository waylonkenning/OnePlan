import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Swimlane Grouping — group timeline rows by Programme or Strategy
 * instead of the default Asset/Category view.
 */
test.describe('Swimlane Grouping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  async function openViewOptions(page: Page) {
    const popover = page.getByTestId('view-options-popover');
    if (!await popover.isVisible()) {
      await page.getByTestId('view-options-btn').click();
      await expect(popover).toBeVisible();
    }
  }

  test('group-by selector is visible inside the View Options popover', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-asset')).toBeVisible();
    await expect(page.getByTestId('group-by-programme')).toBeVisible();
    await expect(page.getByTestId('group-by-strategy')).toBeVisible();
  });

  test('default grouping is by asset (category/asset rows visible)', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-asset')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid^="category-row-"]').first()).toBeVisible();
  });

  test('switching to programme grouping shows programme swimlane rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]').first()).toBeVisible();
  });

  test('switching to programme grouping hides asset/category rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="category-row-"]')).toHaveCount(0);
  });

  test('switching to strategy grouping shows strategy swimlane rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-strategy').click();
    await expect(page.locator('[data-testid^="swimlane-row-strategy-"]').first()).toBeVisible();
  });

  test('switching back to asset restores category rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]').first()).toBeVisible();
    await openViewOptions(page);
    await page.getByTestId('group-by-asset').click();
    await expect(page.locator('[data-testid^="category-row-"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]')).toHaveCount(0);
  });

  test.skip('grouping mode persists across reloads', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-strategy').click();
    await expect(page.locator('[data-testid^="swimlane-row-strategy-"]').first()).toBeVisible();
    await page.reload();
    await page.waitForSelector('[data-testid^="swimlane-row-strategy-"]', { timeout: 5000 });
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-strategy')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Swimlane Height Collapse', () => {
  test('should adjust swimlane height when group is collapsed/expanded', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const targetAssetId = 'a-ciam';
    const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
    const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

    const initialBox = await rowContent.boundingBox();
    const initialHeight = initialBox?.height || 0;
    console.log(`Initial height: ${initialHeight}`);

    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 15000 });
    
    await targetRow.hover();
    const collapseBtn = groupBox.getByTestId('collapse-group-btn');
    await collapseBtn.click();

    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 15000 });

    await expect(async () => {
      const box = await rowContent.boundingBox();
      expect(box?.height).toBeLessThan(initialHeight);
    }).toPass({ timeout: 2000 });
    const collapsedBox = await rowContent.boundingBox();
    const collapsedHeight = collapsedBox?.height || 0;
    console.log(`Collapsed height: ${collapsedHeight}`);

    expect(collapsedHeight).toBeLessThan(initialHeight);

    await projectBar.hover();
    const expandBtn = projectBar.getByTestId('expand-group-btn');
    await expandBtn.click();

    await expect(async () => {
      const box = await rowContent.boundingBox();
      expect(box?.height).toBeGreaterThan(collapsedHeight);
    }).toPass({ timeout: 2000 });
    const expandedBox = await rowContent.boundingBox();
    const expandedHeight = expandedBox?.height || 0;
    console.log(`Expanded height: ${expandedHeight}`);

    expect(expandedHeight).toBeCloseTo(initialHeight, 1);
  });
});

test.describe('Swimlane Padding', () => {
    test('should have compact swimlane heights', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

        const targetAssetId = 'a-pam';
        const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
        const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

        const rowBox = await rowContent.boundingBox();
        const rowHeight = rowBox?.height || 0;
        console.log(`Row height for ${targetAssetId}: ${rowHeight}`);

        expect(rowHeight).toBeLessThanOrEqual(65);
    });

    test('should have compact gaps between multi-row initiatives', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
        const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

        const rowBox = await rowContent.boundingBox();
        const rowHeight = rowBox?.height || 0;
        console.log(`Row height for ${targetAssetId}: ${rowHeight}`);

        expect(rowHeight).toBeLessThanOrEqual(140);
    });

    test('should have consistent height when a group is collapsed', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-testid="asset-row-${targetAssetId}"]`);
        const rowContent = targetRow.locator('[data-testid="asset-row-content"]');

        const groupBox = targetRow.getByTestId('initiative-group-box');
        const collapseBtn = groupBox.getByTestId('collapse-group-btn');
        await collapseBtn.click({ force: true });

        const rowBox = await rowContent.boundingBox();
        const rowHeight = rowBox?.height || 0;
        console.log(`Row height for collapsed ${targetAssetId}: ${rowHeight}`);

        expect(rowHeight).toBe(60);
    });
});

/**
 * User Story: Single Applications Swimlane Per Asset
 *
 * As a Scenia user I want one consolidated Applications swimlane per IT Asset
 * (rather than one row per application) so that I can add lifecycle segments
 * for any technology on a single row, and the IT Asset label spans both
 * the Initiatives and Applications swimlanes.
 *
 * Acceptance Criteria:
 *  AC1  There is exactly one Applications swimlane per asset that has applications
 *       (3 for demo data: Customer CIAM, Web Channel, Mobile Channel).
 *  AC2  Demo segments from all applications within an asset appear on the single
 *       merged swimlane.
 *  AC3  Display mode "Both" shows both the initiatives row and the applications row
 *       for each asset.
 *  AC4  Display mode "Initiatives" shows the initiatives row and hides the
 *       applications swimlane.
 *  AC5  Display mode "Applications" hides the initiatives row and shows the
 *       applications swimlane.
 *  AC6  Double-clicking the applications swimlane opens the segment creation panel.
 *  AC7  An asset with no applications has no applications swimlane.
 */
test.describe('Single Applications Swimlane Per Asset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1 – one applications swimlane per asset with applications (3 in demo data)', async ({ page }) => {
    const appSwimlanes = page.locator('[data-testid^="application-swimlane-"]');
    await expect(appSwimlanes).toHaveCount(3);
  });

  test('AC2 – segments from all apps on the asset appear on the single swimlane', async ({ page }) => {
    const ciamSwimlane = page.locator('[data-testid="application-swimlane-a-ciam"]');
    await expect(ciamSwimlane).toBeVisible();
    const bars = ciamSwimlane.locator('[data-testid^="segment-bar-"]');
    const count = await bars.count();
    expect(count).toBeGreaterThan(1);
  });

  test('AC3 – display Both shows initiatives row AND applications swimlane', async ({ page }) => {
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
  });

  test('AC4 – display Initiatives hides the applications swimlane', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await page.mouse.click(100, 100);

    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]')).toHaveCount(0);
  });

  test('AC5 – display Applications hides the initiatives row', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100);

    await expect(page.locator('[data-testid="asset-row-content"]')).toHaveCount(0);
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
  });

  test('AC6 – double-clicking the applications swimlane opens segment creation panel', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible({ timeout: 5000 });
  });

  test('AC7 – asset with no applications has no applications swimlane', async ({ page }) => {
    await expect(page.locator('[data-testid="application-swimlane-a-k8s"]')).toHaveCount(0);
  });

  test('AC8 – overlapping segments shift down instead of rendering on top of each other', async ({ page }) => {
    const ciamSwimlane = page.locator('[data-testid="application-swimlane-a-ciam"]');
    await expect(ciamSwimlane).toBeVisible();

    const box = await ciamSwimlane.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(52);

    const oktaBar = ciamSwimlane.locator('[data-testid="segment-bar-seg-okta-prod"]');
    const azureBar = ciamSwimlane.locator('[data-testid="segment-bar-seg-azuread-prod"]');
    await expect(oktaBar).toBeVisible();
    await expect(azureBar).toBeVisible();

    const oktaBox = await oktaBar.boundingBox();
    const azureBox = await azureBar.boundingBox();
    expect(oktaBox).not.toBeNull();
    expect(azureBox).not.toBeNull();
    expect(Math.abs(oktaBox!.y - azureBox!.y)).toBeGreaterThan(10);
  });
});
