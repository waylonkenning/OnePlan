import { test, expect } from '@playwright/test';

async function setupTutorial(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  await page.evaluate(async () => {
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('scenia-e2e');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
  await page.reload();
}

const next = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Next' }).click();

test.describe('Tutorial Modal', () => {
  test.beforeEach(async ({ page }) => {
    await setupTutorial(page);
  });

  test('appears on first load and persists dismissed state after reload', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Welcome to Scenia' });
    await expect(heading).toBeVisible();
    await expect(page.getByText('Scenia is a complete initiative planning tool')).toBeVisible();

    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(heading).toBeHidden();

    await page.reload();
    await expect(heading).toBeHidden();
  });

  test('can be navigated forward and backward', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible();

    await next(page);
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();

    await page.locator('button').filter({ has: page.locator('.lucide-chevron-left') }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible();
  });

  test('can be reopened via Tutorial button', async ({ page }) => {
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeHidden();

    await page.getByRole('button', { name: 'Tutorial' }).click();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible();
  });
});

test.describe('Tutorial Content', () => {
  test.beforeEach(async ({ page }) => {
    // Use the simpler content-spec setup (no IndexedDB deletion needed)
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await page.evaluate(() => {
      localStorage.removeItem('scenia-e2e');
      localStorage.setItem('scenia_has_seen_landing', 'true');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Welcome to Scenia' })).toBeVisible({ timeout: 30000 });
  });

  test('Timeline slide mentions colour modes and critical path', async ({ page }) => {
    await next(page);
    await expect(page.getByRole('heading', { name: 'The Timeline' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /colou?r/i })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /critical path/i })).toBeVisible();
  });

  test('Initiative editing slide mentions resource assignment', async ({ page }) => {
    await next(page);
    await next(page);
    await expect(page.getByRole('heading', { name: 'Adding & Editing Initiatives' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /resource/i })).toBeVisible();
  });

  test('Data Manager slide mentions Resources tab', async ({ page }) => {
    await next(page);
    await next(page);
    await next(page);
    await expect(page.getByRole('heading', { name: 'Data Manager' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /resource/i })).toBeVisible();
  });

  test('Reports slide mentions capacity report and mobile card view', async ({ page }) => {
    for (let i = 0; i < 4; i++) await next(page);
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /capacity/i })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /mobile/i })).toBeVisible();
  });
});
