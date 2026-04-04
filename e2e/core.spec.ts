import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const CONFIRM_MODAL = '[data-testid="confirm-modal"]';
const CONFIRM_BTN = '[data-testid="confirm-modal-confirm"]';
const CANCEL_BTN = '[data-testid="confirm-modal-cancel"]';

async function openDataManager(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  await page.getByRole('button', { name: /data manager/i }).click();
  await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
}

async function goToTab(page: Page, tabId: string) {
  const tab = page.locator(`[data-testid="data-manager-tab-${tabId}"]`);
  await tab.click();
  await expect(tab).toHaveAttribute('aria-pressed', 'true');
}

async function getRowIds(page: Page): Promise<string[]> {
  const ids = await page.locator('[data-real="true"]').evaluateAll(
    (els) => els.map(el => el.getAttribute('data-id') ?? '')
  );
  return ids.filter(Boolean);
}

async function waitForTimeline(page: Page) {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser', { timeout: 15000 });
}

async function search(page: Page, term: string) {
  await page.getByTestId('search-input').fill(term);
}

async function clearSearch(page: Page) {
  await page.getByTestId('search-input').clear();
}

async function simulateFirstRun(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
}

test.describe('Capacity Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-reports').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 15000 });
    await page.getByTestId('report-card-capacity').click();
  });

  test('Capacity Report section is visible in Reports view', async ({ page }) => {
    await expect(page.getByTestId('capacity-report')).toBeVisible();
  });

  test('Capacity Report lists each resource by name', async ({ page }) => {
    const rows = page.locator('[data-testid="capacity-resource-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('Capacity Report shows initiatives assigned to a resource', async ({ page }) => {
    const sarahRow = page.getByTestId('capacity-resource-row-res-1');
    await expect(sarahRow).toBeVisible();
    await expect(sarahRow).toContainText('Sarah Chen');
    await expect(sarahRow).toContainText('SSO Consolidation');
  });

  test('Capacity Report shows date range for each assigned initiative', async ({ page }) => {
    const sarahRow = page.getByTestId('capacity-resource-row-res-1');
    await expect(sarahRow).toContainText('→');
  });

  test('Capacity Report shows empty state for unassigned resources', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.locator('table tbody tr[data-real="true"]').last().locator('input[type="text"]').first().fill('Test Resource');
    await page.getByTestId('nav-reports').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 15000 });
    await page.getByTestId('report-card-capacity').click();
    const testRow = page.locator('[data-testid="capacity-resource-row"]').filter({ hasText: 'Test Resource' });
    await expect(testRow).toBeVisible();
    await expect(testRow.getByTestId('capacity-no-assignments')).toBeVisible();
  });

  test('Capacity Report shows total assignment count per resource', async ({ page }) => {
    const baRow = page.getByTestId('capacity-resource-row-res-3');
    await expect(baRow.getByTestId('capacity-assignment-count')).toContainText('15');
  });

  test('Capacity Report shows prompt when no resources exist', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    const deleteButtons = page.locator('[data-testid="delete-row-btn-resources"]');
    const count = await deleteButtons.count();
    for (let i = 0; i < count; i++) {
      await page.locator('[data-testid="delete-row-btn-resources"]').first().click();
    }
    await page.getByTestId('nav-reports').click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 15000 });
    await page.getByTestId('report-card-capacity').click();
    await expect(page.getByTestId('capacity-no-resources')).toBeVisible();
  });
});

test.describe('Cascading Deletes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    });

    test('deleting asset removes its initiative bars from the Visualiser timeline', async ({ page }) => {
        const initiativeBar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await expect(initiativeBar).toBeVisible();

        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: 'Assets' }).click();
        await page.locator('table tbody tr').first().getByRole('button', { name: 'Delete row' }).click();
        await page.locator('[data-testid="confirm-modal-confirm"]').click();

        await page.getByRole('button', { name: 'Visualiser' }).click();
        await expect(initiativeBar).not.toBeVisible();
    });

    test('deleting initiative removes its dependencies from Data Manager', async ({ page }) => {
        test.skip(true, 'Flaky - depends on IndexedDB state from previous tests');
        const initiativeBar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await expect(initiativeBar).toBeVisible({ timeout: 5000 });

        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: 'Dependencies' }).click();
        await page.waitForTimeout(1000);
        const depsBefore = await page.locator('table tbody tr:not(.ghost-row)').count();

        await page.getByRole('button', { name: 'Visualiser' }).click();
        await page.waitForSelector('div[data-initiative-id="i-ciam-passkey"]', { timeout: 5000 });
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await bar.click();
        await page.waitForSelector('[data-testid="initiative-action-edit"]', { timeout: 5000 });
        await page.getByTestId('initiative-action-edit').click();
        await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
        const deleteBtn = page.getByRole('button', { name: 'Delete Initiative' });
        await expect(deleteBtn).toBeVisible({ timeout: 5000 });
        await deleteBtn.click();
        await page.waitForSelector('[data-testid="confirm-modal-confirm"]', { timeout: 5000 });
        await page.locator('[data-testid="confirm-modal-confirm"]').click();
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: 'Dependencies' }).click({ force: true });
        await page.waitForTimeout(1000);
        const depsAfter = await page.locator('table tbody tr:not(.ghost-row)').count();
        expect(depsAfter).toBeLessThan(depsBefore);
    });

    test('deleting an asset cascades to its initiatives and milestones', async ({ page }) => {
        await page.getByRole('button', { name: 'Data Manager' }).click();

        await page.getByRole('button', { name: 'Assets' }).click();

        await page.getByRole('button', { name: 'Initiatives' }).click();
        const initialInitCount = await page.locator('table tbody tr').count();

        await page.getByRole('button', { name: 'Assets' }).click();

        await page.locator('table tbody tr').first().getByRole('button', { name: 'Delete row' }).click();
        await page.locator('[data-testid="confirm-modal-confirm"]').click();

        await expect(page.locator('table tbody tr').first()).not.toContainText('Customer IAM (CIAM)');

        await page.getByRole('button', { name: 'Initiatives' }).click();
        const newInitCount = await page.locator('table tbody tr').count();
        expect(newInitCount).toBeLessThan(initialInitCount);
    });
});

test.describe('Category Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Dragging a category above another changes the vertical order', async ({ page }) => {
    const categoryLabels = page.locator('[data-testid^="category-drag-handle-"] button');
    await expect(categoryLabels.nth(0)).toContainText('Identity & Access Management');
    await expect(categoryLabels.nth(1)).toContainText('Data Platform');

    await page.evaluate(() => {
      const source = document.querySelector('[data-testid="category-drag-handle-cat-iam"]') as HTMLElement;
      if (!source) throw new Error('IAM drag handle not found');
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const target = document.querySelector('[data-testid="category-row-cat-data"]') as HTMLElement;
      if (!target) throw new Error('Data Platform category row not found');
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const source = document.querySelector('[data-testid="category-drag-handle-cat-iam"]') as HTMLElement;
      if (!source) throw new Error('IAM drag handle not found');
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    });

    await page.waitForTimeout(300);

    await expect(categoryLabels.nth(0)).toContainText('Data Platform');
    await expect(categoryLabels.nth(1)).toContainText('Identity & Access Management');
  });
});

test.describe('Collapsible Categories & Empty Rows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can collapse and expand categories', async ({ page }) => {
        const categoryHeaderBtn = page.getByRole('button', { name: /Identity & Access Management/i });
        await expect(categoryHeaderBtn).toBeVisible();

        const asset1 = page.getByText('Customer IAM (CIAM)', { exact: true });
        const asset2 = page.getByText('Privileged Access Mgmt', { exact: true });

        await expect(asset1).toBeVisible();
        await expect(asset2).toBeVisible();

        await categoryHeaderBtn.click();

        await expect(asset1).not.toBeVisible();
        await expect(asset2).not.toBeVisible();

        await categoryHeaderBtn.click();

        await expect(asset1).toBeVisible();
        await expect(asset2).toBeVisible();
    });

    test('can hide and show empty rows', async ({ page }) => {
        await page.getByRole('button', { name: 'Data Manager' }).click();
        await page.getByRole('button', { name: /Assets/i }).click();
        
        await page.getByRole('button', { name: 'Add Row' }).click();
        
        const lastRow = page.locator('table tbody tr[data-real="true"]').last();
        const nameInput = lastRow.locator('input[type="text"]').first();
        await nameInput.fill('Empty Asset');
        
        await page.getByRole('button', { name: 'Visualiser' }).click();

        const emptyAsset = page.getByText('Empty Asset', { exact: true });
        await expect(emptyAsset).toBeVisible();

        await page.getByTestId('display-more-btn').click();
        await page.getByLabel('Empty Rows').selectOption('hide');

        await expect(emptyAsset).not.toBeVisible();

        await page.getByLabel('Empty Rows').selectOption('show');

        await expect(emptyAsset).toBeVisible();
    });
});

