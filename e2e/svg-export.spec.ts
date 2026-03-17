import { test, expect } from '@playwright/test';

test.describe('SVG Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('SVG button triggers a .svg file download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.getByTestId('export-svg').click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('it-roadmap');
    expect(download.suggestedFilename()).toContain('.svg');
  });

  test('downloaded SVG file is non-empty and starts with <svg', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-svg').click();
    const download = await downloadPromise;

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString('utf8', 0, 200);
    expect(content.trimStart()).toMatch(/^<svg/i);
  });
});
