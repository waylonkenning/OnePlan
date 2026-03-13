import { test, expect } from '@playwright/test';

test('Initiatives touching on same date do not trigger conflict', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser');

  // Go to Data Manager
  await page.getByTestId('nav-data-manager').click();
  
  // Clear all data first
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Delete all rows for this table/i }).click();

  // Paste CSV to ensure exact setup
  await page.getByRole('button', { name: /Paste CSV/i }).click();
  const textarea = page.locator('textarea');
  
  // Columns: name, assetId, programmeId, strategyId, startDate, endDate, budget
  // asset-ciam exists in default assets after reset, but we cleared everything.
  // Wait, if I delete all rows for THIS table, I only delete initiatives.
  // The assets should still be there.
  
  await textarea.fill([
    'name,assetId,startDate,endDate,budget',
    'Init A,a-ciam,2026-01-01,2026-01-10,1000',
    'Init B,a-ciam,2026-01-10,2026-01-20,1000'
  ].join('\n'));
  
  await page.getByTestId('import-rows-button').click();

  // Back to Visualiser
  await page.getByTestId('nav-visualiser').click();
  await page.waitForSelector('#timeline-visualiser');

  // Wait for conflict detection to run
  await page.waitForTimeout(2000);

  // In the current buggy state, this should match "Conflict Detected"
  const conflictText = page.getByText('Conflict Detected');
  
  // The test expects it NOT to be visible.
  // If the bug is present, it WILL be visible, and the test will fail.
  await expect(conflictText).not.toBeVisible();
});
