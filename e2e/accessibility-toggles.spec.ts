import { test, expect } from '@playwright/test';

/**
 * Accessibility: header toggle buttons must convey their purpose and active
 * state to screen readers via aria-label and aria-pressed, not colour alone.
 */
test.describe('Header toggle button accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('conflict detection toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-conflicts');
    await expect(btn).toHaveAttribute('aria-label');
    // Default state is on — aria-pressed should be "true"
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    // Click to toggle off — aria-pressed should become "false"
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('relationships toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-relationships');
    await expect(btn).toHaveAttribute('aria-label');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('descriptions toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-descriptions');
    await expect(btn).toHaveAttribute('aria-label');
    // Default state is off
    await expect(btn).toHaveAttribute('aria-pressed', 'false');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('budget toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-budget');
    await expect(btn).toHaveAttribute('aria-label');
    // Default state is off
    await expect(btn).toHaveAttribute('aria-pressed', 'false');

    // Click once to enable label mode — should be pressed
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    // Click again to bar-height mode — still pressed
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    // Click again to cycle back to off — not pressed
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});
