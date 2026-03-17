import { test, expect } from '@playwright/test';

/**
 * Accessibility: panels must trap focus and close on Escape so keyboard
 * users aren't forced to Tab through the entire page to dismiss them.
 */
test.describe('Panel focus trap and Escape key', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('InitiativePanel closes on Escape', async ({ page }) => {
    // Open the initiative panel by clicking a bar
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('initiative-panel')).not.toBeVisible({ timeout: 3000 });
  });

  test('InitiativePanel traps focus — Tab does not leave the panel', async ({ page }) => {
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Tab through enough times to cycle past the last focusable element
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus must remain inside the panel
    const focusedElement = page.locator(':focus');
    await expect(panel.locator(':focus')).toBeAttached({ timeout: 2000 });
  });

  test('DependencyPanel closes on Escape', async ({ page }) => {
    // Open a dependency arrow's panel via the edit modal
    // First create a dep by clicking on a dep arrow using the data-dep-id
    const depArrow = page.locator('[data-dep-id="dep-1"]').first();
    await depArrow.click({ force: true });
    await expect(page.getByTestId('dependency-panel')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('dependency-panel')).not.toBeVisible({ timeout: 3000 });
  });

  test('VersionManager closes on Escape', async ({ page }) => {
    await page.getByTestId('nav-history').click();
    await expect(page.locator('[data-testid="close-version-manager"]')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="close-version-manager"]')).not.toBeVisible({ timeout: 3000 });
  });
});
