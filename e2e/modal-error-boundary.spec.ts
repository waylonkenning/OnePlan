import { test, expect } from '@playwright/test';

// US-2026-04-04-004: Modal Error Boundary
//
// AC1: A modal render error shows modal-error-boundary overlay (not full-page crash)
// AC2: Clicking Close dismisses the overlay and closes the modal
// AC3: The app remains functional after dismissal
// AC4: The full-page ErrorBoundary is NOT triggered

test.describe('ModalErrorBoundary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="nav-features"]', { timeout: 10000 });
  });

  test('AC1: modal render error shows modal-error-boundary, not full-page crash', async ({ page }) => {
    // Arm the error thrower before opening the modal
    await page.evaluate(() => localStorage.setItem('scenia-test-throw', 'true'));

    await page.getByTestId('nav-features').click();

    // Modal error boundary should appear
    await expect(page.getByTestId('modal-error-boundary')).toBeVisible({ timeout: 5000 });

    // Full-page error boundary must NOT be shown
    await expect(page.getByTestId('error-boundary-ui')).not.toBeVisible();
  });

  test('AC2: clicking Close dismisses the modal-error-boundary overlay', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('scenia-test-throw', 'true'));
    await page.getByTestId('nav-features').click();
    await expect(page.getByTestId('modal-error-boundary')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('modal-error-boundary').getByRole('button', { name: 'Close' }).click();

    await expect(page.getByTestId('modal-error-boundary')).not.toBeVisible();
  });

  test('AC3: app is functional after dismissing a modal error', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('scenia-test-throw', 'true'));
    await page.getByTestId('nav-features').click();
    await expect(page.getByTestId('modal-error-boundary')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('modal-error-boundary').getByRole('button', { name: 'Close' }).click();

    // Disarm the thrower so the next modal opens normally
    await page.evaluate(() => localStorage.removeItem('scenia-test-throw'));

    // App should still be interactive — open the keyboard shortcuts modal
    await page.getByTestId('keyboard-shortcuts-btn').click();
    await expect(page.getByTestId('keyboard-shortcuts-modal')).toBeVisible({ timeout: 5000 });
  });

  test('AC4: modal error does not trigger the full-page ErrorBoundary', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('scenia-test-throw', 'true'));
    await page.getByTestId('nav-features').click();
    await expect(page.getByTestId('modal-error-boundary')).toBeVisible({ timeout: 5000 });

    // Full-page crash UI must never appear
    await expect(page.getByTestId('error-boundary-ui')).not.toBeVisible();

    // Main timeline content still visible behind the overlay
    await expect(page.locator('main')).toBeVisible();
  });
});
