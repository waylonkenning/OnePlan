import { test, expect } from '@playwright/test';

/**
 * Undo history stack is capped at 10 operations.
 */
test.describe('Undo depth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('undo stack does not hold more than 10 operations', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    // Perform 15 edits to overflow the 10-deep stack
    for (let i = 1; i <= 15; i++) {
      const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
      await nameCell.fill(`Rename ${i}`);
      await nameCell.press('Tab');
      await page.waitForTimeout(50);
    }

    // Undo 10 times — the stack is now empty
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]');

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(30);
    }

    // After 10 undos from Op 15, we should be at "Rename 5" (15 - 10 = 5)
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
    await expect(nameCell).toHaveValue('Rename 5');

    // Undo button should now be disabled (stack exhausted)
    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTitle('Undo')).toBeDisabled();
  });
});
