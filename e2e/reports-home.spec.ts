import { test, expect } from '@playwright/test';

test.describe('Reports Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
  });

  test('shows a home screen with 4 report cards', async ({ page }) => {
    await expect(page.getByTestId('reports-view')).toBeVisible();
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-card-version-history')).toBeVisible();
    await expect(page.getByTestId('report-card-budget')).toBeVisible();
    await expect(page.getByTestId('report-card-initiatives-dependencies')).toBeVisible();
    await expect(page.getByTestId('report-card-capacity')).toBeVisible();
  });

  test('home screen does not show any report view directly', async ({ page }) => {
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-version-history')).not.toBeVisible();
    await expect(page.getByTestId('report-view-budget')).not.toBeVisible();
    await expect(page.getByTestId('report-view-initiatives-dependencies')).not.toBeVisible();
    await expect(page.getByTestId('report-view-capacity')).not.toBeVisible();
  });

  test('clicking Version History card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-version-history').click();
    await expect(page.getByTestId('report-view-version-history')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('clicking Budget Report card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('report-view-budget')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('clicking Initiatives & Dependencies card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-initiatives-dependencies').click();
    await expect(page.getByTestId('report-view-initiatives-dependencies')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('clicking Capacity & Resources card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-capacity').click();
    await expect(page.getByTestId('report-view-capacity')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('back button returns to home screen', async ({ page }) => {
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('report-view-budget')).toBeVisible();

    await page.getByTestId('report-back-btn').click();
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-budget')).not.toBeVisible();
  });

  test('navigating away from Reports and back resets to home screen', async ({ page }) => {
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('report-view-budget')).toBeVisible();

    await page.getByTestId('nav-visualiser').click();
    await page.getByTestId('nav-reports').click();

    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-budget')).not.toBeVisible();
  });
});
