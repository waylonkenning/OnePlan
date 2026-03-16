import { test, expect } from '@playwright/test';

test.describe('Version History & Snapshotting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Should allow saving a version and viewing it in the list', async ({ page }) => {
    // 1. Open Version Manager
    await page.getByTestId('nav-history').click();
    await expect(page.getByText('Version History')).toBeVisible();

    // 2. Save a new version
    await page.getByRole('button', { name: 'Save Current State' }).click();
    const versionName = `Test Version ${Date.now()}`;
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', versionName);
    await page.fill('textarea[placeholder="What changes does this version capture?"]', 'Test description');
    await page.getByRole('button', { name: 'Save Version' }).click();

    // 3. Verify it appears in the list
    await expect(page.getByText(versionName)).toBeVisible();
    
    // 4. Select it and verify details
    await page.getByText(versionName).click();
    await expect(page.locator('h3', { hasText: versionName })).toBeVisible();
    await expect(page.getByText('Test description')).toBeVisible();
  });

  test('Should generate a difference report', async ({ page }) => {
    // 1. Save a baseline version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    const baselineName = 'Baseline';
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', baselineName);
    await page.getByRole('button', { name: 'Save Version' }).click();
    
    // Close modal
    await page.getByTestId('close-version-manager').click();

    // 2. Make a change (Rename an initiative)
    await page.getByTestId('nav-data-manager').click();
    const firstInitName = page.locator('input[data-testid^="real-input-name"]').first();
    const originalName = await firstInitName.inputValue();
    const newName = originalName + ' MODIFIED';
    
    // Clear and fill
    await firstInitName.click();
    await firstInitName.fill(newName);
    await firstInitName.press('Enter');
    
    // Small wait for persistence
    await page.waitForTimeout(200);

    // 3. Open History and run report
    await page.getByTestId('nav-history').click();
    await page.getByText(baselineName).click();
    await page.getByRole('button', { name: 'Run Difference Report' }).click();

    // 4. Verify the report shows the change
    await expect(page.getByRole('heading', { name: 'Difference Report' })).toBeVisible();
    await expect(page.getByText(newName).first()).toBeVisible();
    await expect(page.getByText(`Name changed from "${originalName}" to "${newName}"`)).toBeVisible();
    
    // 5. Close report
    await page.getByTestId('close-report-btn').click();
    await expect(page.getByRole('heading', { name: 'Difference Report' })).not.toBeVisible();
  });

  test('Should allow restoring a previous version', async ({ page }) => {
    // 1. Save a baseline version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    const baselineName = 'To Restore';
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', baselineName);
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // 2. Make a radical change (Delete an initiative)
    await page.getByTestId('nav-data-manager').click();
    const countBefore = await page.locator('input[data-testid^="real-input-name"]').count();
    const firstInitName = await page.locator('input[data-testid^="real-input-name"]').first().inputValue();
    
    // Delete the first row
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button[title="Delete row"]').first().click();
    await expect(page.locator('input[data-testid^="real-input-name"]')).toHaveCount(countBefore - 1);

    // 3. Restore the version
    await page.getByTestId('nav-history').click();
    await page.getByText(baselineName).click();
    
    // Set up confirmation handler
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Restore to Current' }).click();

    // 4. Verify data is back
    await expect(page.getByText('Version History')).not.toBeVisible();
    await page.getByTestId('nav-data-manager').click();
    await expect(page.locator('input[data-testid^="real-input-name"]')).toHaveCount(countBefore);
    await expect(page.locator('input[data-testid^="real-input-name"]').first()).toHaveValue(firstInitName);
  });
});
