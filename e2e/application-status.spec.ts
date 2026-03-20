import { test, expect } from '@playwright/test';

/**
 * User Story: Application lifecycle segments are visually distinct from initiatives
 * and their statuses are configurable via the Data Manager.
 *
 * Acceptance Criteria:
 * AC1: Segment bars display a diagonal stripe overlay to distinguish them from solid initiative bars.
 * AC2: Each segment bar shows a right-aligned status label (e.g. "In Production").
 * AC3: Data Manager has an "App Statuses" tab.
 * AC4: App Statuses tab lists all six default statuses, each with a name and colour.
 * AC5: Renaming a status in the Data Manager updates the label shown on segment bars.
 */
test.describe('Application segment visual distinction & status management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // AC1: Segment bars have a stripe overlay element
  test('segment bar has a diagonal stripe overlay', async ({ page }) => {
    const segBar = page.locator('[data-testid="segment-bar-seg-okta-prod"]');
    await expect(segBar).toBeVisible();
    await expect(segBar.locator('[data-testid="segment-stripe"]')).toBeVisible();
  });

  // AC2: Segment bar shows right-aligned status label
  test('segment bar shows status label', async ({ page }) => {
    const segBar = page.locator('[data-testid="segment-bar-seg-okta-prod"]');
    await expect(segBar).toBeVisible();
    const label = segBar.locator('[data-testid="segment-status-label"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText('In Production');
  });

  // AC3: Data Manager has App Statuses tab
  test('Data Manager has an App Statuses tab', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager-tab-appStatuses')).toBeVisible();
  });

  // AC4: App Statuses tab lists all six default statuses with name and colour
  test('App Statuses tab shows all default statuses', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-appStatuses').click();

    // EditableTable renders cells as inputs — check input values
    const nameInputs = page.locator('tbody tr td input[type="text"]');
    const values = await nameInputs.evaluateAll(els =>
      (els as HTMLInputElement[]).map(el => el.value).filter(Boolean)
    );

    for (const name of ['Planned', 'Funded', 'In Production', 'Sunset', 'Out of Support', 'Retired']) {
      expect(values).toContain(name);
    }
  });

  // AC5: Renaming a status updates the label on segment bars
  test('renaming a status in Data Manager updates segment bar labels', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-appStatuses').click();

    // Find the "In Production" name input and change it — cells are always inputs in EditableTable
    const nameInputs = page.locator('tbody tr td input[type="text"]');
    const inProdInput = nameInputs.filter({ hasText: '' }).nth(0); // fallback
    // More reliable: find by current value
    const allInputs = await nameInputs.all();
    let targetInput = null;
    for (const inp of allInputs) {
      if (await inp.inputValue() === 'In Production') {
        targetInput = inp;
        break;
      }
    }
    expect(targetInput).not.toBeNull();
    await targetInput!.fill('Live');
    await targetInput!.press('Tab');

    // Navigate back to visualiser and confirm segment bar shows "Live"
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]');

    const segBar = page.locator('[data-testid="segment-bar-seg-okta-prod"]');
    await expect(segBar.locator('[data-testid="segment-status-label"]')).toContainText('Live');
  });
});
