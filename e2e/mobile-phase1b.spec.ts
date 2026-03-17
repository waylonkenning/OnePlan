import { test, expect } from '@playwright/test';

/**
 * Phase 1b mobile foundation — overflow-x-auto on header and data table.
 */
test.describe('Mobile Phase 1b — Horizontal Scroll', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('header is horizontally scrollable on mobile', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const overflowX = await header.evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll']).toContain(overflowX);
  });

  test('header controls are reachable by scrolling on mobile', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');

    // Import button is off-screen on 393px but reachable via scroll
    const importBtn = page.getByRole('button', { name: 'Import' });

    // Scroll header to the right and verify Import becomes visible
    await header.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await expect(importBtn).toBeVisible();
  });

  test('data manager table is horizontally scrollable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();

    // The EditableTable wrapper div (overflow-auto) should be present
    const tableScrollContainer = page.locator('.flex-1.overflow-auto.border.border-slate-200.rounded-lg');
    await expect(tableScrollContainer).toBeVisible();

    const overflowX = await tableScrollContainer.evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll']).toContain(overflowX);
  });
});
