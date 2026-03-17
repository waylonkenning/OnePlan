import { test, expect } from '@playwright/test';

/**
 * Accessibility: EditableTable cell inputs must carry aria-label so screen
 * readers announce which column an input belongs to.
 */
test.describe('EditableTable aria-label on cell inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('real-row text inputs have aria-label matching the column label', async ({ page }) => {
    // The Initiatives tab is active by default; name column label is "Initiative Name"
    const nameInput = page.locator('[data-real="true"]').first()
      .locator('[data-key="name"] input').first();
    await expect(nameInput).toHaveAttribute('aria-label', 'Initiative Name');
  });

  test('ghost-row text inputs have aria-label matching the column label', async ({ page }) => {
    const ghostInput = page.locator('[data-testid="ghost-input-name"]').first();
    await expect(ghostInput).toHaveAttribute('aria-label', 'Initiative Name');
  });

  test('real-row select inputs have aria-label matching the column label', async ({ page }) => {
    // Switch to Assets tab which has a Category select column
    await page.getByRole('button', { name: 'Assets' }).click();
    const categorySelect = page.locator('[data-real="true"]').first()
      .locator('[data-key="categoryId"] select').first();
    await expect(categorySelect).toHaveAttribute('aria-label', 'Category');
  });

  test('real-row checkboxes have aria-label matching the column label', async ({ page }) => {
    // Initiatives tab — isPlaceholder boolean column label is "Placeholder?"
    const checkbox = page.locator('[data-real="true"]').first()
      .locator('[data-key="isPlaceholder"] input[type="checkbox"]').first();
    await expect(checkbox).toHaveAttribute('aria-label', 'Placeholder?');
  });
});
