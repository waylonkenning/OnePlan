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
    const getStartedButton = page.getByRole('button', { name: "Get Started — It's Free" });
    await expect(getStartedButton).toBeVisible();

    // Verify hero text
    await expect(page.getByText('Your IT Portfolio,')).toBeVisible();

    // Verify app elements are fundamentally hiding beneath / not focusable while landing page is up
    // Actually the landing page is over them within the DOM, but let's just make sure
    // Scenia header is in the landing page too so we look for 'Visualiser' nav
    const visualiserButton = page.getByTestId('nav-visualiser');

    // Click Get Started
    await getStartedButton.click();

    // Verify landing page is gone
    await expect(page.getByRole('button', { name: "Get Started — It's Free" })).not.toBeVisible();

    // Verify app is visible and interactive
    await expect(visualiserButton).toBeVisible();

    // Reload page to verify local storage persistence
    await page.reload();

    // Landing page should NOT be visible
    await expect(page.getByRole('button', { name: "Get Started — It's Free" })).not.toBeVisible();
    await expect(visualiserButton).toBeVisible();
  });

  test('should display open source badge and GitHub link', async ({ page }) => {
    await expect(page.getByText('Free & Open Source')).toBeVisible();

    // GitHub link in nav header
    const navGitHubLink = page.getByRole('link', { name: 'GitHub' }).first();
    await expect(navGitHubLink).toBeVisible();
    await expect(navGitHubLink).toHaveAttribute('href', 'https://github.com/waylonkenning/scenia');

    // "No signup" tagline under CTA
    await expect(page.getByText('No signup. No servers. Instantly ready.').first()).toBeVisible();
  });

  test('should display all six feature cards', async ({ page }) => {
    await expect(page.getByText('Dependency Mapping')).toBeVisible();
    await expect(page.getByText('Intuitive Canvas')).toBeVisible();
    await expect(page.getByText('Conflict Detection')).toBeVisible();
    await expect(page.getByText('Version History')).toBeVisible();
    await expect(page.getByText('Excel & PDF Export')).toBeVisible();
    await expect(page.getByText('100% Private')).toBeVisible();
  });

  test('feature cards mention key current capabilities', async ({ page }) => {
    // Dependency Mapping card mentions milestone dependencies and critical path
    const depCard = page.locator('div').filter({ hasText: /^Dependency Mapping/ }).first();
    await expect(depCard).toContainText(/milestone/i);
    await expect(depCard).toContainText(/critical path/i);

    // Intuitive Canvas card mentions resource assignment
    const canvasCard = page.locator('div').filter({ hasText: /^Intuitive Canvas/ }).first();
    await expect(canvasCard).toContainText(/resource/i);

    // Excel & PDF Export card mentions capacity report
    const exportCard = page.locator('div').filter({ hasText: /^Excel & PDF Export/ }).first();
    await expect(exportCard).toContainText(/capacity/i);
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
      localStorage.setItem('scenia_has_seen_landing', 'true');
      localStorage.setItem('scenia-e2e', 'true');
    });
    await page.reload();
  });

  test('should display correct text and links in app footer', async ({ page }) => {
    const footer = page.locator('footer').last();

    // Static text
    await expect(footer).toContainText('Scenia IT Initiative Planner');
    await expect(footer).toContainText('an open source tool from');

    // "open source" links to GitHub
    const openSourceLink = footer.getByRole('link', { name: 'open source' });
    await expect(openSourceLink).toBeVisible();
    await expect(openSourceLink).toHaveAttribute('href', 'https://github.com/waylonkenning/scenia');

    // "Waylon Kenning" links to kenning.co.nz
    const kenningLink = footer.getByRole('link', { name: 'Waylon Kenning' });
    await expect(kenningLink).toBeVisible();
    await expect(kenningLink).toHaveAttribute('href', 'https://kenning.co.nz');
  });
});