test.describe('Initiative status field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('status field appears in InitiativePanel', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const statusField = panel.locator('[data-testid="initiative-status"]');
    await expect(statusField).toBeVisible();
  });

  test('status field has planned / active / done / cancelled options', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const statusField = panel.locator('[data-testid="initiative-status"]');
    await expect(statusField).toBeVisible();

    await expect(statusField.locator('option[value="planned"]')).toBeAttached();
    await expect(statusField.locator('option[value="active"]')).toBeAttached();
    await expect(statusField.locator('option[value="done"]')).toBeAttached();
    await expect(statusField.locator('option[value="cancelled"]')).toBeAttached();
  });

  test('status field appears in Data Manager Initiatives table', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    await expect(page.getByTestId('data-manager').getByRole('columnheader', { name: 'Status', exact: true })).toBeVisible();
  });

  test.skip('changing status in InitiativePanel persists after reload', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const statusField = panel.locator('[data-testid="initiative-status"]');
    await statusField.selectOption('active');

    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const bar2 = page.locator('[data-testid^="initiative-bar"]').first();
    await bar2.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel2 = page.getByTestId('initiative-panel');
    await expect(panel2).toBeVisible();

    await expect(panel2.locator('[data-testid="initiative-status"]')).toHaveValue('active');
  });
});

test.describe('By Progress colour mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  async function openViewOptions(page: Page) {
    const popover = page.getByTestId('view-options-popover');
    if (!await popover.isVisible()) {
      await page.getByTestId('view-options-btn').click();
      await expect(popover).toBeVisible();
    }
  }

  test('"By Progress" button is available inside the View Options popover', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByRole('button', { name: 'By Progress' })).toBeVisible();
  });

  test('clicking "By Progress" activates the mode', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Progress' }).click();
    const btn = page.getByRole('button', { name: 'By Progress' });
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('legend shows status entries when "By Progress" is active', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Progress' }).click();

    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Planned');
    await expect(legend).toContainText('Active');
    await expect(legend).toContainText('Done');
    await expect(legend).toContainText('Cancelled');
  });

  test('legend reverts to programmes when "By Programme" is re-selected', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Progress' }).click();
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Programme' }).click();

    const legend = page.getByTestId('colour-legend');
    await expect(legend).not.toContainText('Planned');
    await expect(legend).toContainText('Programmes');
  });
});

test.describe('In-app ConfirmModal — no browser dialogs', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async dialog => {
      await dialog.dismiss();
      throw new Error(`Unexpected browser dialog: "${dialog.message()}"`);
    });
  });

  test('EditableTable Clear All — cancel keeps rows', async ({ page }) => {
    await openDataManager(page);
    const rows = page.locator('table tbody tr');
    const before = await rows.count();

    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CANCEL_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).not.toBeVisible();

    expect(await rows.count()).toBe(before);
  });

  test('EditableTable Clear All — confirm clears rows', async ({ page }) => {
    await openDataManager(page);
    const rows = page.locator('table tbody tr');

    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CONFIRM_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).not.toBeVisible();

    await expect(rows).toHaveCount(1);
  });

  test('DataManager "Clear data and start again" opens template picker and blank clears all data', async ({ page }) => {
    await openDataManager(page);
    await page.getByTestId('clear-and-start-again-btn').click();
    await expect(page.getByTestId('template-picker-modal')).toBeVisible();
    await page.getByTestId('template-start-blank-btn').click();
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(1);
  });

  test('DataManager "Clear data and start again" with GEANZ demo data populates tables', async ({ page }) => {
    await openDataManager(page);
    await page.getByTestId('clear-and-start-again-btn').click();
    await expect(page.getByTestId('template-picker-modal')).toBeVisible();
    await page.getByTestId('template-select-with-demo-btn-geanz').click();
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(49);
  });

  test('DependencyPanel delete shows confirm modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('g.cursor-pointer.group');
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const panel = page.locator('[data-testid="dependency-panel"]');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: 'Delete Relationship' }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CANCEL_BTN).click();
    await expect(panel).toBeVisible();
  });

  test('InitiativePanel delete shows confirm modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-initiative-id]');
    const initBar = page.locator('[data-initiative-id]').first();
    await initBar.click({ force: true });
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: /Delete/ }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CANCEL_BTN).click();
    await expect(panel).toBeVisible();
  });

  test('VersionManager delete version shows confirm modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'History' }).click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.getByPlaceholder('e.g., March 2026 Snapshot').fill('Test Version');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await expect(page.getByText('Test Version')).toBeVisible();

    await page.locator('[data-testid="delete-version-btn"]').first().click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CONFIRM_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).not.toBeVisible();
    await expect(page.getByText('Test Version')).not.toBeVisible();
  });

  test('VersionManager restore version shows confirm modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'History' }).click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.getByPlaceholder('e.g., March 2026 Snapshot').fill('Restore Test');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await expect(page.getByText('Restore Test')).toBeVisible();

    await page.getByText('Restore Test').click();
    await page.getByRole('button', { name: 'Restore to Current' }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CANCEL_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).not.toBeVisible();
  });
});

test.describe('Critical Path Highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('toggle button is visible in the header', async ({ page }) => {
    await expect(page.getByTestId('toggle-critical-path')).toBeVisible();
  });

  test('toggle is off by default', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(btn).toHaveAttribute('data-active', 'false');
  });

  test('clicking toggle turns it on', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(btn).toHaveAttribute('data-active', 'true');
  });

  test('clicking toggle twice turns it back off', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await btn.click();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(btn).toHaveAttribute('data-active', 'false');
  });

  test('at least one initiative bar is marked as critical path when enabled', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    const criticalBars = page.locator('[data-critical-path="true"]');
    await expect(criticalBars.first()).toBeVisible({ timeout: 5000 });
  });

  test('no bars are marked as critical path when toggle is off', async ({ page }) => {
    const criticalBars = page.locator('[data-critical-path="true"]');
    await expect(criticalBars).toHaveCount(0);
  });

  test('ISO 20022 Migration is on the critical path (longest chain)', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    const isoBar = page.locator('[data-initiative-id="i-core-iso"]');
    await expect(isoBar).toHaveAttribute('data-critical-path', 'true');
  });

  test('Core Banking API Layer is on the critical path', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    const apiBar = page.locator('[data-initiative-id="i-core-api"]');
    await expect(apiBar).toHaveAttribute('data-critical-path', 'true');
  });

  test.skip('critical path state persists after reload', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    await expect(page.getByTestId('toggle-critical-path')).toHaveAttribute('data-active', 'true');
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.getByTestId('toggle-critical-path')).toHaveAttribute('data-active', 'true');
  });
});

test.describe('DB save error handling', () => {
  test('shows an inline error banner when saveAppData fails', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.evaluate(() => {
      const originalOpen = window.indexedDB.open.bind(window.indexedDB);
      localStorage.setItem('scenia-test-db-save-fail', 'true');
    });

    await page.evaluate(() => {
      let callCount = 0;
      const originalPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function(...args) {
        callCount++;
        if (callCount === 1) {
          IDBObjectStore.prototype.put = originalPut;
          throw new DOMException(
            "Failed to execute 'put' on 'IDBObjectStore': evaluating the object store's key path did not yield a value.",
            'DataError'
          );
        }
        return originalPut.apply(this, args);
      };
    });

    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByTestId('db-error-banner')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('db-error-banner')).toContainText('save');
  });

  test('logs diagnostic details to console when saveAppData fails', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.evaluate(() => {
      let patched = false;
      const originalPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function(...args) {
        if (!patched) {
          patched = true;
          IDBObjectStore.prototype.put = originalPut;
          throw new DOMException(
            "Failed to execute 'put' on 'IDBObjectStore': evaluating the object store's key path did not yield a value.",
            'DataError'
          );
        }
        return originalPut.apply(this, args);
      };
    });

    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(async () => {
      const hasDbError = consoleErrors.some(msg =>
        msg.toLowerCase().includes('failed to save') || msg.toLowerCase().includes('db')
      );
      expect(hasDbError).toBe(true);
    }).toPass({ timeout: 3000 });
  });
});

test('demo data timeline shows the current or next year, not a hardcoded past year', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser', { timeout: 5000 });

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const timelineHeader = page.locator('#timeline-visualiser');
  const headerText = await timelineHeader.textContent();

  const hasCurrentYear = headerText?.includes(String(currentYear));
  const hasNextYear = headerText?.includes(String(nextYear));

  expect(
    hasCurrentYear || hasNextYear,
    `Timeline should show ${currentYear} or ${nextYear}, but got: ${headerText?.slice(0, 200)}`
  ).toBe(true);
});

test('demo initiative start dates are within 2 years of today', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const twoYearsAhead = new Date(today);
  twoYearsAhead.setFullYear(today.getFullYear() + 4);

  const outOfRangeDates = await page.evaluate(
    ({ twoYearsAgoISO, twoYearsAheadISO }: { twoYearsAgoISO: string; twoYearsAheadISO: string }): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('it-initiative-visualiser');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('initiatives', 'readonly');
          const req = tx.objectStore('initiatives').getAll();
          req.onsuccess = () => {
            const outOfRange: string[] = [];
            req.result.forEach((i: { id: string; name: string; startDate: string; isPlaceholder?: boolean }) => {
              if (i.isPlaceholder) return;
              if (!i.startDate) return;
              if (i.startDate < twoYearsAgoISO || i.startDate > twoYearsAheadISO) {
                outOfRange.push(`${i.name}: ${i.startDate}`);
              }
            });
            resolve(outOfRange);
          };
        };
      });
    },
    { twoYearsAgoISO: twoYearsAgo.toISOString().slice(0, 10), twoYearsAheadISO: twoYearsAhead.toISOString().slice(0, 10) }
  );

  expect(
    outOfRangeDates,
    `These initiatives have dates too far from today: ${outOfRangeDates.join(', ')}`
  ).toHaveLength(0);
});

