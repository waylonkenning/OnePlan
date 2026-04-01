import { test, expect } from '@playwright/test';

/**
 * The Initiative panel must display a "Related Initiatives" section
 * listing any dependencies that involve the current initiative.
 */
test.describe('InitiativePanel — related initiatives', () => {
  test('shows related initiatives section when editing an initiative with dependencies', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Passkey Rollout (i-ciam-passkey) has a dependency with SSO Consolidation in demo data
    const passkey = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await expect(passkey).toBeVisible({ timeout: 10000 });
    await passkey.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // The related initiatives section must be visible
    const relatedSection = page.getByTestId('related-initiatives-section');
    await expect(relatedSection).toBeVisible();

    // It must list SSO Consolidation
    await expect(relatedSection).toContainText('SSO Consolidation');
  });

  test('shows no related initiatives section when initiative has no dependencies', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // ZTNA Rollout (i-eiam-ztna) has no dependencies in demo data
    const ztna = page.locator('[data-initiative-id="i-eiam-ztna"]').first();
    await expect(ztna).toBeVisible({ timeout: 10000 });
    await ztna.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const relatedSection = page.getByTestId('related-initiatives-section');
    await expect(relatedSection).not.toBeVisible();
  });
});
