import { test, expect } from '@playwright/test';

/**
 * Keyboard Shortcuts Reference modal — a discoverable list of all
 * active keyboard shortcuts accessible via a "?" button in the header.
 */
test.describe('Keyboard Shortcuts Reference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
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
    await expect(modal).toContainText('Cmd');
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
