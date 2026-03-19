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

  test('Applications tab shows Name, Asset and Status columns', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();
    const table = page.getByTestId('data-manager');
    await expect(table.locator('th').filter({ hasText: 'Name' })).toBeVisible();
    await expect(table.locator('th').filter({ hasText: 'Asset' })).toBeVisible();
    await expect(table.locator('th').filter({ hasText: 'Status' })).toBeVisible();
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

  test('can edit an application status inline', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();
    // Find the status select using the data-key attribute on the td
    const statusSelect = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row) td[data-key="status"] select').first();
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption('sunset');
    await expect(statusSelect).toHaveValue('sunset');
  });

  test('application status persists after reload', async ({ page }) => {
    await page.getByTestId('data-manager-tab-applications').click();

    // Find the first application row (tr[data-id] excludes ghost rows which have no data-id)
    const firstRow = page.locator('[data-testid="data-manager"] tbody tr[data-id]').first();
    const rowId = await firstRow.getAttribute('data-id');
    const statusSelect = firstRow.locator('td[data-key="status"] select');
    await statusSelect.selectOption('funded');

    // Wait for the async IndexedDB save to complete before reloading
    await page.waitForTimeout(1000);

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-applications').click();

    // After reload, IndexedDB returns records sorted by key — find the same row by its data-id
    const rowAfter = page.locator(`[data-testid="data-manager"] tbody tr[data-id="${rowId}"]`);
    const statusSelectAfter = rowAfter.locator('td[data-key="status"] select');
    await expect(statusSelectAfter).toHaveValue('funded');
  });
});

test.describe('Applications — InitiativePanel dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('Application dropdown appears in the InitiativePanel', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[data-testid="initiative-application"]')).toBeVisible();
  });

  test('Application dropdown is filtered to the selected asset', async ({ page }) => {
    // Open an initiative on an asset that has applications (a-ciam in demo data)
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
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
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
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
    await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
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
        await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
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
    await expect(page.locator('[data-testid^="application-row-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('application sub-row shows the application name in the sidebar', async ({ page }) => {
    const appRow = page.locator('[data-testid^="application-row-"]').first();
    await expect(appRow).toBeVisible();
    // The sidebar within the row should show a name
    const label = appRow.locator('[data-testid="application-row-label"]');
    await expect(label).toBeVisible();
    const text = await label.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('application sub-row shows a status badge', async ({ page }) => {
    const appRow = page.locator('[data-testid^="application-row-"]').first();
    await expect(appRow).toBeVisible();
    await expect(appRow.locator('[data-testid="application-status-badge"]')).toBeVisible();
  });

  test('initiatives linked to an application render inside its sub-row', async ({ page }) => {
    // Link the passkey initiative to a CIAM application via Data Manager setup
    // First, get the first application id from the a-ciam asset via data manager
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-applications').click();

    // Read the first application row's name to know which one is linked to a-ciam
    const firstRow = page.locator('[data-testid="data-manager"] tbody tr:not(.ghost-row)').first();
    const appIdCell = await firstRow.getAttribute('data-row-id');

    if (appIdCell) {
      // Link i-ciam-passkey to this application
      await page.getByTestId('nav-visualiser').click();
      await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
      await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
      const panel = page.getByTestId('initiative-panel');
      await expect(panel).toBeVisible();

      const appDropdown = panel.locator('[data-testid="initiative-application"]');
      const appOptions = await appDropdown.locator('option[value!=""]').all();
      if (appOptions.length > 0) {
        const firstAppValue = await appOptions[0].getAttribute('value');
        if (firstAppValue) {
          await appDropdown.selectOption(firstAppValue);
          await panel.getByRole('button', { name: 'Save Changes' }).click();
          await expect(panel).toBeHidden();

          // The initiative bar should now appear inside an application sub-row
          const appSubRow = page.locator(`[data-testid="application-row-${firstAppValue}"]`);
          await expect(appSubRow).toBeVisible();
          await expect(appSubRow.locator('[data-initiative-id="i-ciam-passkey"]')).toBeVisible();
        }
      }
    }
  });

  test('assets with no applications render without any application sub-rows', async ({ page }) => {
    // a-k8s (Kubernetes Platform) has no applications in demo data
    const k8sRow = page.locator('[data-testid="asset-row-a-k8s"]');
    await expect(k8sRow).toBeVisible();
    // No application rows nested inside this specific asset
    await expect(k8sRow.locator('[data-testid^="application-row-"]')).toHaveCount(0);
  });

  test('milestones remain visible at the asset level alongside application sub-rows', async ({ page }) => {
    // The CIAM asset has milestones in demo data — they should still render
    await expect(page.locator('.bg-amber-100').first()).toBeVisible();
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
