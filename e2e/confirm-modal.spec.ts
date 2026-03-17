import { test, expect, Page } from '@playwright/test';

/**
 * Verifies that all destructive actions use the in-app ConfirmModal
 * rather than browser-native window.confirm dialogs.
 */

const CONFIRM_MODAL = '[data-testid="confirm-modal"]';
const CONFIRM_BTN = '[data-testid="confirm-modal-confirm"]';
const CANCEL_BTN = '[data-testid="confirm-modal-cancel"]';

async function openDataManager(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Data Manager' }).click();
  await expect(page.getByRole('button', { name: /Initiatives/ })).toBeVisible();
}

test.describe('In-app ConfirmModal — no browser dialogs', () => {
  // If a browser dialog fires unexpectedly, fail immediately
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

    // Only ghost row remains
    await expect(rows).toHaveCount(1);
  });

  test('DataManager Reset — delete all data shows confirm modal', async ({ page }) => {
    await openDataManager(page);
    await page.getByRole('button', { name: 'Reset - delete all data' }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CONFIRM_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).not.toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(1);
  });

  test('DataManager Reset — use demo data shows confirm modal', async ({ page }) => {
    await openDataManager(page);
    // First clear everything so we can see it refill
    await page.getByRole('button', { name: 'Reset - delete all data' }).click();
    await page.locator(CONFIRM_BTN).click();

    await page.getByRole('button', { name: 'Reset - use demo data' }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CONFIRM_BTN).click();
    await expect(page.locator(CONFIRM_MODAL)).not.toBeVisible();

    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(23);
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
    await expect(panel).toBeVisible(); // panel still open after cancel
  });

  test('InitiativePanel delete shows confirm modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-initiative-id]');
    await page.locator('[data-initiative-id]').first().click({ force: true });

    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible();

    await panel.getByRole('button', { name: /Delete/ }).click();
    await expect(page.locator(CONFIRM_MODAL)).toBeVisible();
    await page.locator(CANCEL_BTN).click();
    await expect(panel).toBeVisible();
  });

  test('VersionManager delete version shows confirm modal', async ({ page }) => {
    await page.goto('/');
    // Save a version first
    await page.getByRole('button', { name: 'History' }).click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.getByPlaceholder('e.g., March 2026 Snapshot').fill('Test Version');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await expect(page.getByText('Test Version')).toBeVisible();

    // Delete it via the trash icon
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