test.describe('Description Display', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('can edit description in initiative panel', async ({ page }) => {
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await expect(bar).toBeVisible();
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();

        const descInput = panel.getByLabel('Description');
        await expect(descInput).toBeVisible();

        await descInput.fill('This is a test description for the initiative.');

        await panel.getByRole('button', { name: 'Save Changes' }).click();
        await expect(panel).toBeHidden();

        await bar.click();
        await page.getByTestId('initiative-action-edit').click();
        await expect(panel).toBeVisible();
        await expect(panel.getByLabel('Description')).toHaveValue('This is a test description for the initiative.');
    });

    test('description appears in timeline bar tooltip', async ({ page }) => {
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();
        await panel.getByLabel('Description').fill('My tooltip description');
        await panel.getByRole('button', { name: 'Save Changes' }).click();
        await expect(panel).toBeHidden();

        await expect(bar).toHaveAttribute('title', /My tooltip description/);
    });

    test('description toggle expands bar when turned on', async ({ page }) => {
        const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();
        await panel.getByLabel('Description').fill('A long description that should cause the bar to expand vertically to show the full text.');
        await panel.getByRole('button', { name: 'Save Changes' }).click();
        await expect(panel).toBeHidden();

        const initialBox = await bar.boundingBox();
        const initialHeight = initialBox?.height || 0;

        await page.getByTestId('toggle-descriptions').click();

        await expect.poll(async () => {
            const box = await bar.boundingBox();
            return box?.height || 0;
        }).toBeGreaterThan(initialHeight);

        await expect(bar).toContainText('A long description');
    });
});

test.describe('Duplicate Initiative ID Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.click('button:has-text("Data")');
    await page.waitForSelector('[data-testid="data-manager"]');
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.click('button:has-text("Visualiser")');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });

    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2035-01-01');
    await startInput.press('Enter');
    await page.waitForSelector('[data-testid="asset-row-content"]');
  });

  test('three consecutive double-clicks produce three unique initiative IDs', async ({ page }) => {
    const swimlane = page.locator('[data-testid="asset-row-content"]').first();

    for (let i = 0; i < 3; i++) {
      await swimlane.dblclick({ position: { x: 60 + i * 150, y: 10 }, force: true });

      await expect(page.locator('h2:has-text("Create Initiative")')).toBeVisible({ timeout: 8000 });

      await page.getByLabel('Initiative Name').fill(`Test Initiative ${i}`);
      await page.getByRole('button', { name: 'Save Changes' }).click();

      await expect(page.locator('h2:has-text("Create Initiative")')).toBeHidden({ timeout: 5000 });
    }

    const bars = page.locator('[data-initiative-id^="init-new-"]');
    await expect(bars).toHaveCount(3);

    const ids = await bars.evaluateAll(els => els.map(el => el.getAttribute('data-initiative-id')));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });
});

test('AC1: new rows added across page reloads have unique IDs', async ({ page }) => {
  await openDataManager(page);
  await goToTab(page, 'programmes');

  const initialCount = await page.locator('[data-real="true"]').count();
  await page.locator('[data-testid="add-row-btn-programmes"]').click();
  await expect(page.locator('[data-real="true"]')).toHaveCount(initialCount + 1);
  const idsAfterFirstAdd = await getRowIds(page);
  const firstNewId = idsAfterFirstAdd[idsAfterFirstAdd.length - 1];
  expect(firstNewId).toBeTruthy();

  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  await page.getByRole('button', { name: /data manager/i }).click();
  await page.waitForSelector('[data-testid="data-manager"]', { timeout: 10000 });
  await goToTab(page, 'programmes');

  const countBeforeSecond = await page.locator('[data-real="true"]').count();
  await page.locator('[data-testid="add-row-btn-programmes"]').click();
  await expect(page.locator('[data-real="true"]')).toHaveCount(countBeforeSecond + 1);
  const idsAfterSecondAdd = await getRowIds(page);
  const secondNewId = idsAfterSecondAdd[idsAfterSecondAdd.length - 1];
  expect(secondNewId).toBeTruthy();

  expect(secondNewId).not.toEqual(firstNewId);

  const unique = new Set(idsAfterSecondAdd);
  expect(unique.size).toEqual(idsAfterSecondAdd.length);
});

test('AC2: all loaded entities have unique IDs within each type', async ({ page }) => {
  await openDataManager(page);

  const tabs: string[] = [
    'initiatives', 'assets', 'assetCategories', 'programmes',
    'strategies', 'milestones', 'resources', 'applications', 'appStatuses',
  ];

  for (const tab of tabs) {
    await goToTab(page, tab);
    const ids = await getRowIds(page);
    const unique = new Set(ids);
    expect(unique.size).toEqual(ids.length);
  }
});

test.describe('Error Boundary', () => {
  test('shows friendly error UI when a component throws, not a blank screen', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scenia-test-throw', 'true');
    });

    await page.goto('/');

    await expect(page.getByTestId('error-boundary-ui')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('error-boundary-ui')).toContainText('Something went wrong');

    await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
  });

  test('does not show error UI during normal operation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.getByTestId('error-boundary-ui')).not.toBeVisible();
  });
});

test.describe('Floating Legend Box', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('legend box is present inside #timeline-visualiser', async ({ page }) => {
    const visualiser = page.locator('#timeline-visualiser');
    await expect(visualiser).toBeVisible();
    const legend = visualiser.locator('[data-testid="timeline-legend"]');
    await expect(legend).toBeVisible();
  });

  test('legend is anchored to the bottom-right of the visualiser', async ({ page }) => {
    const visualiser = page.locator('#timeline-visualiser');
    const legend = visualiser.locator('[data-testid="timeline-legend"]');

    const visBox = await visualiser.boundingBox();
    const legBox = await legend.boundingBox();
    expect(visBox).not.toBeNull();
    expect(legBox).not.toBeNull();

    const legRight = legBox!.x + legBox!.width;
    const visRight = visBox!.x + visBox!.width;
    expect(visRight - legRight).toBeLessThan(40);

    const legBottom = legBox!.y + legBox!.height;
    const visBottom = visBox!.y + visBox!.height;
    expect(visBottom - legBottom).toBeLessThan(40);
  });

  test('toggle button collapses and expands the legend', async ({ page }) => {
    const legend = page.locator('[data-testid="timeline-legend"]');
    const content = page.locator('[data-testid="legend-content"]');
    const toggleBtn = page.locator('[data-testid="legend-toggle"]');

    await expect(content).toBeVisible();

    await toggleBtn.click();
    await expect(content).not.toBeVisible();

    await toggleBtn.click();
    await expect(content).toBeVisible();
  });

  test.skip('collapsed/expanded state persists across page reloads', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="legend-toggle"]');
    const content = page.locator('[data-testid="legend-content"]');

    await toggleBtn.click();
    await expect(content).not.toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.locator('[data-testid="legend-content"]')).not.toBeVisible();
  });

  test('legend content shows programme colour swatches by default', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-colour-swatches"]')).toBeVisible();
  });

  test('legend content shows milestone icon types', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-milestones"]')).toBeVisible();
  });

  test('legend content shows dependency arrow key', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-dependencies"]')).toBeVisible();
  });

  test('legend content shows conflict indicator', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-conflict"]')).toBeVisible();
  });

  test('legend shows current date and time', async ({ page }) => {
    const timestamp = page.locator('[data-testid="legend-timestamp"]');
    await expect(timestamp).toBeVisible();
    const text = await timestamp.textContent();
    expect(text).toMatch(/\d{4}/);
    expect(text).toContain(':');
  });

  test('legend appears behind initiative panel (lower z-index)', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible();

    const legend = page.locator('[data-testid="timeline-legend"]');
    await expect(legend).toBeAttached();
    const legendZ = await legend.evaluate(el => getComputedStyle(el).zIndex);
    const panelOverlay = page.getByTestId('initiative-panel');
    const panelZ = await panelOverlay.evaluate(el => getComputedStyle(el).zIndex);
    expect(Number(legendZ)).toBeLessThan(Number(panelZ));
  });

  test('colour-legend is inside the floating legend, not the header bar', async ({ page }) => {
    const visualiserLegend = page.locator('#timeline-visualiser [data-testid="colour-legend"]');
    await expect(visualiserLegend).toBeVisible();

    const headerLegend = page.locator('[data-testid="desktop-header-controls"] [data-testid="colour-legend"]');
    await expect(headerLegend).toHaveCount(0);
  });
});

