import { test, expect } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Page = import('@playwright/test').Page;

async function waitForTimeline(page: Page) {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser', { timeout: 15000 });
}

async function search(page: Page, term: string) {
  await page.getByTestId('search-input').fill(term);
}

async function clearSearch(page: Page) {
  await page.getByTestId('search-input').clear();
}

// ─── Timeline filtering ───────────────────────────────────────────────────────

test.describe('Search — timeline filtering', () => {
  test.beforeEach(async ({ page }) => {
    await waitForTimeline(page);
  });

  test('matching name filters the timeline, non-matching initiative is hidden', async ({ page }) => {
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();

    await search(page, 'SSO');

    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();
  });

  test('search is case-insensitive', async ({ page }) => {
    await search(page, 'sso');
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();
  });

  test('description text match surfaces the initiative', async ({ page }) => {
    // "Passkey Rollout" description contains "FIDO2"
    await search(page, 'FIDO2');
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeHidden();
  });

  test('asset name match surfaces all initiatives for that asset', async ({ page }) => {
    // "Customer IAM (CIAM)" is the asset name — several initiatives are linked to it
    await search(page, 'Customer IAM');
    const bars = page.locator('[data-testid^="initiative-bar-i-ciam-"]');
    await expect(bars.first()).toBeVisible();
    // An initiative from a different asset should be hidden
    await expect(page.getByText('API Gateway v2', { exact: true })).toBeHidden();
  });

  test('programme name match surfaces initiatives in that programme', async ({ page }) => {
    await search(page, 'Cloud Migration');
    // Cloud Migration initiatives should be visible
    expect(await page.locator('[data-testid^="initiative-bar-"]').count()).toBeGreaterThan(0);
    // Initiatives from unrelated programmes should be hidden
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();
  });

  test('no-match search hides all initiatives', async ({ page }) => {
    await search(page, 'xyzzy-no-match-query');
    await expect(page.locator('[data-testid^="initiative-bar-"]').first()).not.toBeVisible();
  });

  test('clearing search restores all initiatives', async ({ page }) => {
    await search(page, 'SSO');
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeHidden();

    await clearSearch(page);
    await expect(page.getByText('Passkey Rollout', { exact: true })).toBeVisible();
    await expect(page.getByText('SSO Consolidation', { exact: true })).toBeVisible();
  });
});

// ─── Data Manager filtering ───────────────────────────────────────────────────

test.describe('Search — Data Manager filtering', () => {
  test.beforeEach(async ({ page }) => {
    await waitForTimeline(page);
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
  });

  test('name search filters the initiatives table', async ({ page }) => {
    await search(page, 'SSO');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2); // 1 real + 1 ghost
    await expect(rows.first().locator('input[type="text"]').first()).toHaveValue('SSO Consolidation');
  });

  test('no-match search leaves only the ghost row', async ({ page }) => {
    await search(page, 'xyzzy-no-match-query');
    await expect(page.locator('tbody tr[data-real="true"]')).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(1); // only ghost row
  });

  test('search persists when switching between Data Manager tabs', async ({ page }) => {
    await search(page, 'SSO');
    // Filtered on Initiatives tab
    await expect(page.locator('tbody tr')).toHaveCount(2);

    // Switch to Assets tab — search still active, filters assets
    await page.getByTestId('data-manager-tab-assets').click();
    // "SSO" won't match any assets so ghost row only (or ≥1 — just verify filter is applied)
    const assetCount = await page.locator('tbody tr[data-real="true"]').count();
    expect(assetCount).toBeLessThan(16); // fewer than the full 16 assets

    // Switch back to Initiatives tab — filter is still applied
    await page.getByTestId('data-manager-tab-initiatives').click();
    await expect(page.locator('tbody tr')).toHaveCount(2);
  });

  test('clearing search restores all rows', async ({ page }) => {
    await search(page, 'SSO');
    await expect(page.locator('tbody tr')).toHaveCount(2);

    await clearSearch(page);
    // 48 default initiatives + 1 ghost
    await expect(page.locator('tbody tr')).toHaveCount(49);
  });

  test('case-insensitive match in Data Manager', async ({ page }) => {
    await search(page, 'sso');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);
    await expect(rows.first().locator('input[type="text"]').first()).toHaveValue('SSO Consolidation');
  });
});
