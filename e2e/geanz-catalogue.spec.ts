import { test, expect } from '@playwright/test';

/**
 * User Story: GEANZ Asset Catalogue Integration
 *
 * As an IT portfolio manager,
 * I want to see GEANZ technology areas collapsed in the visualiser and selectively populate
 * them with assets,
 * So that I can build my asset catalogue progressively without being overwhelmed by hundreds
 * of empty swimlanes.
 *
 * Acceptance Criteria:
 * AC1: The 17 GEANZ application technology areas (TAP.01–TAP.17) appear as collapsed rows
 *      in the visualiser with a visually distinct treatment from asset swimlanes.
 * AC2: Each area row has an "+ Add all assets" button showing the count of assets to be added.
 * AC3: Clicking "+ Add all assets" creates the correct child assets and the area row disappears.
 * AC4: Pre-populated assets persist across page reloads.
 * AC5: Once pre-populated, a "Remove all assets" option is available on the area.
 *      Clicking it shows a confirmation dialog; confirming removes all assets for that area.
 *      Cancelling leaves all assets intact.
 * AC6: Every asset swimlane label shows a trashcan icon on hover.
 *      Deleting an asset with no linked data removes it immediately (no confirmation).
 *      Deleting an asset with linked initiatives/segments shows a confirmation dialog.
 *      Cancelling the confirmation leaves the asset intact.
 * AC7: Area rows and asset swimlane labels display full names without truncation.
 *      TAP alias codes (e.g. TAP.01, TAP.05.01) are not shown in the labels.
 *
 * Note: Tests use TAP.05 (End User) and TAP.10 (Data Sharing) as the target areas because
 * those are NOT pre-populated in the demo data, so the pre-populate button is always available.
 */

