import { test, expect } from '@playwright/test';

/**
 * Dependency arrows must always render above initiative bars,
 * including when bars raise their z-index on hover (hover:z-20).
 */

test('dependency SVG z-index is above initiative bar hover z-index', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="dependencies-svg"]', { timeout: 20000 });

  const svgZIndex = await page.locator('[data-testid="dependencies-svg"]').evaluate(
    el => parseInt(window.getComputedStyle(el).zIndex) || 0
  );

  // Initiative bars use hover:z-20 — the SVG must always sit above that
  expect(svgZIndex).toBeGreaterThan(20);
});

test('dependency arrows are visually above a hovered initiative bar', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 20000 });

  const bar = page.locator('[data-testid="initiative-bar"]').first();
  await bar.hover();

  const [svgZ, barZ] = await Promise.all([
    page.locator('[data-testid="dependencies-svg"]').evaluate(
      el => parseInt(window.getComputedStyle(el).zIndex) || 0
    ),
    bar.evaluate(el => parseInt(window.getComputedStyle(el).zIndex) || 0),
  ]);

  expect(svgZ).toBeGreaterThan(barZ);
});
