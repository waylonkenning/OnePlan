import { test, expect } from '@playwright/test';

/**
 * A "Reports" tab appears in the top navigation alongside Visualiser and
 * Data Manager. Clicking it shows the Reports view.
 */
test.describe('Reports mode', () => {
  test('Reports nav button is present in the header', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await expect(page.getByTestId('nav-reports')).toBeVisible();
  });

  test('clicking Reports switches to the Reports view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await page.getByTestId('nav-reports').click();

    await expect(page.getByTestId('reports-view')).toBeVisible();
  });

  test('Reports nav button is highlighted when active', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const navBtn = page.getByTestId('nav-reports');
    await navBtn.click();

    // Active state: bg-white shadow ring (same pattern as Visualiser/Data Manager)
    const classes = await navBtn.getAttribute('class');
    expect(classes).toContain('bg-white');
  });

  test('switching away from Reports and back retains the Reports view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('reports-view')).toBeVisible();

    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTestId('reports-view')).not.toBeVisible();

    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('reports-view')).toBeVisible();
  });
});
