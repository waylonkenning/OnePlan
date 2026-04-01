import { test, expect } from '@playwright/test';

test('Conflict detection toggle works', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser');

  // By default, conflict detection is ON.
  // Check if "Conflict Detected" is present.
  const conflictText = page.getByText('Conflict Detected').first();
  await expect(conflictText).toBeVisible({ timeout: 10000 });

  // Toggle conflict detection OFF via inline icon toggle
  const conflictToggle = page.getByTestId('toggle-conflicts');
  await conflictToggle.click();

  // Verify "Conflict Detected" is gone
  await expect(conflictText).not.toBeVisible();

  // Toggle back ON
  await conflictToggle.click();
  await expect(conflictText).toBeVisible();
});
