import { test, expect } from '@playwright/test';

test('Conflict detection toggle works', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser');

  // Wait for the initiatives to load from DB and for conflict detection to run
  await page.waitForTimeout(2000);

  // By default, conflict detection is ON.
  // Check if "Conflict Detected" is present.
  const conflictText = page.getByText('Conflict Detected').first();
  await expect(conflictText).toBeVisible({ timeout: 10000 });

  // Toggle conflict detection OFF
  const toggle = page.locator('#conflictDetection');
  await toggle.selectOption('off');

  // Verify "Conflict Detected" is gone
  await expect(conflictText).not.toBeVisible();

  // Toggle back ON
  await toggle.selectOption('on');
  await expect(conflictText).toBeVisible();
});
