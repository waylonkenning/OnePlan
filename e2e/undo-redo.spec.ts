import { test, expect } from '@playwright/test';

async function waitForApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

test.describe('Undo depth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('undo stack does not hold more than 10 operations', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    for (let i = 1; i <= 15; i++) {
      const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
      await nameCell.fill(`Rename ${i}`);
      await nameCell.press('Tab');
      await page.waitForTimeout(50);
    }

    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('[data-testid="asset-row-content"]');

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(30);
    }

    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');
    await expect(nameCell).toHaveValue('Rename 5');

    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTitle('Undo')).toBeDisabled();
  });
});

test.describe('Undo/Redo Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(async () => {
            const databases = await window.indexedDB.databases();
            for (const db of databases) {
                if (db.name) {
                    window.indexedDB.deleteDatabase(db.name);
                }
            }
        });
        await page.reload();
        await page.getByRole('button', { name: 'Data Manager' }).click();
    });

    test('can undo and redo text edits via buttons', async ({ page }) => {
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();

        const initialValue = await nameInput.inputValue();
        if (initialValue !== 'Passkey Rollout' && initialValue !== 'SSO Consolidation') {
            console.warn('Initial value was not expected. Found:', initialValue);
        }

        await nameInput.fill('Changed Name 1');
        await page.keyboard.press('Tab');

        await expect(nameInput).toHaveValue('Changed Name 1');

        const undoBtn = page.getByTitle('Undo');
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        await expect(nameInput).toHaveValue(initialValue);

        const redoBtn = page.getByTitle('Redo');
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        await expect(nameInput).toHaveValue('Changed Name 1');
    });

    test('can undo and redo via keyboard shortcuts', async ({ page }) => {
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();

        const initialValue = await nameInput.inputValue();

        await nameInput.fill('Kb Shortcut Edit');
        await page.keyboard.press('Tab');
        await expect(nameInput).toHaveValue('Kb Shortcut Edit');

        const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

        await page.keyboard.press(`${modifier}+z`);

        await expect(nameInput).toHaveValue(initialValue);

        await page.keyboard.press(`${modifier}+Shift+Z`);

        await expect(nameInput).toHaveValue('Kb Shortcut Edit');
    });

    test('undo counter shows remaining steps and disappears when stack is empty', async ({ page }) => {
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();
        const undoCounter = page.getByTestId('undo-counter');

        await expect(undoCounter).not.toBeVisible();

        for (let i = 1; i <= 3; i++) {
            await nameInput.fill(`Edit ${i}`);
            await page.keyboard.press('Tab');
        }

        await expect(undoCounter).toBeVisible();
        await expect(undoCounter).toHaveText('3');

        await page.getByTitle('Undo').click();
        await expect(undoCounter).toHaveText('2');

        await page.getByTitle('Undo').click();
        await page.getByTitle('Undo').click();
        await expect(undoCounter).not.toBeVisible();
    });

    test('history stack is limited to 10 operations', async ({ page }) => {
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();

        for (let i = 1; i <= 11; i++) {
            await nameInput.fill(`Edit Operation ${i}`);
            await page.keyboard.press('Tab');
        }

        const undoBtn = page.getByTitle('Undo');

        for (let i = 0; i < 10; i++) {
            await expect(undoBtn).toBeEnabled();
            await undoBtn.click();
        }

        await expect(nameInput).toHaveValue('Edit Operation 1');

        await expect(undoBtn).toBeDisabled();
    });
});

/**
 * User Story: Undo/Redo Edge Cases (P0 Safety Net)
 *
 * AC1: On fresh page load with no edits, both Undo and Redo buttons are disabled
 * AC2: After undoing an action, performing a new edit clears the redo stack
 *      (Redo button becomes disabled again)
 * AC3: The global keyboard undo shortcut (Cmd/Ctrl+Z) has no effect when focus
 *      is inside an input or textarea field — the native browser undo runs instead
 */

test.describe('Undo/Redo Edge Cases', () => {

  test('AC1: Undo and Redo buttons are disabled on fresh page load', async ({ page }) => {
    await waitForApp(page);

    const undoBtn = page.getByTitle('Undo');
    const redoBtn = page.getByTitle('Redo');

    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeDisabled();
  });

  test('AC2: performing a new edit after undo clears the redo stack', async ({ page }) => {
    await waitForApp(page);

    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameInput = page.locator('tbody tr[data-real="true"]').first()
      .locator('input[type="text"]').first();

    const originalValue = await nameInput.inputValue();

    await nameInput.fill('Edit One');
    await nameInput.press('Tab');
    await expect(nameInput).toHaveValue('Edit One');

    const undoBtn = page.getByTitle('Undo');
    const redoBtn = page.getByTitle('Redo');

    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(nameInput).toHaveValue(originalValue);

    await expect(redoBtn).toBeEnabled();

    await nameInput.fill('Brand New Edit');
    await nameInput.press('Tab');
    await expect(nameInput).toHaveValue('Brand New Edit');

    await expect(redoBtn).toBeDisabled();
  });

  test('AC3: Cmd/Ctrl+Z inside an input field does not trigger app-level undo', async ({ page }) => {
    await waitForApp(page);

    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();

    const nameInput = page.locator('tbody tr[data-real="true"]').first()
      .locator('input[type="text"]').first();

    const originalValue = await nameInput.inputValue();

    await nameInput.fill('First Change');
    await nameInput.press('Tab');

    await nameInput.fill('Typing In Progress');

    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

    await nameInput.press(`${modifier}+z`);

    const undoBtn = page.getByTitle('Undo');
    await expect(undoBtn).toBeEnabled();

    const valueAfterShortcut = await nameInput.inputValue();
    expect(valueAfterShortcut).not.toBe(originalValue);
  });
});