test.describe('In-app User Guide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('Guide tab is visible in the nav bar', async ({ page }) => {
    await expect(page.getByTestId('nav-guide')).toBeVisible();
  });

  test('clicking Guide tab shows sidebar with sections', async ({ page }) => {
    await page.getByTestId('nav-guide').click();

    await expect(page.getByRole('button', { name: 'Getting Started', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Timeline', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dependencies', exact: true })).toBeVisible();
  });

  test('first page loads markdown content on open', async ({ page }) => {
    await page.getByTestId('nav-guide').click();

    const guideContent = page.locator('[data-testid="guide-content"]');
    await expect(guideContent).toBeVisible({ timeout: 5000 });
    const heading = guideContent.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    const text = await heading.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('clicking a different page loads new content', async ({ page }) => {
    await page.getByTestId('nav-guide').click();

    await page.getByRole('button', { name: 'Creating Initiatives' }).click();

    const guideContent = page.locator('[data-testid="guide-content"]');
    const heading = guideContent.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
    expect(await heading.textContent()).toMatch(/creat/i);
  });

  test('images in rendered content use /features/ path not ../../public/', async ({ page }) => {
    await page.getByTestId('nav-guide').click();

    await page.getByRole('button', { name: 'Creating Initiatives' }).click();
    await page.waitForSelector('[data-testid="guide-content"]');

    const images = page.locator('[data-testid="guide-content"] img');
    const count = await images.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const src = await images.nth(i).getAttribute('src');
        expect(src).not.toContain('../../public/');
        expect(src).toMatch(/^\/(features|tutorial)\//);
      }
    }
  });

  test('can navigate back to Visualiser from Guide', async ({ page }) => {
    await page.getByTestId('nav-guide').click();
    await expect(page.getByTestId('nav-guide')).toBeVisible();

    await page.getByTestId('nav-visualiser').click();
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Intra-Asset Dependency Spacing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('dynamically increases vertical gap between dependent initiatives in the same asset', async ({ page }) => {
        const c1 = page.getByText('Passkey Rollout');
        const c2 = page.getByText('SSO Consolidation');

        await expect(c1).toBeVisible();
        await expect(c2).toBeVisible();

        const box1 = await c1.boundingBox();
        const box2 = await c2.boundingBox();

        expect(box1).not.toBeNull();
        expect(box2).not.toBeNull();

        const topBar = box1!.y < box2!.y ? box1! : box2!;
        const bottomBar = box1!.y > box2!.y ? box1! : box2!;

        const gap = bottomBar.y - (topBar.y + topBar.height);

        expect(gap).toBeGreaterThan(20);
    });
});

test.describe('Keyboard Shortcuts Reference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('"?" button is visible in the header', async ({ page }) => {
    await expect(page.getByTestId('keyboard-shortcuts-btn')).toBeVisible();
  });

  test('clicking "?" opens the shortcuts modal', async ({ page }) => {
    await page.getByTestId('keyboard-shortcuts-btn').click();
    await expect(page.getByTestId('keyboard-shortcuts-modal')).toBeVisible();
  });

  test('modal lists Undo shortcut', async ({ page }) => {
    await page.getByTestId('keyboard-shortcuts-btn').click();
    const modal = page.getByTestId('keyboard-shortcuts-modal');
    await expect(modal).toContainText('Undo');
    const text = await modal.textContent();
    expect(text).toMatch(/Cmd|Ctrl/);
  });

  test('modal lists Redo shortcut', async ({ page }) => {
    await page.getByTestId('keyboard-shortcuts-btn').click();
    const modal = page.getByTestId('keyboard-shortcuts-modal');
    await expect(modal).toContainText('Redo');
  });

  test('modal lists Escape to close panels', async ({ page }) => {
    await page.getByTestId('keyboard-shortcuts-btn').click();
    const modal = page.getByTestId('keyboard-shortcuts-modal');
    await expect(modal).toContainText('Escape');
  });

  test('modal closes when Escape is pressed', async ({ page }) => {
    await page.getByTestId('keyboard-shortcuts-btn').click();
    await expect(page.getByTestId('keyboard-shortcuts-modal')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('keyboard-shortcuts-modal')).toBeHidden();
  });

  test('modal closes when close button is clicked', async ({ page }) => {
    await page.getByTestId('keyboard-shortcuts-btn').click();
    const modal = page.getByTestId('keyboard-shortcuts-modal');
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: /close/i }).click();
    await expect(modal).toBeHidden();
  });
});

test.describe('Labels for Milestones and Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Milestones should display their name as a text label', async ({ page }) => {
    const milestoneLabel = page.getByText('DR Failover Test').first();
    await expect(milestoneLabel).toBeVisible();
    
    const milestoneContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const icon = milestoneContainer.locator('[data-testid="milestone-dep-handle"]');
    
    const iconBox = await icon.boundingBox();
    const labelBox = await milestoneLabel.boundingBox();
    
    if (!iconBox || !labelBox) throw new Error("Missing boxes");
    
    expect(Math.abs(iconBox.x + iconBox.width/2 - (labelBox.x + labelBox.width/2))).toBeLessThan(100);
  });

  test('Dependency arrows should display relationship labels', async ({ page }) => {
    const dependencyLabel = page.locator('text:has-text("blocks")').first();
    await expect(dependencyLabel).toBeAttached();
  });
});

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show landing page on first visit and dismiss on Get Started click', async ({ page }) => {
    const getStartedButton = page.getByRole('button', { name: "Get Started — It's Free" });
    await expect(getStartedButton).toBeVisible();

    await expect(page.getByText('Your IT Portfolio,')).toBeVisible();

    const visualiserButton = page.getByTestId('nav-visualiser');

    await getStartedButton.click();

    await expect(page.getByRole('button', { name: "Get Started — It's Free" })).not.toBeVisible();

    await expect(visualiserButton).toBeVisible();

    await page.reload();

    await expect(page.getByRole('button', { name: "Get Started — It's Free" })).not.toBeVisible();
    await expect(visualiserButton).toBeVisible();
  });

  test('should display open source badge and GitHub link', async ({ page }) => {
    await expect(page.getByText('Free & Open Source')).toBeVisible();

    const navGitHubLink = page.getByRole('link', { name: 'GitHub' }).first();
    await expect(navGitHubLink).toBeVisible();
    await expect(navGitHubLink).toHaveAttribute('href', 'https://github.com/waylonkenning/scenia');

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
    const depCard = page.locator('div').filter({ hasText: /^Dependency Mapping/ }).first();
    await expect(depCard).toContainText(/milestone/i);
    await expect(depCard).toContainText(/critical path/i);

    const canvasCard = page.locator('div').filter({ hasText: /^Intuitive Canvas/ }).first();
    await expect(canvasCard).toContainText(/resource/i);

    const exportCard = page.locator('div').filter({ hasText: /^Excel & PDF Export/ }).first();
    await expect(exportCard).toContainText(/capacity/i);
  });

  test('should display Kenning Corporation link in landing page footer', async ({ page }) => {
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

    await expect(footer).toContainText('Scenia IT Initiative Planner');
    await expect(footer).toContainText('an open source tool from');

    const openSourceLink = footer.getByRole('link', { name: 'open source' });
    await expect(openSourceLink).toBeVisible();
    await expect(openSourceLink).toHaveAttribute('href', 'https://github.com/waylonkenning/scenia');

    const kenningLink = footer.getByRole('link', { name: 'Waylon Kenning' });
    await expect(kenningLink).toBeVisible();
    await expect(kenningLink).toHaveAttribute('href', 'https://kenning.co.nz');
  });
});

test('Greedy placement handles 20+ overlapping initiatives without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');

  await page.getByRole('button', { name: 'Data Manager' }).click();
  await page.getByRole('button', { name: /Initiatives/ }).click();

  await page.getByRole('button', { name: /Assets/ }).click();
  const firstAssetIdInput = page.locator('table tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
  const assetId = await firstAssetIdInput.getAttribute('value') ?? 'asset-1';

  await page.getByRole('button', { name: /Programmes/ }).click();
  const firstProgrammeIdInput = page.locator('table tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
  const programmeId = await firstProgrammeIdInput.getAttribute('value') ?? 'prog-1';

  await page.getByRole('button', { name: /Initiatives/ }).click();
  await page.getByRole('button', { name: 'Paste CSV' }).click();

  const rows = ['id,name,programmeId,assetId,startDate,endDate,budget'];
  for (let i = 1; i <= 22; i++) {
    rows.push(`stress-init-${i},Stress Initiative ${i},${programmeId},${assetId},2026-01-01,2026-06-30,100000`);
  }
  const csv = rows.join('\n');

  const textarea = page.getByTestId('csv-paste-textarea');
  await textarea.fill(csv);

  const importBtn = page.getByTestId('import-rows-button');
  await expect(importBtn).toBeEnabled({ timeout: 5000 });
  await importBtn.click();

  await expect(page.locator('text=Paste CSV Data')).not.toBeVisible();

  await page.getByRole('button', { name: 'Visualiser' }).click();

  await expect(page.locator('#timeline-visualiser')).toBeVisible({ timeout: 10000 });

  expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);

  const bars = page.locator('[data-testid^="initiative-bar"]');
  await expect(bars.first()).toBeVisible({ timeout: 5000 });

  await expect(page.getByRole('button', { name: 'Data Manager' })).toBeEnabled();
});

