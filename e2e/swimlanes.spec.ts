import { test, expect, Page } from '@playwright/test';

async function openViewOptions(page: Page) {
  const popover = page.getByTestId('view-options-popover');
  if (!await popover.isVisible()) {
    await page.getByTestId('view-options-btn').click();
    await expect(popover).toBeVisible();
  }
}

test.describe('Swimlane Grouping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('group-by selector visible with Asset/Programme/Strategy options', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-asset')).toBeVisible();
    await expect(page.getByTestId('group-by-programme')).toBeVisible();
    await expect(page.getByTestId('group-by-strategy')).toBeVisible();
  });

  test('default grouping is asset (category rows visible, asset button active)', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-asset')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid^="category-row-"]').first()).toBeVisible();
  });

  test('switching to programme grouping shows programme rows and hides category rows', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-programme').click();
    await expect(page.locator('[data-testid^="swimlane-row-programme-"]').first()).toBeVisible();
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

  test('grouping mode persists across reloads', async ({ page }) => {
    await openViewOptions(page);
    await page.getByTestId('group-by-strategy').click();
    await expect(page.locator('[data-testid^="swimlane-row-strategy-"]').first()).toBeVisible();
    await page.reload();
    await page.waitForSelector('[data-testid^="swimlane-row-strategy-"]', { timeout: 10000 });
    await openViewOptions(page);
    await expect(page.getByTestId('group-by-strategy')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Swimlane Height & Padding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('single-initiative rows have compact height (≤65px)', async ({ page }) => {
    const rowContent = page.locator('[data-testid="asset-row-a-pam"]').locator('[data-testid="asset-row-content"]');
    const rowHeight = (await rowContent.boundingBox())?.height || 0;
    expect(rowHeight).toBeLessThanOrEqual(65);
  });

  test('multi-initiative rows have compact height (≤140px)', async ({ page }) => {
    const rowContent = page.locator('[data-testid="asset-row-a-ciam"]').locator('[data-testid="asset-row-content"]');
    const rowHeight = (await rowContent.boundingBox())?.height || 0;
    expect(rowHeight).toBeLessThanOrEqual(140);
  });

  test('collapsed group row has consistent height (60px)', async ({ page }) => {
    const targetRow = page.locator('[data-testid="asset-row-a-ciam"]');
    const rowContent = targetRow.locator('[data-testid="asset-row-content"]');
    await targetRow.getByTestId('initiative-group-box').getByTestId('collapse-group-btn').click({ force: true });
    const rowHeight = (await rowContent.boundingBox())?.height || 0;
    expect(rowHeight).toBe(60);
  });

  test('group collapse and expand adjusts swimlane height', async ({ page }) => {
    test.setTimeout(60000);
    const targetRow = page.locator('[data-testid="asset-row-a-ciam"]');
    const rowContent = targetRow.locator('[data-testid="asset-row-content"]');
    const initialHeight = (await rowContent.boundingBox())?.height || 0;

    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 10000 });
    await targetRow.hover();
    await groupBox.getByTestId('collapse-group-btn').click();

    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 10000 });
    await expect(async () => {
      expect((await rowContent.boundingBox())?.height).toBeLessThan(initialHeight);
    }).toPass({ timeout: 2000 });

    const collapsedHeight = (await rowContent.boundingBox())?.height || 0;

    await projectBar.hover();
    await projectBar.getByTestId('expand-group-btn').click();
    await expect(async () => {
      expect((await rowContent.boundingBox())?.height).toBeGreaterThan(collapsedHeight);
    }).toPass({ timeout: 2000 });

    const expandedHeight = (await rowContent.boundingBox())?.height || 0;
    expect(expandedHeight).toBeCloseTo(initialHeight, 1);
  });
});
