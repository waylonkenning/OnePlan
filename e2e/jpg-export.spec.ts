import { test, expect } from '@playwright/test';

test.setTimeout(90000);

test.describe('JPG Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('JPG button triggers a .jpg file download', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.getByTestId('export-jpg').click(),
    ]);

    expect(download.suggestedFilename()).toContain('it-roadmap');
    expect(download.suggestedFilename()).toContain('.jpg');
  });

  test('downloaded JPG file is non-empty and is a valid JPEG', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.getByTestId('export-jpg').click(),
    ]);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const bytes = Buffer.concat(chunks);
    // JPEG magic bytes: FF D8 FF
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xd8);
    expect(bytes[2]).toBe(0xff);
  });
});
