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

  test('should display open source badge and GitHub links', async ({ page }) => {
    await expect(page.getByText('Open Source · Apache 2.0')).toBeVisible();

    // GitHub link in nav header (first GitHub link in DOM order)
    const navGitHubLink = page.getByRole('link', { name: 'GitHub' }).first();
    await expect(navGitHubLink).toBeVisible();
    await expect(navGitHubLink).toHaveAttribute('href', 'https://github.com/waylonkenning/OnePlan');

    // "View on GitHub" CTA button (unique name, no ambiguity)
    const githubCta = page.getByRole('link', { name: 'View on GitHub' });
    await expect(githubCta).toBeVisible();
    await expect(githubCta).toHaveAttribute('href', 'https://github.com/waylonkenning/OnePlan');
  });

  test('should display all six feature cards', async ({ page }) => {
    await expect(page.getByText('Dependency Mapping')).toBeVisible();
    await expect(page.getByText('Intuitive Canvas')).toBeVisible();
    await expect(page.getByText('Conflict Detection')).toBeVisible();
    await expect(page.getByText('Version History')).toBeVisible();
    await expect(page.getByText('Excel & PDF Export')).toBeVisible();
    await expect(page.getByText('100% Private')).toBeVisible();
  });

  test('should display Kenning Corporation link in landing page footer', async ({ page }) => {
    // The landing page is rendered after the app in the DOM, so its Kenning link is last
    const kenningLink = page.getByRole('link', { name: 'Kenning Corporation Limited' }).last();
    await expect(kenningLink).toBeVisible();
    await expect(kenningLink).toHaveAttribute('href', 'https://kenning.co.nz');
  });
});

test.describe('App Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('oneplan_has_seen_landing', 'true');
      localStorage.setItem('oneplan-e2e', 'true');
    });
    await page.reload();
  });

  test('should display Kenning Corporation and open source links in app footer', async ({ page }) => {
    const kenningLink = page.getByRole('link', { name: 'Kenning Corporation Limited' });
    await expect(kenningLink).toBeVisible();
    await expect(kenningLink).toHaveAttribute('href', 'https://kenning.co.nz');

    const openSourceLink = page.getByRole('link', { name: 'Open Source' });
    await expect(openSourceLink).toBeVisible();
    await expect(openSourceLink).toHaveAttribute('href', 'https://github.com/waylonkenning/OnePlan');
  });
});
