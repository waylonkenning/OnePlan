import { test, expect } from '@playwright/test';

/**
 * Accessibility: panels must trap focus and close on Escape so keyboard
 * users aren't forced to Tab through the entire page to dismiss them.
 */
test.describe('Panel focus trap and Escape key', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('InitiativePanel closes on Escape', async ({ page }) => {
    const passkey = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await passkey.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('initiative-panel')).not.toBeVisible({ timeout: 3000 });
  });

  test('InitiativePanel traps focus — Tab does not leave the panel', async ({ page }) => {
    const passkey2 = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await passkey2.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
    }

    const focusedElement = page.locator(':focus');
    await expect(panel.locator(':focus')).toBeAttached({ timeout: 2000 });
  });

  test('DependencyPanel closes on Escape', async ({ page }) => {
    const depArrow = page.locator('[data-dep-id="dep-1"]').first();
    await depArrow.click({ force: true });
    await expect(page.getByTestId('dependency-panel')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('dependency-panel')).not.toBeVisible({ timeout: 3000 });
  });

  test('VersionManager closes on Escape', async ({ page }) => {
    await page.getByTestId('nav-history').click();
    await expect(page.locator('[data-testid="close-version-manager"]')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="close-version-manager"]')).not.toBeVisible({ timeout: 3000 });
  });
});

/**
 * Accessibility: EditableTable cell inputs must carry aria-label so screen
 * readers announce which column an input belongs to.
 */
test.describe('EditableTable aria-label on cell inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('real-row text inputs have aria-label matching the column label', async ({ page }) => {
    const nameInput = page.locator('[data-real="true"]').first()
      .locator('[data-key="name"] input').first();
    await expect(nameInput).toHaveAttribute('aria-label', 'Initiative Name');
  });

  test('ghost-row text inputs have aria-label matching the column label', async ({ page }) => {
    const ghostInput = page.locator('[data-testid="ghost-input-name"]').first();
    await expect(ghostInput).toHaveAttribute('aria-label', 'Initiative Name');
  });

  test('real-row select inputs have aria-label matching the column label', async ({ page }) => {
    await page.getByRole('button', { name: 'Assets' }).click();
    const categorySelect = page.locator('[data-real="true"]').first()
      .locator('[data-key="categoryId"] select').first();
    await expect(categorySelect).toHaveAttribute('aria-label', 'Category');
  });

  test('real-row checkboxes have aria-label matching the column label', async ({ page }) => {
    const checkbox = page.locator('[data-real="true"]').first()
      .locator('[data-key="isPlaceholder"] input[type="checkbox"]').first();
    await expect(checkbox).toHaveAttribute('aria-label', 'Placeholder?');
  });
});

/**
 * Accessibility: header toggle buttons must convey their purpose and active
 * state to screen readers via aria-label and aria-pressed, not colour alone.
 */
test.describe('Header toggle button accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('conflict detection toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-conflicts');
    await expect(btn).toHaveAttribute('aria-label');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('relationships toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-relationships');
    await expect(btn).toHaveAttribute('aria-label');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('descriptions toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-descriptions');
    await expect(btn).toHaveAttribute('aria-label');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('budget toggle has aria-label and correct aria-pressed', async ({ page }) => {
    const btn = page.getByTestId('toggle-budget');
    await expect(btn).toHaveAttribute('aria-label');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});
