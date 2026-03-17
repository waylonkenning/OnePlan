import { test, expect } from '@playwright/test';

/**
 * Collapsed initiative groups must display each initiative name
 * on its own line as a bullet point (• Name), not joined with " + ".
 */

test.describe('Grouped initiative description — bullet points', () => {
  async function collapseAndShowDescription(page: any) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Enable description display via inline toggle
    await page.getByTestId('toggle-descriptions').click();

    // Collapse the CIAM group (Passkey Rollout + SSO Consolidation)
    const targetRow = page.locator('[data-asset-id="a-ciam"]');
    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 15000 });
    await targetRow.hover();
    await groupBox.getByTestId('collapse-group-btn').click();

    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 15000 });
    return projectBar;
  }

  test('each initiative name appears as a bullet point on its own line', async ({ page }) => {
    const projectBar = await collapseAndShowDescription(page);

    // Must contain bullet characters
    await expect(projectBar).toContainText('•');

    // Must NOT use the old " + " separator
    const text = await projectBar.textContent();
    expect(text).not.toContain(' + ');
  });

  test('each initiative name is prefixed with a bullet', async ({ page }) => {
    const projectBar = await collapseAndShowDescription(page);

    // Both initiative names must appear prefixed with •
    await expect(projectBar).toContainText('• Passkey Rollout');
    await expect(projectBar).toContainText('• SSO Consolidation');
  });
});
