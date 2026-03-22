import { test, expect } from '@playwright/test';

test.describe('Capacity Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-reports').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 15000 });
    await page.getByTestId('report-card-capacity').click();
  });

  test('Capacity Report section is visible in Reports view', async ({ page }) => {
    await expect(page.getByTestId('capacity-report')).toBeVisible();
  });

  test('Capacity Report lists each resource by name', async ({ page }) => {
    // Demo data has 6 resources
    const rows = page.locator('[data-testid="capacity-resource-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('Capacity Report shows initiatives assigned to a resource', async ({ page }) => {
    // Sarah Chen (res-1) is owner of SSO Consolidation
    const sarahRow = page.getByTestId('capacity-resource-row-res-1');
    await expect(sarahRow).toBeVisible();
    await expect(sarahRow).toContainText('Sarah Chen');
    await expect(sarahRow).toContainText('SSO Consolidation');
  });

  test('Capacity Report shows date range for each assigned initiative', async ({ page }) => {
    const sarahRow = page.getByTestId('capacity-resource-row-res-1');
    // Should show a date range like "Jul 2026 → Mar 2027"
    await expect(sarahRow).toContainText('→');
  });

  test('Capacity Report shows empty state for unassigned resources', async ({ page }) => {
    // Add a new resource with no initiative assignments via the Data Manager
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.locator('table tbody tr[data-real="true"]').last().locator('input[type="text"]').first().fill('Test Resource');
    // Navigate to capacity report
    await page.getByTestId('nav-reports').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 15000 });
    await page.getByTestId('report-card-capacity').click();
    // The new resource has no assignments — should show the empty state
    const testRow = page.locator('[data-testid="capacity-resource-row"]').filter({ hasText: 'Test Resource' });
    await expect(testRow).toBeVisible();
    await expect(testRow.getByTestId('capacity-no-assignments')).toBeVisible();
  });

  test('Capacity Report shows total assignment count per resource', async ({ page }) => {
    // Business Analyst (res-3) is assigned to 7 initiatives via resourceIds in demo data
    const baRow = page.getByTestId('capacity-resource-row-res-3');
    await expect(baRow.getByTestId('capacity-assignment-count')).toContainText('7');
  });

  test('Capacity Report shows prompt when no resources exist', async ({ page }) => {
    // Clear all resources via Data Manager
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    // Delete all resource rows
    const deleteButtons = page.locator('[data-testid="delete-row-btn-resources"]');
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await page.locator('[data-testid="delete-row-btn-resources"]').first().click();
    }
    await page.getByTestId('nav-reports').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 15000 });
    await page.getByTestId('report-card-capacity').click();
    await expect(page.getByTestId('capacity-no-resources')).toBeVisible();
  });
});
