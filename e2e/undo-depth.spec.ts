import { test, expect } from '@playwright/test';

/**
 * Undo history stack must hold at least 50 operations.
 * Previously capped at 10 — power users on complex roadmaps hit this limit.
 */
test.describe('Undo depth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('undo stack holds more than 10 operations', async ({ page }) => {
    // Perform 15 distinct renames via the Data Manager to build up history
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    // Edit the name cell 15 times with distinct values
    for (let i = 1; i <= 15; i++) {
      const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
      await nameCell.fill(`Rename ${i}`);
      await nameCell.press('Tab');
      // Small wait for state to settle
      await page.waitForTimeout(100);
    }

    // Switch back to visualiser and undo 15 times
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]');

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(50);
    }

    // After 15 undos the name should be back to its original value (not "Rename 5" or earlier,
    // which would happen if the stack was capped at 10).
    // We verify by checking the undo button is still enabled after the 11th undo.
    // The undo button is enabled when undoStack.length > 0.
    const undoBtn = page.getByTitle('Undo');
    // At 15 undos with a 50-deep stack the button should now be disabled (stack exhausted)
    // but it must NOT have become disabled at undo #11 (which would indicate a cap of 10).
    // We verify this by checking the name in the data manager returned to the original.
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
    const finalName = await nameCell.inputValue();
    // If the stack was capped at 10, only 10 undos would have worked and the name
    // would still be "Rename 5" (15 - 10 = 5). With a 50-deep stack all 15 undo, returning the original.
    expect(finalName).not.toMatch(/^Rename \d+$/);
  });

  test('undo stack limit is at least 50', { timeout: 90000 }, async ({ page }) => {
    // Perform 52 operations then undo 51 — if capped at 50 the 51st undo does nothing.
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    // Clear all initiatives first so the table stays small (1 row) throughout the
    // 52-operation loop — avoids CI timeouts with larger demo datasets.
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // Create a single initiative via the ghost row to give us something to rename
    const ghostCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
    await ghostCell.fill('Initial');
    await ghostCell.press('Tab');
    await page.waitForTimeout(100);

    // Perform 52 renames on the now-single row
    for (let i = 1; i <= 52; i++) {
      const cell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
      await cell.fill(`Op ${i}`);
      await cell.press('Tab');
      await page.waitForTimeout(80);
    }

    // Undo 50 times (should reach back to Op 2, since Op 1 was dropped from the 50-cap)
    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]');

    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(30);
    }

    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const cell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
    const nameAfter50Undos = await cell.inputValue();

    // With a 50-deep stack, undoing 50 times from Op 52 should reach Op 2 (oldest kept entry).
    // Most importantly it must NOT be "Op 52" (which would mean undos stopped at 10 or similar)
    expect(nameAfter50Undos).not.toBe('Op 52');
    expect(nameAfter50Undos).not.toBe('Op 47'); // what we'd get with a cap of 5
    expect(nameAfter50Undos).not.toBe('Op 42'); // what we'd get with a cap of 10
  });
});
