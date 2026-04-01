import { test, expect } from '@playwright/test';

/**
 * US-02: DB error handling and diagnostics
 *
 * When an IndexedDB save fails, the user should see a clear error banner
 * (not a browser alert) and the console should log diagnostic details.
 */
test.describe('DB save error handling', () => {
  test('shows an inline error banner when saveAppData fails', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    // Intercept IDBObjectStore.put to simulate a DB failure
    await page.evaluate(() => {
      const originalOpen = window.indexedDB.open.bind(window.indexedDB);
      // Force the next saveAppData call to throw by patching the global
      // We'll use a localStorage flag that the app checks to simulate the failure
      localStorage.setItem('scenia-test-db-save-fail', 'true');
    });

    // Reload so the app picks up the flag (the flag is checked during DB operations)
    // Instead, we simulate by directly overriding IDBTransaction
    await page.evaluate(() => {
      // Patch IDBObjectStore.prototype.put to throw on next call
      let callCount = 0;
      const originalPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function(...args) {
        callCount++;
        if (callCount === 1) {
          IDBObjectStore.prototype.put = originalPut; // restore after first throw
          throw new DOMException(
            "Failed to execute 'put' on 'IDBObjectStore': evaluating the object store's key path did not yield a value.",
            'DataError'
          );
        }
        return originalPut.apply(this, args);
      };
    });

    // Trigger a save by opening and closing an initiative panel (causing a state update)
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await bar.locator('[data-testid="initiative-edit"]').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    // An inline error notification should appear (not a browser alert)
    await expect(page.getByTestId('db-error-banner')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('db-error-banner')).toContainText('save');
  });

  test('logs diagnostic details to console when saveAppData fails', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    await page.evaluate(() => {
      let patched = false;
      const originalPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function(...args) {
        if (!patched) {
          patched = true;
          IDBObjectStore.prototype.put = originalPut;
          throw new DOMException(
            "Failed to execute 'put' on 'IDBObjectStore': evaluating the object store's key path did not yield a value.",
            'DataError'
          );
        }
        return originalPut.apply(this, args);
      };
    });

    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await bar.locator('[data-testid="initiative-edit"]').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    // Wait for async save error to be logged to console
    await expect(async () => {
      const hasDbError = consoleErrors.some(msg =>
        msg.toLowerCase().includes('failed to save') || msg.toLowerCase().includes('db')
      );
      expect(hasDbError).toBe(true);
    }).toPass({ timeout: 3000 });
  });
});