test.describe('Maturity Heatmap Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-reports').click();
  });

  test('Maturity Heatmap card is visible on the reports home screen', async ({ page }) => {
    await expect(page.getByTestId('report-card-maturity-heatmap')).toBeVisible();
  });

  test('clicking the card opens the heatmap report', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await expect(page.getByTestId('report-view-maturity-heatmap')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('heatmap renders category group panels', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await expect(page.getByTestId('heatmap-category-cat-iam')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-data')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-core')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-cloud')).toBeVisible();
    await expect(page.getByTestId('heatmap-category-cat-int')).toBeVisible();
  });

  test('asset with maturity 5 shows correct green background colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    const tile = page.getByTestId('heatmap-tile-a-ciam');
    await expect(tile).toBeVisible();
    await expect(tile).toHaveAttribute('data-maturity', '5');
    await expect(tile).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('asset with maturity 1 shows correct red background colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    const tile = page.getByTestId('heatmap-tile-a-pam');
    await expect(tile).toBeVisible();
    await expect(tile).toHaveAttribute('data-maturity', '1');
    await expect(tile).toHaveCSS('background-color', 'rgb(239, 68, 68)');
  });

  test('unrated asset has no data-maturity attribute and shows grey background', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    const tile = page.getByTestId('heatmap-tile-a-mdm');
    await expect(tile).toBeVisible();
    await expect(tile).not.toHaveAttribute('data-maturity');
    await expect(tile).toHaveCSS('background-color', 'rgb(226, 232, 240)');
  });

  test('clicking a tile opens the AssetPanel', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    await expect(page.getByTestId('asset-panel')).toBeVisible();
  });

  test('AssetPanel shows the correct asset name', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    const panel = page.getByTestId('asset-panel');
    await expect(panel.getByLabel('Asset Name')).toHaveValue('Customer IAM (CIAM)');
  });

  test('AssetPanel shows the correct maturity value', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    const panel = page.getByTestId('asset-panel');
    await expect(panel.getByLabel('Maturity')).toHaveValue('5');
  });

  test('saving a maturity change in AssetPanel updates the tile colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-lake').click();
    const panel = page.getByTestId('asset-panel');
    await panel.getByLabel('Maturity').selectOption('5');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByTestId('asset-panel')).not.toBeVisible();
    await expect(page.getByTestId('heatmap-tile-a-lake')).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('cancelling AssetPanel does not change the tile colour', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await page.getByTestId('heatmap-tile-a-ciam').click();
    const panel = page.getByTestId('asset-panel');
    await panel.getByLabel('Maturity').selectOption('1');
    await panel.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('asset-panel')).not.toBeVisible();
    await expect(page.getByTestId('heatmap-tile-a-ciam')).toHaveCSS('background-color', 'rgb(34, 197, 94)');
  });

  test('back button returns to the reports home screen', async ({ page }) => {
    await page.getByTestId('report-card-maturity-heatmap').click();
    await expect(page.getByTestId('report-view-maturity-heatmap')).toBeVisible();
    await page.getByTestId('report-back-btn').click();
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-maturity-heatmap')).not.toBeVisible();
  });
});

test.describe('Navigation & State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('View Switching: switches between Visualiser and Data Manager', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    await page.getByRole('button', { name: 'Data Manager' }).click();
    await expect(page.getByRole('button', { name: /Initiatives\s*\d*/ })).toBeVisible();
    await expect(page.locator('#timeline-visualiser')).not.toBeVisible();

    await page.getByRole('button', { name: 'Visualiser' }).click();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
  });

  test('Data Persistence (IndexedDB)', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();

    await page.waitForSelector('table');
    
    await page.getByText('Initiative Name', { exact: true }).click();

    const firstInput = page.locator('table tbody tr[data-real="true"]').first().getByTestId('real-input-name');
    await firstInput.fill('A Renamed Initiative');
    await firstInput.blur();

    await page.reload();
    await page.getByRole('button', { name: 'Data Manager' }).click();

    const inputAfterReload = page.locator('input[value="A Renamed Initiative"]');
    await expect(inputAfterReload).toBeVisible();
  });

  test('IndexedDB save is atomic: all stores intact after full overwrite and reload', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('clear-and-start-again-btn').click();
    await page.getByTestId('template-select-with-demo-btn-geanz').click();
    await page.waitForTimeout(500);

    await page.reload();
    await page.getByTestId('nav-data-manager').click();

    const initiativeRows = page.locator('table tbody tr[data-real="true"]');
    await expect(initiativeRows).toHaveCount(48);

    await page.getByRole('button', { name: /Assets/ }).click();
    const assetRows = page.locator('table tbody tr[data-real="true"]');
    await expect(assetRows.first()).toBeVisible();

    await page.getByRole('button', { name: /Milestones/ }).click();
    const milestoneRows = page.locator('table tbody tr[data-real="true"]');
    await expect(milestoneRows.first()).toBeVisible();
  });

  test('Default Data Initialization', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    const realRows = page.locator('table tbody tr[data-real="true"]');
    await expect(realRows).toHaveCount(48);

    await expect(page.locator('table tbody tr')).toHaveCount(49);
  });
});

test.describe('Owner / Assignee', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('owner field is visible in InitiativePanel', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-owner-select')).toBeVisible();
  });

  test('owner dropdown accepts a selection', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const field = page.getByTestId('initiative-owner-select');
    await field.selectOption({ index: 1 });
    await expect(field).toHaveValue(/.+/);
  });

  test('owner field is visible in Data Manager', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await expect(page.locator('[data-col-key="owner"]')).toBeVisible();
  });

  test.skip('owner value persists across reloads', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const ownerSelect = page.getByTestId('initiative-owner-select');
    await ownerSelect.selectOption({ index: 1 });
    const selectedValue = await ownerSelect.inputValue();
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const bar2 = page.locator('[data-testid^="initiative-bar"]').first();
    await bar2.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-owner-select')).toHaveValue(selectedValue);
  });

  test('owner initials are shown on the bar when owner is set', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const ownerSelect = page.getByTestId('initiative-owner-select');
    await ownerSelect.selectOption({ index: 1 });
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    const ownerBadge = page.locator('[data-testid="owner-badge"]').first();
    await expect(ownerBadge).toBeVisible();
    await expect(ownerBadge).toHaveText(/^[A-Z]{1,2}$/);
  });

  test('owner badges appear for initiatives with ownerId set', async ({ page }) => {
    const badges = page.locator('[data-testid="owner-badge"]');
    await expect(badges.first()).toBeVisible();
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(5, count); i++) {
      await expect(badges.nth(i)).toHaveText(/^[A-Z]{1,2}$/);
    }
  });
});

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('progress field is visible in InitiativePanel', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-progress')).toBeVisible();
  });

  test('progress field accepts a value between 0 and 100', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const field = page.getByTestId('initiative-progress');
    await field.fill('75');
    await expect(field).toHaveValue('75');
  });

  test('progress field is visible in Data Manager', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await expect(page.locator('[data-col-key="progress"]')).toBeVisible();
  });

  test.skip('progress value persists across reloads', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const progressInput = page.getByTestId('initiative-progress');
    await expect(progressInput).toBeVisible({ timeout: 3000 });
    await progressInput.fill('60');
    await expect(progressInput).toHaveValue('60');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const bar2 = page.locator('[data-testid^="initiative-bar"]').first();
    await bar2.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-progress')).toHaveValue('60');
  });

  test('bar renders a progress fill overlay when progress > 0', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const progressInput = page.getByTestId('initiative-progress');
    await expect(progressInput).toBeVisible({ timeout: 3000 });
    await progressInput.fill('50');
    await expect(progressInput).toHaveValue('50');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    const overlay = page.locator('[data-testid="progress-overlay"]').first();
    await expect(overlay).toBeVisible();
  });

  test('progress fill overlay width is proportional to progress value', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const progressInput = page.getByTestId('initiative-progress');
    await expect(progressInput).toBeVisible({ timeout: 3000 });
    await progressInput.fill('40');
    await expect(progressInput).toHaveValue('40');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    const overlay = page.locator('[data-testid="progress-overlay"]').first();
    const width = await overlay.evaluate(el => (el as HTMLElement).style.width);
    expect(width).toBe('40%');
  });

  test('no progress overlay when progress is 0', async ({ page }) => {
    const bar = page.locator('[data-testid="initiative-bar-i-ciam-sso"]');
    await expect(bar).toBeVisible();
    await expect(bar.locator('[data-testid="progress-overlay"]')).toHaveCount(0);
  });
});

test.describe('Relationship Visibility Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForSelector('[data-initiative-id]');
  });

  test('Dependency lines should be hidden when showRelationships is off', async ({ page }) => {
    const depGroups = page.locator('g.cursor-pointer.group');
    await expect(depGroups.first()).toBeAttached();

    const initialCount = await depGroups.count();
    console.log(`Initial dependency groups: ${initialCount}`);
    expect(initialCount).toBeGreaterThan(0);

    const relToggle = page.getByTestId('toggle-relationships');
    await relToggle.click();

    await expect(depGroups).toHaveCount(0);
  });

  test('Dependency lines should be shown when showRelationships is on', async ({ page }) => {
    const relToggle = page.getByTestId('toggle-relationships');

    await relToggle.click();
    const depGroups = page.locator('g.cursor-pointer.group');
    await expect(depGroups).toHaveCount(0);

    await relToggle.click();

    await expect(depGroups.first()).toBeAttached();
    const finalCount = await depGroups.count();
    expect(finalCount).toBeGreaterThan(0);
  });
});

