import { test, expect } from '@playwright/test';

test.describe('GEANZ Demo Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('AC1: pre-populated GEANZ assets appear on first load', async ({ page }) => {
    // Spot-check four different TAP areas
    for (const text of [
      'Financial Management Information System (FMIS) applications',
      'Authentication',
      'Infrastructure as a Service (IaaS)',
      'Business Intelligence Reporting applications',
    ]) {
      await expect(
        page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: text })
      ).toBeVisible();
    }
  });

  test('AC2: pre-populated areas have no area row and show a remove-all button', async ({ page }) => {
    // TAP.01 is pre-populated
    await expect(page.locator('[data-testid="geanz-area-row-TAP.01"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="geanz-remove-btn-TAP.01"]')).toBeVisible();

    // TAP.16 is also pre-populated
    await expect(page.locator('[data-testid="geanz-area-row-TAP.07"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="geanz-remove-btn-TAP.16"]')).toBeVisible();
  });

  test('AC3: unpopulated areas still show collapsed area rows', async ({ page }) => {
    for (const alias of ['TAP.05', 'TAP.10', 'TAP.17']) {
      await expect(page.locator(`[data-testid="geanz-area-row-${alias}"]`)).toBeVisible();
    }
  });
});

test.describe('GEANZ Asset Catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  // AC1 — Area rows are present and visually distinct
  test('AC1: all 17 TAP areas are represented in the visualiser', async ({ page }) => {
    for (let i = 1; i <= 17; i++) {
      const alias = `TAP.${String(i).padStart(2, '0')}`;
      await expect(page.locator(`[data-testid="geanz-area-entry-${alias}"]`)).toBeVisible();
    }
  });

  test('AC1: area rows display full names and are visually distinct from asset swimlanes', async ({ page }) => {
    const tap17 = page.locator('[data-testid="geanz-area-row-TAP.17"]');
    await expect(tap17).toBeVisible();
    await expect(tap17).toContainText('Emerging Technologies application area');

    const areaRow = page.locator('[data-testid="geanz-area-row-TAP.05"]');
    await expect(areaRow).toHaveAttribute('data-row-type', 'geanz-area');
  });

  // AC2 — Pre-populate button shows asset count
  test('AC2: pre-populate button is visible with asset count on unpopulated area row', async ({ page }) => {
    const btn = page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(/\+ Add all \d+ assets?/);
  });

  // AC3 — Pre-populating adds child assets and removes the area row
  test('AC3: clicking pre-populate adds child assets and hides the area row', async ({ page }) => {
    const btn = page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]');
    await btn.click();

    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();
    await expect(page.locator('[data-testid="geanz-area-row-TAP.05"]')).not.toBeVisible();
  });

  test('AC3: pre-populated assets carry the GEANZ alias attribute', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' });
    await expect(swimlane).toBeVisible();
    await expect(swimlane).toHaveAttribute('data-alias', 'TAP.05.01');
  });

  // AC4 — Persistence across reloads
  test('AC4: pre-populated assets persist after page reload', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });

    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();
    await expect(page.locator('[data-testid="geanz-area-row-TAP.05"]')).not.toBeVisible();

    // Unpopulated area row also survives reload
    await expect(page.locator('[data-testid="geanz-area-row-TAP.10"]')).toBeVisible();
  });

  // AC5 — Remove all assets
  test('AC5: remove-all button appears after pre-populating an area', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();
    await expect(page.locator('[data-testid="geanz-remove-btn-TAP.05"]')).toBeVisible();
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

    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();
  });

  test('AC5: confirming remove-all deletes all pre-populated assets and restores area row', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).toBeVisible();

    await page.locator('[data-testid="geanz-remove-btn-TAP.05"]').click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' })
    ).not.toBeVisible();
    await expect(page.locator('[data-testid="geanz-area-row-TAP.05"]')).toBeVisible();
  });

  // AC6 — Trashcan delete on individual asset swimlane labels
  test('AC6: trashcan icon appears on hover over an asset swimlane label', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' });
    await expect(swimlane).toBeVisible();
    await swimlane.hover();
    await expect(swimlane.locator('[data-testid="asset-swimlane-delete-btn"]')).toBeVisible();
  });

  test('AC6: deleting a clean asset removes it immediately without confirmation', async ({ page }) => {
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Graphics and Multimedia' });
    await expect(swimlane).toBeVisible();
    await swimlane.hover();
    await swimlane.locator('[data-testid="asset-swimlane-delete-btn"]').click();

    await expect(page.locator('[data-testid="confirm-modal"]')).not.toBeVisible();
    await expect(
      page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Graphics and Multimedia' })
    ).not.toBeVisible();
  });

  test('AC6: deleting an asset with linked initiatives shows confirmation; cancel leaves it intact', async ({ page }) => {
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Customer IAM (CIAM)' });
    await swimlane.hover();
    await swimlane.locator('[data-testid="asset-swimlane-delete-btn"]').click();

    const modal = page.locator('[data-testid="confirm-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Customer IAM (CIAM)');
    await expect(modal).toContainText(/initiative|segment/i);

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
  test('AC7: area rows and pre-populated swimlanes show full names without TAP alias codes', async ({ page }) => {
    // Unpopulated area row
    const areaRow = page.locator('[data-testid="geanz-area-row-TAP.05"]');
    await expect(areaRow).toContainText('End User application area');
    await expect(areaRow).not.toContainText('TAP.05');

    // Pre-populated swimlane
    await page.locator('[data-testid="geanz-prepopulate-btn-TAP.05"]').click();
    const swimlane = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'Productivity Suite' });
    await expect(swimlane).toBeVisible();
    await expect(swimlane).not.toContainText('TAP.05.01');

    const endUserTools = page.locator('[data-testid="asset-swimlane-label"]').filter({ hasText: 'End User Tools' });
    await expect(endUserTools).toBeVisible();
  });
});
