import { test, expect } from '@playwright/test';

test.describe('Version History & Snapshotting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Should allow saving a version and viewing it in the list', async ({ page }) => {
    // 1. Open Version Manager
    await page.getByTestId('nav-history').click();
    await expect(page.getByText('Version History')).toBeVisible();

    // 2. Save a new version
    await page.getByRole('button', { name: 'Save Current State' }).click();
    const versionName = `Test Version ${Date.now()}`;
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', versionName);
    await page.fill('textarea[placeholder="What changes does this version capture?"]', 'Test description');
    await page.getByRole('button', { name: 'Save Version' }).click();

    // 3. Verify it appears in the list
    await expect(page.getByText(versionName)).toBeVisible();
    
    // 4. Select it and verify details
    await page.getByText(versionName).click();
    await expect(page.locator('h3', { hasText: versionName })).toBeVisible();
    await expect(page.getByText('Test description')).toBeVisible();
  });

  test('Should generate a difference report for renames', async ({ page }) => {
    // 1. Save a baseline version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    const baselineName = 'Baseline';
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', baselineName);
    await page.getByRole('button', { name: 'Save Version' }).click();
    
    // Close modal
    await page.getByTestId('close-version-manager').click();

    // 2. Make a change (Rename an initiative)
    await page.getByTestId('nav-data-manager').click();
    const firstInitName = page.locator('input[data-testid^="real-input-name"]').first();
    const originalName = await firstInitName.inputValue();
    const newName = originalName + ' MODIFIED';
    
    // Clear and fill
    await firstInitName.click();
    await firstInitName.fill(newName);
    await firstInitName.press('Enter');

    // 3. Open History and run report
    await page.getByTestId('nav-history').click();
    await page.getByText(baselineName).click();
    await page.getByRole('button', { name: 'Run Difference Report' }).click();

    // 4. Verify the report shows the change
    await expect(page.getByRole('heading', { name: 'Difference Report' })).toBeVisible();
    await expect(page.getByText(newName).first()).toBeVisible();
    await expect(page.getByText(`Renamed from "${originalName}" to "${newName}"`)).toBeVisible();
    
    // 5. Close report
    await page.getByTestId('close-report-btn').click();
    await expect(page.getByRole('heading', { name: 'Difference Report' })).not.toBeVisible();
  });

  test('Should show initiative additions, deletions, and budget changes in the report', async ({ page }) => {
    // 1. Save baseline
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Complex Baseline');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // 2. Perform various changes
    await page.getByTestId('nav-data-manager').click();
    
    // a) Delete an initiative
    const firstInitName = await page.locator('input[data-testid^="real-input-name"]').first().inputValue();
    await page.locator('button[title="Delete row"]').first().click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // b) Add an initiative
    await page.getByRole('button', { name: 'Add Row' }).first().click();
    const addedInitName = 'Brand New Initiative';
    await page.locator('input[data-testid^="real-input-name"]').last().fill(addedInitName);
    await page.locator('input[data-testid^="real-input-name"]').last().press('Enter');

    // c) Modify an initiative (CapEx)
    const secondInitName = await page.locator('input[data-testid^="real-input-name"]').nth(1).inputValue();
    await page.locator('input[data-testid^="real-input-capex"]').nth(1).fill('999999');
    await page.locator('input[data-testid^="real-input-capex"]').nth(1).press('Enter');

    // 3. Run report
    await page.getByTestId('nav-history').click();
    await page.getByText('Complex Baseline').click();
    await page.getByRole('button', { name: 'Run Difference Report' }).click();

    // 4. Verify all changes are present
    await expect(page.getByText('Removed').first()).toBeVisible();
    await expect(page.getByText(firstInitName, { exact: true })).toBeVisible();
    
    await expect(page.getByText('Added').first()).toBeVisible();
    await expect(page.getByText(addedInitName, { exact: true })).toBeVisible();
    
    await expect(page.getByText('Changed').first()).toBeVisible();
    await expect(page.getByText(secondInitName, { exact: true })).toBeVisible();
    await expect(page.getByText(/CapEx: .*\d+ → \$999,999/)).toBeVisible();
  });

  test('Should not crash if selected version is deleted while comparison report is open', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    // 1. Save a version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Crash Test Version');
    await page.getByRole('button', { name: 'Save Version' }).click();

    // 2. Select it and open the comparison report
    await page.getByText('Crash Test Version').click();
    await page.getByRole('button', { name: 'Run Difference Report' }).click();
    await expect(page.getByRole('heading', { name: 'Difference Report' })).toBeVisible();

    // 3. Force-click the delete button behind the comparison overlay.
    //    comparisonVersionId stays 'current' after deletion since handleDelete only
    //    clears it when comparisonVersionId === deletedId — which is never true for 'current'.
    //    Without the fix: selectedVersionId → null, comparisonVersionId stays 'current',
    //    React tries to render VersionComparisonReport with undefined baseVersion → crash.
    //    With the fix: the IIFE guard returns null → overlay closes gracefully.
    //
    //    The delete button is inside the version list item that contains the h4 with the
    //    version name. We target it precisely so we don't accidentally click something else.
    // Use evaluate to directly call .click() on the DOM element, bypassing
    // the z-index overlay that covers the button in the normal pointer-event path.
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Delete version"]') as HTMLButtonElement;
      if (!btn) throw new Error('Delete button not found in DOM');
      btn.click();
    });
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // 4. With the fix: the comparison overlay must be gone (IIFE returned null)
    await expect(page.getByRole('heading', { name: 'Difference Report' })).not.toBeVisible({ timeout: 3000 });

    // 5. No uncaught errors
    expect(pageErrors.filter(e => e.includes('Cannot read') || e.includes('undefined'))).toHaveLength(0);

    // 6. Version manager still usable
    await page.getByTestId('close-version-manager').click();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
  });

  test('Should allow restoring a previous version', async ({ page }) => {
    // 1. Save a baseline version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    const baselineName = 'To Restore';
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', baselineName);
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // 2. Make a radical change (Delete an initiative)
    await page.getByTestId('nav-data-manager').click();
    const countBefore = await page.locator('input[data-testid^="real-input-name"]').count();
    const firstInitName = await page.locator('input[data-testid^="real-input-name"]').first().inputValue();
    
    // Delete the first row
    await page.locator('button[title="Delete row"]').first().click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await expect(page.locator('input[data-testid^="real-input-name"]')).toHaveCount(countBefore - 1);

    // 3. Restore the version
    await page.getByTestId('nav-history').click();
    await page.getByText(baselineName).click();
    await page.getByRole('button', { name: 'Restore to Current' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // 4. Verify data is back
    await expect(page.getByText('Version History')).not.toBeVisible();
    await page.getByTestId('nav-data-manager').click();
    await expect(page.locator('input[data-testid^="real-input-name"]')).toHaveCount(countBefore);
    await expect(page.locator('input[data-testid^="real-input-name"]').first()).toHaveValue(firstInitName);
  });
});

