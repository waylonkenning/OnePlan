import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Data Controls (Export/Import)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Export PDF opens print dialog', async ({ page }) => {
    // Mock window.print so the dialog doesn't block headless Playwright
    await page.evaluate(() => {
      (window as any).__printCalled = false;
      window.print = () => { (window as any).__printCalled = true; };
    });

    await page.getByRole('button', { name: 'PDF' }).click();

    const printCalled = await page.evaluate(() => (window as any).__printCalled);
    expect(printCalled).toBe(true);
  });

  test('Export Excel triggers download', async ({ page }) => {
    // Wait for the download event
    const downloadPromise = page.waitForEvent('download');

    // Click Export Excel
    await page.getByRole('button', { name: 'Export' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('it-roadmap');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('Import Excel handles file upload', async ({ page }) => {
    // Note: To fully test this, we would need a valid mock .xlsx file in the test directory.
    // For now, we verify the file chooser is triggered and we can set a file.

    // We can intercept the file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();

    const fileChooser = await fileChooserPromise;
    expect(fileChooser.isMultiple()).toBe(false);

    // In a real test, you'd do:
    // await fileChooser.setFiles(path.join(__dirname, 'mock-data.xlsx'));
    // And then assert on the page's reaction (e.g. an alert or updated data)
  });
});
