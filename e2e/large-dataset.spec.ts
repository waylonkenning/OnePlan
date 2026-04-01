import { test, expect } from '@playwright/test';

/**
 * Large dataset stress test.
 *
 * Verifies that the greedy placement algorithm handles 20+ overlapping
 * initiatives on a single asset without infinite loops, JS errors, or
 * UI breakage.
 */
test('Greedy placement handles 20+ overlapping initiatives without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');

  // Navigate to Data Manager → Initiatives
  await page.getByRole('button', { name: 'Data Manager' }).click();
  await page.getByRole('button', { name: /Initiatives/ }).click();

  // Get the first asset id from the Assets tab
  await page.getByRole('button', { name: /Assets/ }).click();
  const firstAssetIdInput = page.locator('table tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
  const assetId = await firstAssetIdInput.getAttribute('value') ?? 'asset-1';

  // Get the first programme id from the Programmes tab
  await page.getByRole('button', { name: /Programmes/ }).click();
  const firstProgrammeIdInput = page.locator('table tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
  const programmeId = await firstProgrammeIdInput.getAttribute('value') ?? 'prog-1';

  // Switch back to Initiatives and use Paste CSV to insert 22 overlapping initiatives
  await page.getByRole('button', { name: /Initiatives/ }).click();
  await page.getByRole('button', { name: 'Paste CSV' }).click();

  // Build CSV with 22 initiatives all spanning the same date range on the same asset
  const rows = ['id,name,programmeId,assetId,startDate,endDate,budget'];
  for (let i = 1; i <= 22; i++) {
    rows.push(`stress-init-${i},Stress Initiative ${i},${programmeId},${assetId},2026-01-01,2026-06-30,100000`);
  }
  const csv = rows.join('\n');

  const textarea = page.getByTestId('csv-paste-textarea');
  await textarea.fill(csv);

  const importBtn = page.getByTestId('import-rows-button');
  await expect(importBtn).toBeEnabled({ timeout: 5000 });
  await importBtn.click();

  await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

  // Switch to Visualiser to trigger layout algorithm
  await page.getByRole('button', { name: 'Visualiser' }).click();

  // Wait for timeline to render — no spinner, no error boundary
  await expect(page.locator('#timeline-visualiser')).toBeVisible({ timeout: 10000 });

  // Verify no JS errors occurred (filter ResizeObserver noise)
  expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);

  // Verify initiative bars rendered
  const bars = page.locator('[data-testid^="initiative-bar"]');
  await expect(bars.first()).toBeVisible({ timeout: 5000 });

  // Verify the page is still interactive
  await expect(page.getByRole('button', { name: 'Data Manager' })).toBeEnabled();
});
