import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  // Clear local storage before tests to ensure landing page shows
  test.beforeEach(async ({ page }) => {
    // To clear local storage we need to go to the page first
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    // Reload so the clear takes effect
    await page.reload();
  });

  test('should show landing page on first visit and dismiss on Get Started click', async ({ page }) => {
    // Verify landing page is visible
    const getStartedButton = page.getByRole('button', { name: 'Get Started Now' });
    await expect(getStartedButton).toBeVisible();

    // Verify hero text
    await expect(page.getByText('Enterprise Planning,')).toBeVisible();

    // Verify app elements are fundamentally hiding beneath / not focusable while landing page is up
    // Actually the landing page is over them within the DOM, but let's just make sure
    // OnePlan header is in the landing page too so we look for 'Visualiser' nav
    const visualiserButton = page.getByTestId('nav-visualiser');
    
    // Click Get Started
    await getStartedButton.click();

    // Verify landing page is gone
    await expect(getStartedButton).not.toBeVisible();

    // Verify app is visible and interactive
    await expect(visualiserButton).toBeVisible();

    // Reload page to verify local storage persistence
    await page.reload();

    // Landing page should NOT be visible
    await expect(getStartedButton).not.toBeVisible();
    await expect(visualiserButton).toBeVisible();
  });
});
