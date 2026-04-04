import { test, expect } from '@playwright/test';

async function openDataManager(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  await page.getByTestId('nav-data-manager').click();
  await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();
}

test.describe('Undo/Redo', () => {
  test('buttons are disabled on fresh page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await expect(page.getByTitle('Undo')).toBeDisabled();
    await expect(page.getByTitle('Redo')).toBeDisabled();
  });

  test('can undo and redo text edits via buttons', async ({ page }) => {
    await openDataManager(page);
    const nameInput = page.locator('tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const initialValue = await nameInput.inputValue();

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
    await openDataManager(page);
    const nameInput = page.locator('tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const initialValue = await nameInput.inputValue();
    const mod = process.platform === 'darwin' ? 'Meta' : 'Control';

    await nameInput.fill('Kb Shortcut Edit');
    await page.keyboard.press('Tab');
    await expect(nameInput).toHaveValue('Kb Shortcut Edit');

    await page.keyboard.press(`${mod}+z`);
    await expect(nameInput).toHaveValue(initialValue);

    await page.keyboard.press(`${mod}+Shift+Z`);
    await expect(nameInput).toHaveValue('Kb Shortcut Edit');
  });

  test('undo counter tracks steps and disappears when stack is empty', async ({ page }) => {
    await openDataManager(page);
    const nameInput = page.locator('tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const undoCounter = page.getByTestId('undo-counter');

    await expect(undoCounter).not.toBeVisible();

    for (let i = 1; i <= 3; i++) {
      await nameInput.fill(`Edit ${i}`);
      await page.keyboard.press('Tab');
    }
    await expect(undoCounter).toHaveText('3');

    await page.getByTitle('Undo').click();
    await expect(undoCounter).toHaveText('2');

    await page.getByTitle('Undo').click();
    await page.getByTitle('Undo').click();
    await expect(undoCounter).not.toBeVisible();
  });

  test('new edit after undo clears the redo stack', async ({ page }) => {
    await openDataManager(page);
    const nameInput = page.locator('tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const originalValue = await nameInput.inputValue();
    const undoBtn = page.getByTitle('Undo');
    const redoBtn = page.getByTitle('Redo');

    await nameInput.fill('Edit One');
    await nameInput.press('Tab');
    await undoBtn.click();
    await expect(nameInput).toHaveValue(originalValue);
    await expect(redoBtn).toBeEnabled();

    await nameInput.fill('Brand New Edit');
    await nameInput.press('Tab');
    await expect(redoBtn).toBeDisabled();
  });

  test('Cmd/Ctrl+Z inside an input does not trigger app-level undo', async ({ page }) => {
    await openDataManager(page);
    const nameInput = page.locator('tbody tr[data-real="true"]').first().locator('input[type="text"]').first();
    const originalValue = await nameInput.inputValue();
    const mod = process.platform === 'darwin' ? 'Meta' : 'Control';

    await nameInput.fill('First Change');
    await nameInput.press('Tab');

    await nameInput.fill('Typing In Progress');
    // Keep focus in the input and press the shortcut
    await nameInput.press(`${mod}+z`);

    // App-level undo stack still has an entry (was not triggered)
    await expect(page.getByTitle('Undo')).toBeEnabled();
    expect(await nameInput.inputValue()).not.toBe(originalValue);
  });

  test('undo stack is capped at 10 — oldest operations fall off', async ({ page }) => {
    await openDataManager(page);
    const nameCell = page.locator('tbody tr').first().locator('td').first().locator('input[type="text"]');

    for (let i = 1; i <= 15; i++) {
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
    await expect(nameCell).toHaveValue('Rename 5');
    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTitle('Undo')).toBeDisabled();
  });
});
