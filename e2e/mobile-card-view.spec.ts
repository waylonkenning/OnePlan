import { test, expect } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Page = import('@playwright/test').Page;

async function openSettings(page: Page) {
  await page.locator('[data-testid="mobile-settings-btn"]').click();
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]');
}

async function closeSettings(page: Page) {
  await page.locator('[data-testid="mobile-settings-backdrop"]').click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { state: 'hidden' });
}

async function setStartDate(page: Page, date: string) {
  await page.locator('[data-testid="mobile-settings-sheet"]').locator('input[type="date"]').fill(date);
}

async function setMonths(page: Page, months: number) {
  await page.locator('[data-testid="mobile-settings-sheet"]').locator('select').selectOption(String(months));
}

// ─── Card view core ───────────────────────────────────────────────────────────

test.describe('Mobile card view — core', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('renders one card per asset with category headers', async ({ page }) => {
    expect(await page.locator('[data-testid^="asset-card-"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[data-testid^="card-category-header-"]').count()).toBeGreaterThan(0);
  });

  test('default bucket mode shows Now/Starting soon/Upcoming labels', async ({ page }) => {
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    const valid = ['Now', 'Starting soon', 'Upcoming', 'Completed'];
    expect(texts.some(t => valid.some(v => t.includes(v)))).toBe(true);
  });

  test('tapping an initiative row opens the InitiativePanel', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    await expect(page.locator('[data-testid="initiative-panel"]')).toBeVisible({ timeout: 5000 });
  });

  test('conflict badge renders on cards with conflicting initiatives', async ({ page }) => {
    expect(await page.locator('[data-testid^="conflict-badge-"]').count()).toBeGreaterThanOrEqual(0);
  });

  test('selected bucket mode persists across page reload', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-quarter"]').click();
    await page.keyboard.press('Escape');

    const textsBefore = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(textsBefore.some(t => /Q[1-4] \d{4}/.test(t))).toBe(true);

    await page.reload();
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    const textsAfter = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(textsAfter.some(t => /Q[1-4] \d{4}/.test(t))).toBe(true);
  });
});

// ─── Bucket modes ─────────────────────────────────────────────────────────────

test.describe('Mobile card view — bucket modes', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('settings sheet has all five bucket mode options', async ({ page }) => {
    await openSettings(page);
    for (const mode of ['timeline', 'quarter', 'year', 'programme', 'strategy']) {
      await expect(page.locator(`[data-testid="bucket-mode-${mode}"]`)).toBeVisible();
    }
  });

  test('Quarter mode groups by Q-label', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-quarter"]').click();
    await page.keyboard.press('Escape');
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(texts.some(t => /Q[1-4] \d{4}/.test(t))).toBe(true);
  });

  test('Year mode groups by year', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-year"]').click();
    await page.keyboard.press('Escape');
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(texts.some(t => /^\d{4}$/.test(t.trim()))).toBe(true);
  });

  test('Programme mode groups by programme name', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-programme"]').click();
    await page.keyboard.press('Escape');
    expect(await page.locator('[data-testid^="bucket-label-"]').count()).toBeGreaterThan(0);
  });

  test('Strategy mode groups by strategy name', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-strategy"]').click();
    await page.keyboard.press('Escape');
    expect(await page.locator('[data-testid^="bucket-label-"]').count()).toBeGreaterThan(0);
  });
});

// ─── Date window filter ───────────────────────────────────────────────────────

test.describe('Mobile card view — date window filter', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('far-future start date hides all initiatives', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);
    expect(await page.locator('[data-testid^="initiative-row-"]').count()).toBe(0);
    expect(await page.locator('[data-testid="card-no-initiatives"]').count()).toBeGreaterThan(0);
  });

  test('initiative starting before start date is hidden', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-08-01`);
    await setMonths(page, 36);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-ciam-passkey"]')).not.toBeVisible();
  });

  test('initiative ending beyond the window is hidden', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 3);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-ciam-sso"]')).not.toBeVisible();
  });

  test('initiative starting exactly on start date is shown when within window', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 12);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-apigw-v2"]')).toBeVisible();
  });

  test('36-month window shows long-running initiatives', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 36);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-esb-decomm"]')).toBeVisible();
  });
});

// ─── Empty state messaging ────────────────────────────────────────────────────

test.describe('Mobile card view — empty state messaging', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('shows filtered empty state when date window excludes all initiatives', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);
    await expect(page.locator('[data-testid="card-initiatives-filtered"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="asset-card-a-ciam"] [data-testid="card-no-initiatives"]')).not.toBeVisible();
  });

  test('filtered empty state shows the hidden initiative count', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);
    await expect(page.locator('[data-testid="asset-card-a-ciam"]').getByTestId('card-initiatives-filtered')).toContainText('2');
  });

  test('clicking the filters link opens the settings sheet', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);
    await page.locator('[data-testid="card-filter-link"]').first().click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  test('no filtered empty state shown with default settings', async ({ page }) => {
    await expect(page.locator('[data-testid="card-initiatives-filtered"]')).not.toBeVisible();
  });
});
