import { test, expect } from '@playwright/test';

test.describe('Undo/Redo Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Clear any existing db data just in case
        await page.evaluate(async () => {
            const databases = await window.indexedDB.databases();
            for (const db of databases) {
                if (db.name) {
                    window.indexedDB.deleteDatabase(db.name);
                }
            }
        });
        await page.reload();
        // Go to Data Manager
        await page.getByRole('button', { name: 'Data Manager' }).click();
    });

    test('can undo and redo text edits via buttons', async ({ page }) => {
        // Find the first initiative name input
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();

        // Initial value check
        const initialValue = await nameInput.inputValue();
        if (initialValue !== 'Passkey Rollout' && initialValue !== 'SSO Consolidation') {
            console.warn('Initial value was not expected. Found:', initialValue);
        }

        // Change the value
        await nameInput.fill('Changed Name 1');
        // Click away or press Enter to trigger onChange/onUpdate
        await page.keyboard.press('Tab');

        // Check it changed
        await expect(nameInput).toHaveValue('Changed Name 1');

        // Undo via Button (assuming title='Undo')
        const undoBtn = page.getByTitle('Undo');
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        // Check it reverted
        await expect(nameInput).toHaveValue(initialValue);

        // Redo via Button (assuming title='Redo')
        const redoBtn = page.getByTitle('Redo');
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        // Check it changed back
        await expect(nameInput).toHaveValue('Changed Name 1');
    });

    test('can undo and redo via keyboard shortcuts', async ({ page }) => {
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();

        const initialValue = await nameInput.inputValue();

        // Change the value
        await nameInput.fill('Kb Shortcut Edit');
        await page.keyboard.press('Tab'); // Trigger update
        await expect(nameInput).toHaveValue('Kb Shortcut Edit');

        // Note: Playwright keyboard shortcuts depend on the OS.
        // We'll dispatch Cmd+Z for Mac or Ctrl+Z for Windows.
        const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

        // Undo shortcut
        await page.keyboard.press(`${modifier}+z`);

        // Check it reverted
        await expect(nameInput).toHaveValue(initialValue);

        // Redo shortcut (Cmd+Shift+Z or Ctrl+Shift+Z)
        await page.keyboard.press(`${modifier}+Shift+Z`);

        // Check it reapplied
        await expect(nameInput).toHaveValue('Kb Shortcut Edit');
    });

    test('history stack is limited to 50 operations', async ({ page }) => {
        test.setTimeout(60000);
        const firstRow = page.locator('tbody tr[data-real="true"]').first();
        const nameInput = firstRow.locator('input[type="text"]').first();

        // Perform 51 operations
        for (let i = 1; i <= 51; i++) {
            await nameInput.fill(`Edit Operation ${i}`);
            await page.keyboard.press('Tab');
        }

        const undoBtn = page.getByTitle('Undo');

        // Undo 50 times (this should get us back to "Edit Operation 1")
        for (let i = 0; i < 50; i++) {
            await expect(undoBtn).toBeEnabled();
            await undoBtn.click();
        }

        // We should now be at "Edit Operation 1", NOT the initial value,
        // because the 51st operation pushed the initial state out of the stack.
        await expect(nameInput).toHaveValue('Edit Operation 1');

        // The Undo button should now be disabled since the stack (max size 50) is empty
        await expect(undoBtn).toBeDisabled();
    });
});
