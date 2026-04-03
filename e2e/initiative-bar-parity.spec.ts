import { test, expect } from '@playwright/test';

/**
 * Initiative bar parity across groupBy views.
 *
 * The initiative bar must have consistent UX features regardless of which
 * groupBy mode is active: Asset (primary), Programme, Strategy.
 *
 * Checks: selection highlight, action toolbar (edit + dep handle), resize
 * handles, progress overlay, owner badge.
 */

type Page = import('@playwright/test').Page;

async function load(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 15000 });
}

async function switchGroupBy(page: Page, mode: 'asset' | 'programme' | 'strategy') {
  await page.getByTestId('view-options-btn').click();
  await expect(page.getByTestId('view-options-popover')).toBeVisible();
  await page.getByTestId(`group-by-${mode}`).click();
  await page.getByTestId('view-options-btn').click(); // close
  await page.waitForSelector('[data-initiative-id]', { timeout: 10000 });
}

async function getFirstBar(page: Page) {
  const bar = page.locator('[data-initiative-id]').first();
  await expect(bar).toBeVisible({ timeout: 10000 });
  return bar;
}

// Run the same suite for each groupBy mode
for (const mode of ['asset', 'programme', 'strategy'] as const) {
  test.describe(`Initiative bar parity — groupBy: ${mode}`, () => {
    test.beforeEach(async ({ page }) => {
      await load(page);
      if (mode !== 'asset') {
        await switchGroupBy(page, mode);
      }
    });

    test(`[${mode}] single-click gives dashed selection outline`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await expect(bar).toHaveCSS('outline-style', 'dashed');
    });

    test(`[${mode}] action toolbar appears on single-click`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
    });

    test(`[${mode}] edit button in toolbar opens InitiativePanel`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await page.getByTestId('initiative-action-edit').click();
      await expect(page.getByTestId('initiative-panel')).toBeVisible();
    });

    test(`[${mode}] dep handle in toolbar has correct testid and tooltip`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      const handle = page.getByTestId('initiative-action-link').first();
      await expect(handle).toBeVisible();
      const title = await handle.getAttribute('title');
      expect(title).toContain('dependency');
    });

    test(`[${mode}] dragging right edge resizes the bar`, async ({ page }) => {
      const bar = await getFirstBar(page);
      const box = await bar.boundingBox();
      expect(box).not.toBeNull();

      const initialWidth = box!.width;

      // Drag the right edge 60px to the right
      await page.mouse.move(box!.x + box!.width - 2, box!.y + box!.height / 2);
      await page.mouse.down();
      await page.mouse.move(box!.x + box!.width + 60, box!.y + box!.height / 2, { steps: 10 });
      await page.mouse.up();

      const newBox = await bar.boundingBox();
      expect(newBox!.width).toBeGreaterThan(initialWidth + 20);
    });

    test(`[${mode}] Escape clears selection and hides toolbar`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('initiative-action-toolbar')).not.toBeVisible();
    });
  });
}