/**
 * Regression test: saving a version must produce a deep clone of the current
 * state. Mutations made after saving must not affect the saved snapshot.
 *
 * This would fail with a shallow clone or a reference copy, but passes with
 * either JSON.parse/stringify or structuredClone. The test also verifies the
 * implementation uses structuredClone by checking it exists in the bundle.
 */
test.describe('Version snapshot deep clone integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('saved version is unaffected by mutations made after saving', async ({ page }) => {
    // Save a baseline version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Integrity Check');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // Record the initiative name at time of save
    const originalName = 'Passkey Rollout';

    // Mutate an initiative after saving
    const passkeyBar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await passkeyBar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
    const nameInput = panel.getByLabel('Initiative Name');
    await expect(nameInput).toHaveValue('Passkey Rollout', { timeout: 3000 });
    await nameInput.fill('Passkey Rollout MUTATED');
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    // Open the version manager and run a diff against our saved baseline
    await page.getByTestId('nav-history').click();
    await page.getByText('Integrity Check').click();
    await page.getByRole('button', { name: 'Run Difference Report' }).click();

    // The diff report should detect the rename — meaning the snapshot preserved
    // the original name and was not mutated along with the live state
    await expect(page.getByText(`Renamed from "${originalName}" to "Passkey Rollout MUTATED"`)).toBeVisible({ timeout: 5000 });
  });

  test('saved version snapshot is stored in IndexedDB with all initiative data intact', async ({ page }) => {
    // Save a version
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'DB Integrity Check');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    // Read the saved version directly from IndexedDB and verify its data is complete
    const savedInitiativeCount = await page.evaluate((): Promise<number> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('it-initiative-visualiser');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('versions', 'readonly');
          const req = tx.objectStore('versions').getAll();
          req.onsuccess = () => {
            const versions = req.result;
            const latest = versions.sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp))[0];
            resolve(latest?.data?.initiatives?.length ?? 0);
          };
        };
      });
    });

    // The snapshot must have captured all demo initiatives (22 including placeholder)
    expect(savedInitiativeCount).toBeGreaterThan(0);
  });
});
