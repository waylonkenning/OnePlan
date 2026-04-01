import { test, expect } from '@playwright/test';

/**
 * US-IE-04: Initiative Bar Content Layout
 *
 * AC1: Budget label renders as a small pill right-aligned on the title row
 * AC2: Description occupies a full-width row (not shared with budget or owner)
 * AC3: Owner avatar is absolutely positioned in the top-right corner, not inline
 * AC4: Description is capped at 2 lines with ellipsis (line-clamp-2)
 */

type Page = import('@playwright/test').Page;

async function loadDefault(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 15000 });
}

async function openDescriptions(page: Page) {
  // Enable description display so description rows are visible
  await page.getByTestId('toggle-descriptions').click();
}

async function enableBudgetLabels(page: Page) {
  // Cycle from 'off' to 'label' (first click)
  await page.getByTestId('toggle-budget').click();
}

// Use an initiative with a known budget and description from demo data
const PASSKEY_BAR = '[data-initiative-id="i-ciam-passkey"]';

test.describe('US-IE-04: Initiative bar content layout', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  // ── AC1: Budget pill on title row ────────────────────────────────────────
  test('AC1: budget pill is visible on the title row', async ({ page }) => {
    await enableBudgetLabels(page);
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    await expect(bar.getByTestId('initiative-budget-pill')).toBeVisible();
  });

  test('AC1: budget pill is right-aligned within the title row', async ({ page }) => {
    await enableBudgetLabels(page);
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    const titleRow = bar.getByTestId('initiative-title-row');
    const pill = bar.getByTestId('initiative-budget-pill');
    await expect(titleRow).toBeVisible();
    await expect(pill).toBeVisible();

    // Pill must be inside the title row
    const titleBox = await titleRow.boundingBox();
    const pillBox = await pill.boundingBox();
    expect(pillBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    // Pill right edge should be within the title row
    expect(pillBox!.x + pillBox!.width).toBeLessThanOrEqual(titleBox!.x + titleBox!.width + 4);
  });

  // ── AC2: Description on its own full-width row ───────────────────────────
  test('AC2: description row spans full bar width when descriptions enabled', async ({ page }) => {
    // First add a description via the panel
    const bar = page.locator(PASSKEY_BAR).first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('A test description for layout validation.');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await openDescriptions(page);

    const descRow = bar.getByTestId('initiative-description-row');
    await expect(descRow).toBeVisible();

    // Description row width should match the bar width (full-width)
    const barBox = await bar.boundingBox();
    const descBox = await descRow.boundingBox();
    expect(descBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    // Allow a few px of padding difference
    expect(descBox!.width).toBeGreaterThan(barBox!.width * 0.8);
  });

  test('AC2: description row is not on the same row as the budget pill', async ({ page }) => {
    await enableBudgetLabels(page);
    const bar = page.locator(PASSKEY_BAR).first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('Layout test description.');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await openDescriptions(page);

    const pill = bar.getByTestId('initiative-budget-pill');
    const descRow = bar.getByTestId('initiative-description-row');
    await expect(pill).toBeVisible();
    await expect(descRow).toBeVisible();

    const pillBox = await pill.boundingBox();
    const descBox = await descRow.boundingBox();
    // Description row must be below the pill (different vertical position)
    expect(descBox!.y).toBeGreaterThan(pillBox!.y);
  });

  // ── AC3: Owner avatar absolutely positioned in top-right ─────────────────
  test('AC3: owner avatar has position absolute', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    const avatar = bar.getByTestId('owner-badge').first();
    await expect(avatar).toBeVisible();
    const position = await avatar.evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('absolute');
  });

  test('AC3: owner avatar is pinned to the top-right of the bar', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    const avatar = bar.getByTestId('owner-badge').first();
    await expect(avatar).toBeVisible();

    const barBox = await bar.boundingBox();
    const avatarBox = await avatar.boundingBox();
    expect(avatarBox).not.toBeNull();
    expect(barBox).not.toBeNull();

    // Avatar should be near the top of the bar
    expect(avatarBox!.y - barBox!.y).toBeLessThan(16);
    // Avatar right edge should be near the bar right edge (within ~24px for padding)
    expect((barBox!.x + barBox!.width) - (avatarBox!.x + avatarBox!.width)).toBeLessThan(24);
  });

  // ── AC4: Description line-clamp-2 ────────────────────────────────────────
  test('AC4: description row has line-clamp-2 applied', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill(
      'This is a very long description that should be clamped to two lines maximum. ' +
      'It contains enough text to overflow into a third line if line clamping is not applied correctly. ' +
      'Even more text to guarantee overflow beyond two lines in the bar.'
    );
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await openDescriptions(page);

    const descRow = bar.getByTestId('initiative-description-row');
    await expect(descRow).toBeVisible();
    const overflow = await descRow.evaluate(el => getComputedStyle(el).webkitLineClamp);
    // webkitLineClamp returns '2' when line-clamp-2 is applied
    expect(overflow).toBe('2');
  });
});