test.describe('GEANZ Asset Catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // AC1 — Area rows are present and visually distinct
  test('AC1: all 17 TAP areas are represented in the visualiser', async ({ page }) => {
    // Each area appears either as an unpopulated area row or a populated header
    for (let i = 1; i <= 17; i++) {
      const alias = `TAP.${String(i).padStart(2, '0')}`;
      await expect(
        page.locator(`[data-testid="geanz-area-entry-${alias}"]`)
      ).toBeVisible();
    }
  });

  test('AC1: area rows display the full GEANZ area name', async ({ page }) => {
    const tap17 = page.locator('[data-testid="geanz-area-row-TAP.17"]');
    await expect(tap17).toBeVisible();
    await expect(tap17).toContainText('Emerging Technologies application area');
  });

  test('AC1: area rows are visually distinct from asset swimlanes', async ({ page }) => {
    // TAP.05 (End User) is not in demo data — its area row is always visible
    const areaRow = page.locator('[data-testid="geanz-area-row-TAP.05"]');
    await expect(areaRow).toBeVisible();
    // Area rows carry a data attribute that distinguishes them from asset swimlanes
    await expect(areaRow).toHaveAttribute('data-row-type', 'geanz-area');
  });

  // AC2 — Pre-populate button shows asset count
  test('AC2: pre-populate button is visible with asset count on each area row', async ({ page }) => {
    // TAP.05 (End User) is not in demo data — its pre-populate button is always visible
    const btn = page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]');
    await expect(btn).toBeVisible();
    // Button label should contain the asset count, e.g. "+ Add all 4 assets"
    await expect(btn).toContainText(/\+ Add all \d+ assets?/);
  });

  // AC3 — Pre-populating adds child assets and removes the area row
  test('AC3: clicking pre-populate adds the correct child assets', async ({ page }) => {
    const btn = page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]');
    await expect(btn).toBeVisible();

    // Extract the expected count from the button label before clicking
    const label = await btn.textContent();
    const match = label?.match(/\d+/);
    const expectedCount = match ? parseInt(match[0]) : null;
    expect(expectedCount).not.toBeNull();

    await btn.click();

    // At least one known child asset should appear as a swimlane
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    // The area row for TAP.05 should no longer be visible
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.05"]')
    ).not.toBeVisible();
  });

  test('AC3: pre-populated assets carry the GEANZ alias', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();

    // The swimlane for "Productivity Suite" (TAP.05.01) should be rendered
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' });
    await expect(swimlane).toBeVisible();
    // data-alias attribute should reflect the GEANZ alias
    await expect(swimlane).toHaveAttribute('data-alias', 'TAP.05.01');
  });

  // AC4 — Persistence across reloads
  test('AC4: pre-populated assets persist after page reload', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Assets should still be present after reload
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    // Area row should still be absent
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.05"]')
    ).not.toBeVisible();
  });

  test('AC4: unpopulated area rows reappear after reload', async ({ page }) => {
    // TAP.10 (Data Sharing) is not in demo data — it should survive a reload
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.10"]')
    ).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.10"]')
    ).toBeVisible();
  });

  // AC5 — Remove all assets
  test('AC5: remove-all button appears after pre-populating an area', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    // The remove-all button should now be accessible (e.g. on a collapsed area header)
    await expect(
      page.locator('[data-testid="geanz-remove-btn-TAP.05"]')
    ).toBeVisible();
  });

  test('AC5: remove-all shows a confirmation dialog with correct copy', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    await page.locator('[data-testid="geanz-remove-btn-TAP.05"]').click();

    const modal = page.locator('[data-testid="confirm-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('End User application area');
    await expect(modal).toContainText(/initiative|segment|deleted/i);
  });

  test('AC5: cancelling remove-all leaves all assets intact', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    await page.locator('[data-testid="geanz-remove-btn-TAP.05"]').click();
    await page.locator('[data-testid="confirm-modal-cancel"]').click();

    // Assets should still be visible
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();
  });

  test('AC5: confirming remove-all deletes all pre-populated assets for the area', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    await page.locator('[data-testid="geanz-remove-btn-TAP.05"]').click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // Assets should be gone
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).not.toBeVisible();

    // Area row should reappear now that it has no populated assets
    await expect(
      page.locator('[data-testid="geanz-area-row-TAP.05"]')
    ).toBeVisible();
  });

  // AC6 — Trashcan delete on individual asset swimlane labels
  test('AC6: trashcan icon appears on hover over an asset swimlane label', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();

    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' });
    await expect(swimlane).toBeVisible();

    await swimlane.hover();
    await expect(swimlane.locator('[data-testid="asset-swimlane-delete-btn"]')).toBeVisible();
  });

  test('AC6: deleting a clean asset (no initiatives) removes it immediately without confirmation', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();

    // Graphics and Multimedia (TAP.05.03) has no initiatives in demo data
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Graphics and Multimedia' });
    await expect(swimlane).toBeVisible();
    await swimlane.hover();
    await swimlane.locator('[data-testid="asset-swimlane-delete-btn"]').click();

    // No confirmation modal should appear
    await expect(page.locator('[data-testid="confirm-modal"]')).not.toBeVisible();

    // Swimlane should be gone
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Graphics and Multimedia' })
    ).not.toBeVisible();
  });

  test('AC6: deleting an asset with linked initiatives shows a confirmation dialog', async ({ page }) => {
    // Use an existing demo data asset that has initiatives attached (Customer IAM / CIAM)
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Customer IAM (CIAM)' });
    await expect(swimlane).toBeVisible();

    await swimlane.hover();
    await swimlane.locator('[data-testid="asset-swimlane-delete-btn"]').click();

    const modal = page.locator('[data-testid="confirm-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Customer IAM (CIAM)');
    await expect(modal).toContainText(/initiative|segment/i);
  });

  test('AC6: cancelling the delete confirmation leaves the asset intact', async ({ page }) => {
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Customer IAM (CIAM)' });
    await swimlane.hover();
    await swimlane.locator('[data-testid="asset-swimlane-delete-btn"]').click();

    await page.locator('[data-testid="confirm-modal-cancel"]').click();

    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Customer IAM (CIAM)' })
    ).toBeVisible();
  });

  test('AC6: confirming the delete removes the asset and its linked data', async ({ page }) => {
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Customer IAM (CIAM)' });
    await swimlane.hover();
    await swimlane.locator('[data-testid="asset-swimlane-delete-btn"]').click();

    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Customer IAM (CIAM)' })
    ).not.toBeVisible();
  });

  // AC7 — Full names, no alias codes
  test('AC7: area row shows full name without truncation', async ({ page }) => {
    // TAP.05 (End User) is not in demo data — its area row is always visible
    const areaRow = page.locator('[data-testid="geanz-area-row-TAP.05"]');
    await expect(areaRow).toContainText('End User application area');
  });

  test('AC7: area row does not show the TAP alias code', async ({ page }) => {
    const areaRow = page.locator('[data-testid="geanz-area-row-TAP.05"]');
    // The alias code should not appear as visible text in the label
    await expect(areaRow).not.toContainText('TAP.05');
  });

  test('AC7: pre-populated asset swimlane shows full name without truncation', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();

    // TAP.05.02 'End User Tools' — confirm the full text is present
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'End User Tools' });
    await expect(swimlane).toBeVisible();
  });

  test('AC7: pre-populated asset swimlane does not show the TAP alias code', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();

    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' });
    await expect(swimlane).toBeVisible();
    // Alias code should not appear as visible text
    await expect(swimlane).not.toContainText('TAP.05.01');
  });
});
