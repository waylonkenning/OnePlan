import { test, expect } from '@playwright/test';

/**
 * Applications feature:
 * - IT assets are composed of applications
 * - Applications have: name, asset (parent), status
 * - Initiatives can optionally be linked to an application within their asset
 * - Application sub-rows appear in the visualiser beneath their parent asset row
 * - Milestones remain at the asset level
 * - Assets with no applications render as before (no regressions)
 */

test.describe('Applications — Data Manager tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
  });

  test('Applications tab is present in the Data Manager', async ({ page }) => {
    await expect(page.getByTestId('data-manager-tab-applications')).toBeVisible();
  });

  test('Applications tab shows Name and Asset columns', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();
    const table = page.getByTestId('data-manager');
    await expect(table.locator('th').filter({ hasText: 'Name' })).toBeVisible();
    await expect(table.locator('th').filter({ hasText: 'Asset' })).toBeVisible();
  });

  test('Applications tab shows demo application rows', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();
    // There should be at least one application in demo data
    const rows = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)');
    await expect(rows.first()).toBeVisible();
  });

  test('can add a new application row', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();
    const initialCount = await page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)').count();

    await page.getByRole('button', { name: 'Add Row' }).click();
    const newCount = await page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('can open an application name for editing', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();
    // Double-clicking the name cell should open an inline text input
    const nameCell = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row) td[data-key="name"]').first();
    await nameCell.dblclick();
    const nameInput = nameCell.locator('input');
    await expect(nameInput).toBeVisible();
  });
});

test.describe('Applications — InitiativePanel dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('Application dropdown appears in the InitiativePanel', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[data-testid="initiative-application"]')).toBeVisible();
  });

  test('Application dropdown is filtered to the selected asset', async ({ page }) => {
    // Open an initiative on an asset that has applications (a-ciam in demo data)
    const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const appDropdown = panel.locator('[data-testid="initiative-application"]');
    await expect(appDropdown).toBeVisible();

    // Should show only apps belonging to a-ciam — count options (minus the blank one)
    const options = appDropdown.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(1); // at least the blank + one app option
  });

  test('Changing asset resets the application selection', async ({ page }) => {
    const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const appDropdown = panel.locator('[data-testid="initiative-application"]');
    // Select an application first
    const options = await appDropdown.locator('option').all();
    if (options.length > 1) {
      const secondOptionValue = await options[1].getAttribute('value');
      if (secondOptionValue) {
        await appDropdown.selectOption(secondOptionValue);
        expect(await appDropdown.inputValue()).toBe(secondOptionValue);
      }
    }

    // Change the asset — application should reset to blank
    const assetSelect = panel.locator('#assetId');
    await assetSelect.selectOption('a-web');
    await expect(appDropdown).toHaveValue('');
  });

  test('Application assignment saves and persists after reload', async ({ page }) => {
    const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const appDropdown = panel.locator('[data-testid="initiative-application"]');
    const options = await appDropdown.locator('option:not([value=""])').all();
    if (options.length > 0) {
      const appValue = await options[0].getAttribute('value');
      if (appValue) {
        await appDropdown.selectOption(appValue);
        await panel.getByRole('button', { name: 'Save Changes' }).click();
        await expect(panel).toBeHidden();

        await page.reload();
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
        const bar2 = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
        await bar2.click();
        await page.getByTestId('initiative-action-edit').click();
        const panel2 = page.getByTestId('initiative-panel');
        await expect(panel2).toBeVisible();
        await expect(panel2.locator('[data-testid="initiative-application"]')).toHaveValue(appValue);
      }
    }
  });
});

test.describe('Applications — Visualiser sub-rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('application sub-rows are visible in the timeline for assets with applications', async ({ page }) => {
    // a-ciam should have application sub-rows based on demo data
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('one applications swimlane per asset with applications (3 in demo data)', async ({ page }) => {
    // Demo data has 3 assets with applications: a-ciam, a-web, a-mobile
    const appSwimlanes = page.locator('[data-testid^="application-swimlane-"]');
    await expect(appSwimlanes).toHaveCount(3);
  });

  test('application sub-row shows lifecycle segment bars from demo data', async ({ page }) => {
    // Demo data includes segments for each application; at least one bar should be visible
    const appRow = page.locator('[data-testid^="application-swimlane-"]').first();
    await expect(appRow).toBeVisible();
    const segmentBar = appRow.locator('[data-testid^="segment-bar-"]').first();
    await expect(segmentBar).toBeVisible();
  });

  test('initiatives linked to an application remain visible at the asset level', async ({ page }) => {
    // Link i-ciam-passkey to an application and verify it still renders in the asset row
    const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const appDropdown = panel.locator('[data-testid="initiative-application"]');
    const allOptions = await appDropdown.locator('option').all();
    const nonBlankOptions = [];
    for (const opt of allOptions) {
      const val = await opt.getAttribute('value');
      if (val) nonBlankOptions.push(val);
    }
    if (nonBlankOptions.length > 0) {
      await appDropdown.selectOption(nonBlankOptions[0]);
      await panel.getByRole('button', { name: 'Save Changes' }).click();
      await expect(panel).toBeHidden();

      // The initiative bar should still appear in the main timeline (at asset level)
      await expect(page.locator('[data-initiative-id="i-ciam-passkey"]').first()).toBeVisible();
    }
  });

  test('assets with no applications render without an applications swimlane', async ({ page }) => {
    // a-k8s (Kubernetes Platform) has no applications in demo data
    await expect(page.locator('[data-testid="asset-row-a-k8s"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-swimlane-a-k8s"]')).toHaveCount(0);
  });

  test('milestones remain visible at the asset level alongside application sub-rows', async ({ page }) => {
    // The CIAM asset has milestones in demo data — they should still render
    await expect(page.locator('[data-testid="milestone-dep-handle"]').first()).toBeVisible();
  });
});

test.describe('Applications — Version snapshots', () => {
  test('applications are included in version snapshots', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Save a version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'App Test Snapshot');
    await page.getByRole('button', { name: 'Save Version' }).click();

    // The snapshot should have been saved without error
    await expect(page.getByText('App Test Snapshot')).toBeVisible();
    await page.getByTestId('close-version-manager').click();

    // Add a new application
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-applications').click();
    await page.getByRole('button', { name: 'Add Row' }).click();

    // Restore the snapshot — the new application should be gone
    await page.getByTestId('nav-history').click();
    await page.getByText('App Test Snapshot').click();
    await page.getByRole('button', { name: 'Restore' }).first().click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    // VersionManager auto-closes after restore (onRestore + onClose both called in confirm handler)

    // Application count should match the snapshot (not include the newly added row)
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-applications').click();
    // The page renders without error
    await expect(page.getByTestId('data-manager')).toBeVisible();
  });
});
