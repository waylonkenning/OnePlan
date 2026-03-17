import { test, expect } from '@playwright/test';

/**
 * Clicking a dependency arrow label shows a tooltip with the full
 * plain-language relationship sentence using initiative names.
 */

test('clicking a dependency label shows a tooltip with the relationship sentence', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="dep-label-rect"]', { timeout: 20000 });

  const labelRect = page.locator('[data-testid="dep-label-rect"]').first();
  await labelRect.click();

  const tooltip = page.locator('[data-testid="arrow-label-tooltip"]');
  await expect(tooltip).toBeVisible({ timeout: 3000 });

  // Tooltip must contain a meaningful sentence (not just the type word)
  const text = await tooltip.textContent();
  expect(text).toBeTruthy();
  expect(text!.length).toBeGreaterThan(20);
  // Must reference initiative names (not just "blocks" / "requires")
  expect(text).toMatch(/must finish|requires|general connection/i);
});

test('clicking the tooltip dismisses it', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="dep-label-rect"]', { timeout: 20000 });

  await page.locator('[data-testid="dep-label-rect"]').first().click();
  const tooltip = page.locator('[data-testid="arrow-label-tooltip"]');
  await expect(tooltip).toBeVisible({ timeout: 3000 });

  await tooltip.click();
  await expect(tooltip).toBeHidden();
});

test('clicking the label does not open the dependency edit panel', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="dep-label-rect"]', { timeout: 20000 });

  await page.locator('[data-testid="dep-label-rect"]').first().click();

  // Tooltip appears but edit panel must NOT open
  await expect(page.locator('[data-testid="arrow-label-tooltip"]')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('[data-testid="dependency-panel"]')).toBeHidden();
});
