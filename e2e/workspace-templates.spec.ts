import { test, expect } from '@playwright/test';

/**
 * User Story 15: Workspace Templates (Multi-Taxonomy Support)
 *
 * AC1: TemplatePickerModal shown on first load (empty DB, no scenia-e2e flag)
 * AC2: Modal shows 4 template cards: dts, geanz, viewer, blank
 * AC3: DTS template loads 6 DTS layer categories + 20 assets; GEANZ section hidden
 * AC4: GEANZ template loads GEANZ demo portfolio; GEANZ section visible
 * AC5: Viewer card has single "Upload file" button; triggers file chooser; closes picker after import
 * AC6: Blank template loads empty workspace; GEANZ section hidden
 * AC7: Template picker NOT shown in E2E mode (scenia-e2e flag)
 * AC8: Template picker NOT shown on subsequent loads (non-empty DB)
 */

/**
 * Helper: delete the app's IndexedDB and remove the scenia-e2e flag so that the
 * next page.reload() triggers the first-run template picker.
 */
async function simulateFirstRun(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    // Skip the landing page so the template picker shows immediately
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
}

test.describe('Workspace Templates', () => {
  // AC7: template picker is suppressed when scenia-e2e is set (default E2E setup)
  test('AC7: template picker is not shown in E2E mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();
  });

  // AC1: picker shown on first load
  test('AC1: template picker modal is shown on first load', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await expect(page.getByTestId('template-picker-modal')).toBeVisible({ timeout: 20000 });
  });

  // AC2: all 4 template cards are present
  test('AC2: all 4 template cards are visible', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await expect(page.getByTestId('template-card-dts')).toBeVisible();
    await expect(page.getByTestId('template-card-geanz')).toBeVisible();
    await expect(page.getByTestId('template-card-viewer')).toBeVisible();
    await expect(page.getByTestId('template-card-blank')).toBeVisible();
    // Mixed card must no longer exist
    await expect(page.getByTestId('template-card-mixed')).not.toBeVisible();
  });

  // AC3: DTS template
  test('AC3: DTS template loads DTS categories and assets; GEANZ section hidden', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await page.getByTestId('template-select-with-demo-btn-dts').click();
    // DTS assets render as regular swimlanes
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    // A DTS category header should be visible
    await expect(page.getByText('Digital Public Infrastructure')).toBeVisible();
    // A DTS asset should be visible
    await expect(page.getByText('Identity & Credential Services').first()).toBeVisible();
    // GEANZ section should be hidden
    await expect(page.getByTestId('geanz-section')).not.toBeVisible();
  });

  // AC4: GEANZ template
  test('AC4: GEANZ template loads demo portfolio and shows GEANZ section', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await page.getByTestId('template-select-with-demo-btn-geanz').click();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    // GEANZ section must be visible
    await expect(page.getByTestId('geanz-section')).toBeVisible();
  });

  // AC5: Viewer mode
  test('AC5a: Viewer card has a single "Upload file" button and no demo-data buttons', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    const card = page.getByTestId('template-card-viewer');
    await expect(card).toBeVisible();
    await expect(card.getByTestId('template-viewer-upload-btn')).toBeVisible();
    await expect(card.getByTestId('template-select-with-demo-btn-viewer')).not.toBeVisible();
    await expect(card.getByTestId('template-select-no-demo-btn-viewer')).not.toBeVisible();
  });

  test('AC5b: clicking Upload file on Viewer card opens a file chooser', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('template-viewer-upload-btn').click(),
    ]);
    expect(fileChooser).toBeTruthy();
  });

  test('AC5c: uploading an Excel file via Viewer mode loads data and closes the picker', async ({ page }) => {
    // Create a minimal valid XLSX buffer with an Assets sheet
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
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('template-viewer-upload-btn').click(),
    ]);
    await fileChooser.setFiles({
      name: 'test-portfolio.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: buf,
    });

    // Template picker should close after import
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible({ timeout: 10000 });
    // App nav is visible
    await expect(page.getByTestId('nav-visualiser')).toBeVisible();
  });

  // AC6: Blank template
  test('AC6: Blank template loads empty workspace; GEANZ section hidden', async ({ page }) => {
    await page.goto('/');
    await simulateFirstRun(page);
    await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
    await page.getByTestId('template-start-blank-btn').click();
    // Modal dismissed
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible({ timeout: 10000 });
    // App nav is visible (app loaded)
    await expect(page.getByTestId('nav-visualiser')).toBeVisible();
    // No asset swimlanes
    await expect(page.locator('[data-testid="asset-row-content"]')).toHaveCount(0);
    // GEANZ section hidden
    await expect(page.getByTestId('geanz-section')).not.toBeVisible();
  });

  // AC8: picker not shown on subsequent loads
  test('AC8: template picker not shown when DB already has data', async ({ page }) => {
    // Load with GEANZ (default E2E behavior) — DB is populated
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    // Remove the scenia-e2e flag — but DB is non-empty now
    await page.evaluate(() => localStorage.removeItem('scenia-e2e'));
    await page.reload();
    // App should load data from DB, not show the picker
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await expect(page.getByTestId('template-picker-modal')).not.toBeVisible();
  });
});
