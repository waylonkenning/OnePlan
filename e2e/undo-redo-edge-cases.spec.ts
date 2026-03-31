import { test, expect } from '@playwright/test';

/**
 * User Story: Undo/Redo Edge Cases (P0 Safety Net)
 *
 * AC1: On fresh page load with no edits, both Undo and Redo buttons are disabled
 * AC2: After undoing an action, performing a new edit clears the redo stack
 *      (Redo button becomes disabled again)
 * AC3: The global keyboard undo shortcut (Cmd/Ctrl+Z) has no effect when focus
 *      is inside an input or textarea field — the native browser undo runs instead
 */

async function waitForApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

test.describe('Undo/Redo Edge Cases', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: Undo and Redo buttons are disabled on fresh page load', async ({ page }) => {
    await waitForApp(page);

    const undoBtn = page.getByTitle('Undo');
    const redoBtn = page.getByTitle('Redo');

    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeDisabled();
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: performing a new edit after undo clears the redo stack', async ({ page }) => {
    await waitForApp(page);

    // Open Data Manager and edit an initiative name
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameInput = page.locator('tbody tr[data-real="true"]').first()
      .locator('input[type="text"]').first();

    const originalValue = await nameInput.inputValue();

    await nameInput.fill('Edit One');
    await nameInput.press('Tab');
    await expect(nameInput).toHaveValue('Edit One');

    // Undo — restores the original value; redo stack now has one entry
    const undoBtn = page.getByTitle('Undo');
    const redoBtn = page.getByTitle('Redo');

    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(nameInput).toHaveValue(originalValue);

    // Redo should now be enabled
    await expect(redoBtn).toBeEnabled();

    // Make a new edit — this must clear the redo stack
    await nameInput.fill('Brand New Edit');
    await nameInput.press('Tab');
    await expect(nameInput).toHaveValue('Brand New Edit');

    // Redo stack must be empty; Redo button must be disabled
    await expect(redoBtn).toBeDisabled();
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: Cmd/Ctrl+Z inside an input field does not trigger app-level undo', async ({ page }) => {
    await waitForApp(page);

    // Open Data Manager so we have initiative name inputs visible
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameInput = page.locator('tbody tr[data-real="true"]').first()
      .locator('input[type="text"]').first();

    const originalValue = await nameInput.inputValue();

    // Make a first edit so the undo stack has an entry
    await nameInput.fill('First Change');
    await nameInput.press('Tab');

    // Make a second edit; don't commit (keep focus inside input)
    await nameInput.fill('Typing In Progress');
    // Do NOT press Tab — keep focus inside the input

    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

    // Cmd/Ctrl+Z while the input has focus should undo the native browser text
    // edit, NOT pop the app-level undo stack
    await nameInput.press(`${modifier}+z`);

    // The app-level undo button must still see the "First Change" edit in the stack,
    // meaning the global undo handler was suppressed while the input had focus.
    // If the global handler fired, it would have reverted us to originalValue.
    const undoBtn = page.getByTitle('Undo');
    await expect(undoBtn).toBeEnabled(); // stack still non-empty

    // The input value should be something other than originalValue
    // (either 'Typing In Progress' partially undone, or 'First Change' —
    // but definitely NOT originalValue which would indicate app-level undo fired)
    const valueAfterShortcut = await nameInput.inputValue();
    expect(valueAfterShortcut).not.toBe(originalValue);
  });
});
