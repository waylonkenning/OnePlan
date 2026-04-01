import { test, expect, Page } from '@playwright/test';

// US-BUG-01: Newly created initiatives should be editable/deletable and visible in Data Manager
//
// AC1: Opening a saved initiative (created via double-click) shows "Edit Initiative" title
// AC2: Opening a saved initiative shows the Delete Initiative button
// AC3: The new initiative appears in the Data Manager initiatives table

async function loadDtsWithDemo(page: Page) {
  await page.goto('/');
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
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function createInitiativeViaDoubleClick(page: Page): Promise<string> {
  // Double-click on an empty area of the first asset row to create initiative.
  // Use 3% width (far left) to avoid hitting existing initiative bars.
  const assetRow = page.locator('[data-testid="asset-row-content"]').first();
  await expect(assetRow).toBeVisible();
  const box = await assetRow.boundingBox();
  if (!box) throw new Error('No bounding box for asset row');

  await page.mouse.dblclick(box.x + box.width * 0.03, box.y + box.height / 2);

  // The create panel should open
  const panel = page.locator('[data-testid="initiative-panel"]');
  await expect(panel).toBeVisible({ timeout: 5000 });

  // Fill in a name and save
  const nameInput = panel.locator('#name');
  await nameInput.fill('Test Bug Initiative');
  await panel.getByRole('button', { name: 'Save Changes' }).click();
  await expect(panel).not.toBeVisible({ timeout: 5000 });

  // Find the new initiative bar
  const newBar = page.locator('[data-initiative-id]').filter({ hasText: 'Test Bug Initiative' }).first();
  await expect(newBar).toBeVisible({ timeout: 10000 });
  const id = await newBar.getAttribute('data-initiative-id');
  if (!id) throw new Error('No initiative id found');
  return id;
}

test.describe('US-BUG-01: Newly created initiative edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await loadDtsWithDemo(page);
  });

  test('AC1: re-opening a saved new initiative shows "Edit Initiative" title', async ({ page }) => {
    await createInitiativeViaDoubleClick(page);

    // Re-open by double-clicking the saved bar
    const bar = page.locator('[data-initiative-id]').filter({ hasText: 'Test Bug Initiative' }).first();
    await bar.dblclick();

    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator('h2')).toHaveText('Edit Initiative');
  });

  test('AC2: re-opening a saved new initiative shows Delete button', async ({ page }) => {
    await createInitiativeViaDoubleClick(page);

    const bar = page.locator('[data-initiative-id]').filter({ hasText: 'Test Bug Initiative' }).first();
    await bar.dblclick();

    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.getByRole('button', { name: 'Delete Initiative' })).toBeVisible();
  });

  test('AC3: new initiative appears in Data Manager initiatives table', async ({ page }) => {
    await createInitiativeViaDoubleClick(page);

    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    // The initiatives tab should be active by default — check for the input with the new name
    // (initiative names are rendered as <input> values in EditableTable, not as text content)
    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await expect(tableWrapper).toBeVisible({ timeout: 10000 });
    await expect(tableWrapper.locator('input[value="Test Bug Initiative"]')).toBeVisible();
  });
});
