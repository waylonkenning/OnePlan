import { test, expect } from '@playwright/test';

test.describe('Tutorial Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.evaluate(() => {
      localStorage.removeItem('scenia-e2e');
      localStorage.setItem('scenia_has_seen_landing', 'true');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible({ timeout: 30000 });
  });

  const nextSlide = (page: import('@playwright/test').Page) =>
    page.getByRole('button', { name: 'Next' }).click();

  test('Timeline slide mentions colour modes', async ({ page }) => {
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /colou?r/i })).toBeVisible();
  });

  test('Timeline slide mentions critical path', async ({ page }) => {
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /critical path/i })).toBeVisible();
  });

  test('Initiative editing slide mentions resource assignment', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Adding & Editing Initiatives' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /resource/i })).toBeVisible();
  });

  test('Data Manager slide mentions Resources tab', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Data Manager' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /resource/i })).toBeVisible();
  });

  test('Reports slide mentions capacity report', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /capacity/i })).toBeVisible();
  });

  test('Reports slide mentions mobile card view', async ({ page }) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /mobile/i })).toBeVisible();
  });
});

test.describe('Tutorial Modal', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.evaluate(async () => {
      localStorage.removeItem('scenia-e2e');
      localStorage.setItem('scenia_has_seen_landing', 'true');
      return new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('scenia-e2e');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        req.onblocked = () => resolve();
      });
    });
    await page.reload();
  });

  test('appears on first load and can be dismissed', async ({ page }) => {
    await page.goto('/');

    const modalHeading = page.getByRole('heading', { name: 'Welcome to Scenia' });
    await expect(modalHeading).toBeVisible();

    await expect(page.getByText('Scenia is a complete initiative planning tool')).toBeVisible();

    await page.getByRole('button', { name: 'Skip' }).click();

    await expect(modalHeading).toBeHidden();

    await page.reload();
    await expect(modalHeading).toBeHidden();
  });

  test('can be navigated via next and prev buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();

    await page.locator('button').filter({ has: page.locator('.lucide-chevron-left') }).click();
    
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible();
  });

  test('can be opened via help button', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeHidden();

    await page.getByRole('button', { name: 'Tutorial' }).click();

    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible();
  });
});