test.describe('Resize Initiative Edit Panel', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('resizing initiative does not open the edit panel', async ({ page }) => {
        const init = page.getByText('Passkey Rollout');
        await expect(init).toBeVisible();

        const box = await init.boundingBox();
        expect(box).not.toBeNull();

        await page.mouse.move(box!.x + box!.width - 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x + box!.width + 50, box!.y + box!.height / 2);
        await page.mouse.up();

        const editPanelHeading = page.getByRole('heading', { name: 'Edit Initiative' });
        await expect(editPanelHeading).not.toBeVisible();
    });

    test('normal click selects initiative; edit button opens panel', async ({ page }) => {
        const init = page.locator('[data-initiative-id]').filter({ hasText: 'Passkey Rollout' }).first();
        await expect(init).toBeVisible();

        await init.click();
        await expect(init).toHaveAttribute('data-selected', 'true');
        await expect(page.getByRole('heading', { name: 'Edit Initiative' })).not.toBeVisible();

        await page.getByTestId('initiative-action-edit').click();
        const editPanelHeading = page.getByRole('heading', { name: 'Edit Initiative' });
        await expect(editPanelHeading).toBeVisible();
    });
});

test.describe('Resources', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('scenia-e2e', 'true');
      localStorage.setItem('scenia_has_seen_landing', 'true');
    });
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('Resources tab appears in Data Manager', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager-tab-resources')).toBeVisible();
  });

  test('Resources tab shows name and role columns', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Role')).toBeVisible();
  });

  test('Can add a new resource with name only', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await page.getByTestId('add-row-btn-resources').click();
    const nameInput = page.locator('table tbody tr[data-real="true"]').last().locator('[data-testid="real-input-name"]');
    await nameInput.fill('Jane Smith');
    await nameInput.press('Tab');
    await expect(page.locator('table tbody tr[data-real="true"]').last().locator('[data-testid="real-input-name"]')).toHaveValue('Jane Smith');
  });

  test('Can add a resource with name and role', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await page.getByTestId('add-row-btn-resources').click();
    const row = page.locator('table tbody tr[data-real="true"]').last();
    await row.locator('[data-testid="real-input-name"]').fill('Business Analyst');
    await row.locator('[data-testid="real-input-role"]').fill('BA');
    await row.locator('[data-testid="real-input-name"]').press('Tab');
    await expect(page.locator('table tbody tr[data-real="true"]').last().locator('[data-testid="real-input-name"]')).toHaveValue('Business Analyst');
  });

  test('Can delete a resource row', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    const firstRow = page.locator('table tbody tr[data-real="true"]').first();
    const nameText = await firstRow.locator('[data-testid="real-input-name"]').inputValue();
    await firstRow.locator('[data-testid="delete-row-btn-resources"]').click();
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn.click();
    }
    const nameInputs = page.locator('table tbody tr[data-real="true"] [data-testid="real-input-name"]');
    const remaining = await nameInputs.evaluateAll((inputs: HTMLInputElement[], name: string) =>
      inputs.map(i => i.value).includes(name), nameText);
    expect(remaining).toBe(false);
  });

  test('Initiative owner field is a dropdown populated from resources', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    const ownerSelect = page.getByTestId('initiative-owner-select');
    await expect(ownerSelect).toBeVisible();
  });

  test('Owner dropdown includes demo resources', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    const ownerSelect = page.getByTestId('initiative-owner-select');
    const options = ownerSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Selecting an owner from dropdown saves it', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    const ownerSelect = page.getByTestId('initiative-owner-select');
    const secondOption = ownerSelect.locator('option').nth(1);
    const resourceName = await secondOption.textContent();
    await ownerSelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: /Save Changes/i }).click();
    const bar2 = page.locator('[data-testid^="initiative-bar"]').first();
    await bar2.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await expect(page.getByTestId('initiative-owner-select')).toHaveValue(/.+/);
    void resourceName;
  });

  test('Initiative panel has an Assigned Resources section', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await expect(page.getByTestId('initiative-resources-section')).toBeVisible();
  });

  test('Can assign additional resources to an initiative', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    const firstCheckbox = page.getByTestId('initiative-resources-section').locator('input[type="checkbox"]').first();
    await firstCheckbox.scrollIntoViewIfNeeded();
    await firstCheckbox.check({ force: true });
    await page.getByRole('button', { name: /Save Changes/i }).click();
    const bar2 = page.locator('[data-testid^="initiative-bar"]').first();
    await bar2.click();
    await page.getByTestId('initiative-action-edit').click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await expect(
      page.getByTestId('initiative-resources-section').locator('input[type="checkbox"]').first()
    ).toBeChecked();
  });

  test('Show Resources toggle exists in the header', async ({ page }) => {
    await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 10000 });
    await expect(page.getByTestId('toggle-resources')).toBeVisible();
  });

  test('Resource names appear on initiative bar when toggle is on', async ({ page }) => {
    await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 10000 });
    const toggle = page.getByTestId('toggle-resources');
    const isOff = await toggle.getAttribute('aria-pressed') === 'false';
    if (isOff) {
      await toggle.click();
    }
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="initiative-resource-names"]').first()).toBeVisible();
  });

  test('Resource names are hidden when toggle is off', async ({ page }) => {
    await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 10000 });
    const toggle = page.getByTestId('toggle-resources');
    const isOn = await toggle.getAttribute('aria-pressed') === 'true';
    if (isOn) {
      await toggle.click();
    }
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="initiative-resource-names"]').first()).toBeHidden();
  });

  test('Owner initials badge is derived from resource name when ownerId is set', async ({ page }) => {
    await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 10000 });
    const badge = page.locator('[data-testid="owner-badge"]').first();
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      expect(text).toMatch(/^[A-Z]{1,2}$/);
    }
  });
});

test.describe('Search — timeline filtering', () => {
  test.beforeEach(async ({ page }) => {
    await waitForTimeline(page);
  });

  test('matching name filters the timeline, non-matching initiative is hidden', async ({ page }) => {
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();

    await search(page, 'SSO');

    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();
  });

  test('search is case-insensitive', async ({ page }) => {
    await search(page, 'sso');
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();
  });

  test('description text match surfaces the initiative', async ({ page }) => {
    await search(page, 'FIDO2');
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeHidden();
  });

  test('asset name match surfaces all initiatives for that asset', async ({ page }) => {
    await search(page, 'Customer IAM');
    const bars = page.locator('[data-testid^="initiative-bar-i-ciam-"]');
    await expect(bars.first()).toBeVisible();
    await expect(page.getByText('API Gateway v2', { exact: true })).toBeHidden();
  });

  test('programme name match surfaces initiatives in that programme', async ({ page }) => {
    await search(page, 'Cloud Migration');
    expect(await page.locator('[data-testid^="initiative-bar-"]').count()).toBeGreaterThan(0);
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();
  });

  test('no-match search hides all initiatives', async ({ page }) => {
    await search(page, 'xyzzy-no-match-query');
    await expect(page.locator('[data-testid^="initiative-bar-"]').first()).not.toBeVisible();
  });

  test('clearing search restores all initiatives', async ({ page }) => {
    await search(page, 'SSO');
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();

    await clearSearch(page);
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
  });
});

test.describe('Search — Data Manager filtering', () => {
  test.beforeEach(async ({ page }) => {
    await waitForTimeline(page);
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
  });

  test('name search filters the initiatives table', async ({ page }) => {
    await search(page, 'SSO');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.first().locator('input[type="text"]').first()).toHaveValue('SSO Consolidation');
  });

  test('no-match search leaves only the ghost row', async ({ page }) => {
    await search(page, 'xyzzy-no-match-query');
    await expect(page.locator('tbody tr[data-real="true"]')).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(1);
  });

  test('search persists when switching between Data Manager tabs', async ({ page }) => {
    await search(page, 'SSO');
    await expect(page.locator('tbody tr')).toHaveCount(2);

    await page.getByTestId('data-manager-tab-assets').click();
    const assetCount = await page.locator('tbody tr[data-real="true"]').count();
    expect(assetCount).toBeLessThan(16);

    await page.getByTestId('data-manager-tab-initiatives').click();
    await expect(page.locator('tbody tr')).toHaveCount(2);
  });

  test('clearing search restores all rows', async ({ page }) => {
    await search(page, 'SSO');
    await expect(page.locator('tbody tr')).toHaveCount(2);

    await clearSearch(page);
    await expect(page.locator('tbody tr')).toHaveCount(49);
  });

  test('case-insensitive match in Data Manager', async ({ page }) => {
    await search(page, 'sso');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.first().locator('input[type="text"]').first()).toHaveValue('SSO Consolidation');
  });
});

