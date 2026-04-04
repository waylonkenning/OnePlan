import { test, expect } from '@playwright/test';

test.describe('Conflict Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('conflict detection toggle works', async ({ page }) => {
    const conflictText = page.getByText('Conflict Detected').first();
    await expect(conflictText).toBeVisible({ timeout: 10000 });

    const conflictToggle = page.getByTestId('toggle-conflicts');
    await conflictToggle.click();
    await expect(conflictText).not.toBeVisible();

    await conflictToggle.click();
    await expect(conflictText).toBeVisible();
  });

  test('initiatives touching on same date do not trigger conflict', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();

    await page.getByRole('button', { name: /Delete all rows for this table/i }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: /Paste CSV/i }).click();
    const textarea = page.getByTestId('csv-paste-textarea');
    await textarea.fill([
      'name,assetId,startDate,endDate,budget',
      'Init A,a-ciam,2026-01-01,2026-01-10,1000',
      'Init B,a-ciam,2026-01-10,2026-01-20,1000'
    ].join('\n'));
    await page.getByTestId('import-rows-button').click();

    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('#timeline-visualiser');

    await expect(page.getByText('Conflict Detected')).not.toBeVisible();
  });
});
