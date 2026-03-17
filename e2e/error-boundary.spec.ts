import { test, expect } from '@playwright/test';

test.describe('Error Boundary', () => {
  test('shows friendly error UI when a component throws, not a blank screen', async ({ page }) => {
    // Set a test flag that causes the app to throw during render
    await page.addInitScript(() => {
      localStorage.setItem('oneplan-test-throw', 'true');
    });

    await page.goto('/');

    // Should NOT be a blank screen — the error boundary UI must be visible
    await expect(page.getByTestId('error-boundary-ui')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('error-boundary-ui')).toContainText('Something went wrong');

    // A reload button must be present
    await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
  });

  test('does not show error UI during normal operation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await expect(page.getByTestId('error-boundary-ui')).not.toBeVisible();
  });
});