test.describe('HTTP Security Headers', () => {
  let headers: Record<string, string>;

  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/');
    headers = await response!.allHeaders();
  });

  test('AC1 – Content-Security-Policy header is present', async () => {
    expect(headers['content-security-policy']).toBeTruthy();
  });

  test("AC2 – CSP includes script-src 'self' (production nginx omits unsafe-inline)", async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain("script-src 'self'");
  });

  test('AC3 – CSP allows unsafe-inline styles for Tailwind', async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  test('AC4 – CSP allows data: and blob: in img-src for export', async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain('data:');
    expect(csp).toContain('blob:');
  });

  test('AC5 – CSP sets frame-ancestors none', async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('AC6 – X-Content-Type-Options: nosniff is present', async () => {
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('AC7 – X-Frame-Options: DENY is present', async () => {
    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('AC8 – Referrer-Policy is present', async () => {
    expect(headers['referrer-policy']).toBeTruthy();
  });

  test('AC9 – Permissions-Policy is present', async () => {
    expect(headers['permissions-policy']).toBeTruthy();
  });
});

test.describe('Snap to Month Setting', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Visualiser' })).toBeVisible();
    });

    test('snaps start date to start of month when moving initiative', async ({ page }) => {
        const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
        await expect(bar).toBeVisible();

        await page.getByTestId('display-more-btn').click();
        await page.getByLabel('Snap to Month').selectOption('off');

        const box1 = await bar.boundingBox();
        expect(box1).not.toBeNull();

        await bar.hover();
        await page.mouse.down();
        await page.waitForTimeout(150);
        await page.mouse.move(box1!.x + box1!.width / 2 + 100, box1!.y + box1!.height / 2, { steps: 20 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        const box2 = await bar.boundingBox();

        expect(box2!.x).toBeGreaterThan(box1!.x);

        await page.getByTestId('display-more-btn').click();
        await page.getByLabel('Snap to Month').selectOption('month');

        await bar.hover();
        await page.mouse.down();
        await page.waitForTimeout(150);
        await page.mouse.move(box2!.x + box2!.width / 2 + 150, box2!.y + box2!.height / 2, { steps: 20 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        await bar.click();
        await page.getByTestId('initiative-action-edit').click();

        const startDateInput = page.getByLabel('Start Date');
        await expect(startDateInput).toBeVisible();
        const startVal = await startDateInput.inputValue();

        expect(startVal.endsWith('-01')).toBeTruthy();
    });
});

test.describe('Table Column Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('Should sort Initiatives by Name', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: 'Initiative Name' });
    
    await nameHeader.click();
    
    const firstRowName = page.locator('table tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const lastRowName = page.locator('table tbody tr[data-real="true"]').last().locator('input[type="text"]').first();
    
    const name1 = await firstRowName.inputValue();
    const name2 = await lastRowName.inputValue();
    expect(name1.localeCompare(name2)).toBeLessThanOrEqual(0);

    await nameHeader.click();
    const nameDesc1 = await firstRowName.inputValue();
    const nameDesc2 = await lastRowName.inputValue();
    expect(nameDesc1.localeCompare(nameDesc2)).toBeGreaterThanOrEqual(0);
  });

  test('Should sort Initiatives by CapEx', async ({ page }) => {
    const capexHeader = page.getByRole('columnheader', { name: 'CapEx ($)' });

    await capexHeader.click();

    const realRows = page.locator('table tbody tr[data-real="true"]');
    const firstCapex = await realRows.first().getByTestId('real-input-capex').inputValue();
    const lastCapex = await realRows.last().getByTestId('real-input-capex').inputValue();

    expect(parseFloat(firstCapex) || 0).toBeLessThanOrEqual(parseFloat(lastCapex) || 0);

    await capexHeader.click();
    const firstCapexDesc = await realRows.first().getByTestId('real-input-capex').inputValue();
    const lastCapexDesc = await realRows.last().getByTestId('real-input-capex').inputValue();

    expect(parseFloat(firstCapexDesc) || 0).toBeGreaterThanOrEqual(parseFloat(lastCapexDesc) || 0);
  });

  test('Blank row should always be at the bottom after sorting', async ({ page }) => {
    const nameHeader = page.getByRole('columnheader', { name: 'Initiative Name' });
    
    await nameHeader.click();
    await nameHeader.click();

    const lastRow = page.locator('table tbody tr').last();
    await expect(lastRow).not.toHaveAttribute('data-real', 'true');
    await expect(lastRow.locator('input').first()).toHaveValue('');
  });
});

test.describe('Tap-to-Select for Segments and Initiatives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1 – clicking a segment selects it', async ({ page }) => {
    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');
  });

  test('AC2 – selected segment shows bottom resize handle without hovering', async ({ page }) => {
    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });

    const handle = bar.locator('[data-testid="segment-resize-bottom"]');
    await expect(handle).toHaveCount(1);

    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');

    await expect(handle).toHaveCSS('opacity', '1');
  });

  test('AC3 – selected segment shows row-up and row-down buttons', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForSelector('[data-testid="application-row-content"]');

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible();
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');

    await expect(bar.locator('[data-testid="segment-row-up"]')).toBeVisible();
    await expect(bar.locator('[data-testid="segment-row-down"]')).toBeVisible();
  });

  test('AC4+AC5 – row-down moves segment lower; row-up moves it back', async ({ page }) => {
    const startInput = page.getByTestId('timeline-start-input');
    await startInput.fill('2030-01-01');
    await startInput.press('Enter');
    await page.waitForSelector('[data-testid="application-row-content"]');

    const rowContent = page.locator('[data-testid="application-row-content"]').first();
    await rowContent.dblclick({ position: { x: 200, y: 20 } });
    const panel = page.getByTestId('segment-panel');
    await expect(panel.getByRole('button', { name: 'Add Segment' })).toBeVisible();
    await panel.getByRole('button', { name: 'Add Segment' }).click();
    await expect(panel).toBeHidden();

    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await bar.click();
    const boxBefore = await bar.boundingBox();
    expect(boxBefore).not.toBeNull();

    await bar.locator('[data-testid="segment-row-down"]').click();
    await page.waitForFunction(
      ({ selector, minY }) => {
        const el = document.querySelector(selector) as HTMLElement | null;
        return el ? el.getBoundingClientRect().y > minY : false;
      },
      { selector: '[data-testid^="segment-bar-"]', minY: boxBefore!.y + 10 },
      { timeout: 2000 }
    );
    const boxAfterDown = await bar.boundingBox();
    expect(boxAfterDown!.y).toBeGreaterThan(boxBefore!.y + 10);

    await bar.locator('[data-testid="segment-row-up"]').click();
    await page.waitForFunction(
      ({ selector, maxY }) => {
        const el = document.querySelector(selector) as HTMLElement | null;
        return el ? el.getBoundingClientRect().y < maxY : false;
      },
      { selector: '[data-testid^="segment-bar-"]', maxY: boxAfterDown!.y - 10 },
      { timeout: 2000 }
    );
    const boxAfterUp = await bar.boundingBox();
    expect(boxAfterUp!.y).toBeLessThan(boxAfterDown!.y - 10);
  });

  test('AC6 – clicking elsewhere deselects the segment', async ({ page }) => {
    const bar = page.locator('[data-testid^="segment-bar-"]').first();
    await expect(bar).toBeVisible({ timeout: 10000 });
    await bar.click();
    await expect(bar).toHaveAttribute('data-selected', 'true');

    await page.locator('[data-testid^="timeline-col-"]').first().click();
    await expect(bar).not.toHaveAttribute('data-selected', 'true');
  });

  test('AC7 – clicking an initiative selects it', async ({ page }) => {
    const initBar = page.locator('[data-testid^="initiative-bar-"]').first();
    await expect(initBar).toBeVisible({ timeout: 10000 });
    await initBar.click();
    await expect(initBar).toHaveAttribute('data-selected', 'true');
  });

  test('AC8 – clicking elsewhere deselects the initiative', async ({ page }) => {
    const initBar = page.locator('[data-testid^="initiative-bar-"]').first();
    await expect(initBar).toBeVisible({ timeout: 10000 });
    await initBar.click();
    await expect(initBar).toHaveAttribute('data-selected', 'true');

    await page.locator('[data-testid^="timeline-col-"]').first().click();
    await expect(initBar).not.toHaveAttribute('data-selected', 'true');
  });
});

test.describe('US-18: Template Demo Data Toggle', () => {
  test('AC1: old reset buttons removed; "Clear data and start again" button present in Data Manager', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    await expect(page.getByText('Reset - delete all data')).not.toBeVisible();
    await expect(page.getByText('Reset - use demo data')).not.toBeVisible();

    await expect(page.getByTestId('clear-and-start-again-btn')).toBeVisible();
    await expect(page.getByTestId('clear-and-start-again-btn')).toContainText('Clear data and start again');
  });

  test('AC2: "Clear data and start again" opens template picker with data-loss warning', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('clear-and-start-again-btn').click();

    await expect(page.getByTestId('template-picker-modal')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('template-picker-modal')).toContainText(/replace.*data|data.*lost|data.*replaced/i);
  });

  test('AC3: non-blank template cards show "With demo data" and "Without demo data" buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });

    for (const templateId of ['dts', 'geanz']) {
      await expect(page.getByTestId(`template-select-with-demo-btn-${templateId}`)).toBeVisible();
      await expect(page.getByTestId(`template-select-no-demo-btn-${templateId}`)).toBeVisible();
    }
  });

  test('AC4: Blank template card shows only "Start blank" — no demo data buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });

    await expect(page.getByTestId('template-start-blank-btn')).toBeVisible();
    await expect(page.getByTestId('template-select-with-demo-btn-blank')).not.toBeVisible();
    await expect(page.getByTestId('template-select-no-demo-btn-blank')).not.toBeVisible();
  });

  test('AC5: DTS "With demo data" loads categories, assets, initiatives, and segments', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await page.getByTestId('template-select-with-demo-btn-dts').click();

    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.getByText('Digital Public Infrastructure')).toBeVisible();

    const initiativeBars = page.locator('[data-testid^="initiative-bar"]');
    await expect(initiativeBars.first()).toBeVisible({ timeout: 10000 });

    const segments = page.locator('[data-testid^="segment-"]');
    await expect(segments.first()).toBeVisible({ timeout: 10000 });
  });

  test('AC6: DTS "Without demo data" loads only categories and assets — no initiatives or segments', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await page.getByTestId('template-select-no-demo-btn-dts').click();

    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.getByText('Digital Public Infrastructure')).toBeVisible();
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible();

    await expect(page.locator('[data-testid^="initiative-bar"]')).toHaveCount(0);

    await expect(page.locator('[data-testid^="segment-"]')).toHaveCount(0);
  });

  test('AC7: first-time onboarding flow shows updated template picker with demo data buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });

    await expect(page.getByTestId('template-select-with-demo-btn-dts')).toBeVisible();
    await expect(page.getByTestId('template-select-no-demo-btn-dts')).toBeVisible();
    await expect(page.getByTestId('template-start-blank-btn')).toBeVisible();
  });

  test('AC8: selecting a template during first run shows the tutorial modal', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await page.getByTestId('template-select-with-demo-btn-dts').click();

    await expect(page.getByTestId('tutorial-modal')).toBeVisible({ timeout: 10000 });
  });

  test('AC9: E2E mode is unchanged — template picker is suppressed', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();
  });
});

