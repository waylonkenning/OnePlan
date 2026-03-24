import { test, expect } from '@playwright/test';

test.describe('Maturity Heatmap Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
  });

  test('Maturity Heatmap card is visible on the reports home screen', async ({ page }) => {
    await expect(page.getByTestId('report-card-maturity-heatmap')).toBeVisible();
  });

  test('clicking the card opens the heatmap report', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await expect(page.getByTestId('report-view-maturity-heatmap')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('heatmap renders category group panels', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await expect(page.getByTestId('heatmap-category-cat-iam')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-data')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-core')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-cloud')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-int')).toBeVisible();
  });

  test('asset with maturity 5 shows correct green background colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    // Customer IAM (CIAM) has maturity 5 in demo data
    const tile = page.getByTestId('heatmap-tile-a-ciam');
    await expect(tile).toBeVisible();
    await expect(tile).toHaveAttribute('data-maturity', '5');
    await expect(tile).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('asset with maturity 1 shows correct red background colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    // Privileged Access Mgmt has maturity 1 in demo data
    const tile = page.getByTestId('heatmap-tile-a-pam');
    await expect(tile).toBeVisible();
    await expect(tile).toHaveAttribute('data-maturity', '1');
    await expect(tile).toHaveCSS('background-color', 'rgb(239, 68, 68)');
  });

  test('unrated asset has no data-maturity attribute and shows grey background', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    // Master Data Mgmt has no maturity in demo data
    const tile = page.getByTestId('heatmap-tile-a-mdm');
    await expect(tile).toBeVisible();
    await expect(tile).not.toHaveAttribute('data-maturity');
    await expect(tile).toHaveCSS('background-color', 'rgb(226, 232, 240)');
  });

  test('clicking a tile opens the AssetPanel', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    await expect(page.getByTestId('asset-panel')).toBeVisible();
  });

  test('AssetPanel shows the correct asset name', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    const panel = page.getByTestId('asset-panel');
    await expect(panel.getByLabel('Asset Name')).toHaveValue('Customer IAM (CIAM)');
  });

  test('AssetPanel shows the correct maturity value', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    const panel = page.getByTestId('asset-panel');
    await expect(panel.getByLabel('Maturity')).toHaveValue('5');
  });

  test('saving a maturity change in AssetPanel updates the tile colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    // Enterprise Data Lake has maturity 3 (amber) in demo data
    await page.getByTestId('heatmap-tile-a-lake').click();
    const panel = page.getByTestId('asset-panel');
    await panel.getByLabel('Maturity').selectOption('5');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByTestId('asset-panel')).not.toBeVisible();
    await expect(page.getByTestId('heatmap-tile-a-lake')).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('cancelling AssetPanel does not change the tile colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    // Customer IAM (CIAM) is maturity 5 (green)
    await page.getByTestId('heatmap-tile-a-ciam').click();
    const panel = page.getByTestId('asset-panel');
    await panel.getByLabel('Maturity').selectOption('1');
    await panel.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('asset-panel')).not.toBeVisible();
    // Tile should still be green (maturity 5 unchanged)
    await expect(page.getByTestId('heatmap-tile-a-ciam')).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('back button returns to the reports home screen', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await expect(page.getByTestId('report-view-maturity-heatmap')).toBeVisible();
    await page.getByTestId('report-back-btn').click();
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-maturity-heatmap')).not.toBeVisible();
  });
});
