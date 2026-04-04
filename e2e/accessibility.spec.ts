import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {

  // ── Focus traps & Escape key ───────────────────────────────────────────────

  test.describe('Focus trap and Escape key', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    });

    test('InitiativePanel closes on Escape', async ({ page }) => {
      await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
      await page.getByTestId('initiative-action-edit').click();
      await expect(page.getByTestId('initiative-panel')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('initiative-panel')).not.toBeVisible();
    });

    test('InitiativePanel traps focus — Tab cycles within panel', async ({ page }) => {
      await page.locator('[data-initiative-id="i-ciam-passkey"]').first().click();
      await page.getByTestId('initiative-action-edit').click();
      const panel = page.getByTestId('initiative-panel');
      await expect(panel).toBeVisible();

      for (let i = 0; i < 20; i++) await page.keyboard.press('Tab');

      await expect(panel.locator(':focus')).toBeAttached();
    });

    test('DependencyPanel closes on Escape', async ({ page }) => {
      await page.locator('[data-dep-id="dep-1"]').first().click({ force: true });
      await expect(page.getByTestId('dependency-panel')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('dependency-panel')).not.toBeVisible();
    });

    test('VersionManager closes on Escape', async ({ page }) => {
      await page.getByTestId('nav-history').click();
      await expect(page.getByTestId('close-version-manager')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('close-version-manager')).not.toBeVisible();
    });
  });

  // ── EditableTable aria-labels ──────────────────────────────────────────────

  test.describe('EditableTable aria-labels', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
      await page.getByRole('button', { name: 'Data Manager' }).click();
      await page.waitForSelector('[data-testid="ghost-input-name"]', { timeout: 10000 });
    });

    test('text inputs have aria-label matching the column label', async ({ page }) => {
      const nameInput = page.locator('[data-real="true"]').first()
        .locator('[data-key="name"] input').first();
      await expect(nameInput).toHaveAttribute('aria-label', 'Initiative Name');
      await expect(page.getByTestId('ghost-input-name').first())
        .toHaveAttribute('aria-label', 'Initiative Name');
    });

    test('select inputs have aria-label matching the column label', async ({ page }) => {
      await page.getByRole('button', { name: 'Assets' }).click();
      const categorySelect = page.locator('[data-real="true"]').first()
        .locator('[data-key="categoryId"] select').first();
      await expect(categorySelect).toHaveAttribute('aria-label', 'Category');
    });

    test('checkboxes have aria-label matching the column label', async ({ page }) => {
      const checkbox = page.locator('[data-real="true"]').first()
        .locator('[data-key="isPlaceholder"] input[type="checkbox"]').first();
      await expect(checkbox).toHaveAttribute('aria-label', 'Placeholder?');
    });
  });

  // ── Header toggle button accessibility ────────────────────────────────────

  test.describe('Header toggle buttons', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    });

    test('conflict detection toggle has aria-label and tracks aria-pressed', async ({ page }) => {
      const btn = page.getByTestId('toggle-conflicts');
      await expect(btn).toHaveAttribute('aria-label');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('relationships toggle has aria-label and tracks aria-pressed', async ({ page }) => {
      const btn = page.getByTestId('toggle-relationships');
      await expect(btn).toHaveAttribute('aria-label');
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    test('descriptions toggle has aria-label and tracks aria-pressed', async ({ page }) => {
      const btn = page.getByTestId('toggle-descriptions');
      await expect(btn).toHaveAttribute('aria-label');
      await expect(btn).toHaveAttribute('aria-pressed', 'false');
      await btn.click();
      await expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    test('budget toggle cycles through states correctly', async ({ page }) => {
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
});