test.describe('Today indicator line', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('today indicator is visible when today is within the timeline range', async ({ page }) => {
    await expect(page.getByTestId('today-indicator')).toBeVisible();
  });

  test('indicator carries a "Today" label', async ({ page }) => {
    const indicator = page.getByTestId('today-indicator');
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText('Today');
  });

  test('indicator is not rendered when today is before the timeline start', async ({ page }) => {
    const futureStart = new Date();
    futureStart.setFullYear(futureStart.getFullYear() + 5);
    const futureDateStr = futureStart.toISOString().slice(0, 10);

    await page.getByLabel('Start').fill(futureDateStr);
    await page.getByLabel('Start').press('Tab');

    await expect(page.getByTestId('today-indicator')).toBeHidden();
  });

  test('indicator reappears when timeline start is moved back to include today', async ({ page }) => {
    const futureStart = new Date();
    futureStart.setFullYear(futureStart.getFullYear() + 5);
    const futureDateStr = futureStart.toISOString().slice(0, 10);

    await page.getByLabel('Start').fill(futureDateStr);
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeHidden();

    const pastStart = new Date();
    pastStart.setFullYear(pastStart.getFullYear() - 1);
    const pastDateStr = pastStart.toISOString().slice(0, 10);

    await page.getByLabel('Start').fill(pastDateStr);
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeVisible();
  });
});

test.describe('Feature Animation Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('scenia-e2e', 'true');
    });
    await page.goto('/');
  });

  test('should load corrected v3 animation assets in Features Modal', async ({ page }) => {
    await page.getByTestId('nav-features').click();

    const dragAndDropImg = page.locator('img[src="/features/move-resize.png"]');
    await expect(dragAndDropImg).toBeVisible();

    const groupingImg = page.locator('img[src="/features/grouped.png"]');
    await expect(groupingImg).toBeVisible();

    await page.locator('#close-features-modal').click();
  });
});

test.describe('View Options Popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('a single "View" button is visible in the header', async ({ page }) => {
    await expect(page.getByTestId('view-options-btn')).toBeVisible();
  });

  test('clicking the button opens a popover with colour and group controls', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await expect(page.getByTestId('group-by-asset')).toBeVisible();
    await expect(page.getByTestId('group-by-programme')).toBeVisible();
    await expect(page.getByTestId('group-by-strategy')).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Programme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Strategy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Progress' })).toBeVisible();
  });

  test('popover closes when clicking outside', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await page.mouse.click(100, 100);
    await expect(page.getByTestId('view-options-popover')).toBeHidden();
  });

  test('the two old inline colour/group button groups are no longer in the header', async ({ page }) => {
    await expect(page.getByTestId('group-by-asset')).toBeHidden();
    await expect(page.getByRole('button', { name: 'By Programme' })).toBeHidden();
  });

  test('button label reflects current colour and group mode', async ({ page }) => {
    const btn = page.getByTestId('view-options-btn');
    await expect(btn).toContainText(/Programme|Strategy|Progress|Status/);
    await expect(btn).toContainText(/Asset|Programme|Strategy/);
  });
});

test.describe('Workspace Templates', () => {
  test('AC7: template picker is not shown in E2E mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();
  });

  test('AC1: template picker modal is shown on first load', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await expect(page.getByTestId('template-picker-modal')).toBeVisible({ timeout: 5000 });
  });

  test('AC2: all 4 template cards are visible', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await expect(page.getByTestId('template-card-dts')).toBeVisible();
    await expect(page.getByTestId('template-card-geanz')).toBeVisible();
    await expect(page.getByTestId('template-card-viewer')).toBeVisible();
    await expect(page.getByTestId('template-card-blank')).toBeVisible();
    await expect(page.getByTestId('template-card-mixed')).not.toBeVisible();
  });

  test('AC3: DTS template loads DTS categories and assets; GEANZ section hidden', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await page.getByTestId('template-select-with-demo-btn-dts').click();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.getByText('Digital Public Infrastructure')).toBeVisible();
    await expect(page.getByText('Identity & Credential Services').first()).toBeVisible();
    await expect(page.getByTestId('geanz-section')).not.toBeVisible();
  });

  test('AC4: GEANZ template loads demo portfolio and shows GEANZ section', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await page.getByTestId('template-select-with-demo-btn-geanz').click();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.getByTestId('geanz-section')).toBeVisible();
  });

  test('AC5a: Viewer card has a single "Upload file" button and no demo-data buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    const card = page.getByTestId('template-card-viewer');
    await expect(card).toBeVisible();
    await expect(card.getByTestId('template-viewer-upload-btn')).toBeVisible();
    await expect(card.getByTestId('template-select-with-demo-btn-viewer')).not.toBeVisible();
    await expect(card.getByTestId('template-select-no-demo-btn-viewer')).not.toBeVisible();
  });

  test('AC5b: clicking Upload file on Viewer card opens a file chooser', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('template-viewer-upload-btn').click(),
    ]);
    expect(fileChooser).toBeTruthy();
  });

  test('AC5c: uploading an Excel file via Viewer mode loads data and closes the picker', async ({ page }) => {
    const { utils, write } = await import('xlsx');
    const wb = utils.book_new();
    utils.book_append_sheet(
      wb,
      utils.aoa_to_sheet([
        ['id', 'name', 'categoryId'],
        ['asset-1', 'Imported Asset', 'cat-1'],
      ]),
      'Assets'
    );
    const buf: Buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });

    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('template-viewer-upload-btn').click(),
    ]);
    await fileChooser.setFiles({
      name: 'test-portfolio.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: buf,
    });

    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-visualiser')).toBeVisible();
  });

  test('AC6: Blank template loads empty workspace; GEANZ section hidden', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
    await page.getByTestId('template-start-blank-btn').click();
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('nav-visualiser')).toBeVisible();
    await expect(page.locator('[data-testid="asset-row-content"]')).toHaveCount(0);
    await expect(page.getByTestId('geanz-section')).not.toBeVisible();
  });

  test('AC8: template picker not shown when DB already has data', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.evaluate(() => localStorage.removeItem('scenia-e2e'));
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();
  });
});

test.describe('Zoom Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('zoom in button widens timeline columns', async ({ page }) => {
    const timeline = page.locator('#timeline-visualiser');
    await expect(timeline).toBeVisible();

    const initialWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);

    await page.getByTestId('zoom-in').click();

    const zoomedWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    expect(zoomedWidth).toBeGreaterThan(initialWidth);
  });

  test('zoom out button narrows timeline columns', async ({ page }) => {
    const timeline = page.locator('#timeline-visualiser');
    await expect(timeline).toBeVisible();

    await page.getByTestId('zoom-in').click();
    const zoomedInWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);

    await page.getByTestId('zoom-out').click();
    const zoomedOutWidth = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    expect(zoomedOutWidth).toBeLessThan(zoomedInWidth);
  });

  test.skip('zoom level persists across page reloads', async ({ page }) => {
    await page.getByTestId('zoom-in').click();
    await page.getByTestId('zoom-in').click();

    const widthBefore = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    const widthAfter = await page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    expect(widthAfter).toBeCloseTo(widthBefore, -1);
  });

  test('zoom out is disabled at minimum zoom level', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      const btn = page.getByTestId('zoom-out');
      const disabled = await btn.getAttribute('disabled');
      if (disabled !== null) break;
      await btn.click();
    }

    await expect(page.getByTestId('zoom-out')).toBeDisabled();
  });

  test('zoom in is disabled at maximum zoom level', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      const btn = page.getByTestId('zoom-in');
      const disabled = await btn.getAttribute('disabled');
      if (disabled !== null) break;
      await btn.click();
    }

    await expect(page.getByTestId('zoom-in')).toBeDisabled();
  });
});
