import { test, expect } from '@playwright/test';

/**
 * Application Segment Creation — Application Selector
 *
 * User Story:
 *   As a user creating a new application lifecycle segment, I want to select
 *   which application within the asset the segment belongs to, so the segment
 *   is associated with the correct application.
 *
 * Acceptance Criteria:
 *   AC1: The "Add Lifecycle Segment" panel shows an Application dropdown when
 *        the asset has applications defined.
 *   AC2: The dropdown lists all applications belonging to that asset.
 *   AC3: Saving with a selected application sets applicationId on the new segment
 *        (verified by re-opening the segment and checking the panel subtitle).
 */
test.describe('Segment creation — application selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    // Navigate to a year where the CIAM application swimlane has space for a new segment
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForTimeout(300);
  });

  test('AC1: Add Lifecycle Segment panel shows an Application dropdown', async ({ page }) => {
    // Double-click the CIAM application swimlane to open creation panel
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    await expect(page.getByTestId('segment-panel')).toBeVisible();
    await expect(page.locator('[data-testid="segment-application"]')).toBeVisible();
  });

  test('AC2: Application dropdown lists all applications for the asset', async ({ page }) => {
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    await expect(page.getByTestId('segment-panel')).toBeVisible();

    const select = page.locator('[data-testid="segment-application"]');
    await expect(select).toBeVisible();

    // CIAM asset (first in demo data) has: Okta, Azure AD B2C, Keycloak
    const options = select.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const texts = await options.allTextContents();
    expect(texts.some(t => t.includes('Okta'))).toBe(true);
    expect(texts.some(t => t.includes('Azure AD B2C'))).toBe(true);
    expect(texts.some(t => t.includes('Keycloak'))).toBe(true);
  });

  test('AC3: Saving with a selected application associates the segment with that application', async ({ page }) => {
    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });

    const panel = page.getByTestId('segment-panel');
    await expect(panel).toBeVisible();

    // Select "Keycloak" as the application
    const select = page.locator('[data-testid="segment-application"]');
    await select.selectOption({ label: 'Keycloak' });

    // Save the segment
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    // Open the newly created segment (only segment in 2030 view)
    const newBar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(newBar).toBeVisible({ timeout: 5000 });
    await newBar.click();
    await newBar.locator('[data-testid="segment-edit"]').click();

    // The panel subtitle should show "Keycloak"
    const editPanel = page.getByTestId('segment-panel');
    await expect(editPanel).toBeVisible();
    await expect(editPanel).toContainText('Keycloak');
  });
});
