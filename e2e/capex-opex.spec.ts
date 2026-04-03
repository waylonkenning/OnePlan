import { test, expect } from '@playwright/test';

/**
 * US-03: Replace budget field with CapEx and OpEx split
 *
 * The single budget field is replaced by separate CapEx and OpEx fields.
 * They display stacked on timeline cards and are editable via the panel and data manager.
 */
test.describe('CapEx and OpEx split', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('initiative edit panel has CapEx and OpEx fields instead of Budget', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await expect(panel.getByLabel('CapEx ($)')).toBeVisible();
    await expect(panel.getByLabel('OpEx ($)')).toBeVisible();
    await expect(panel.getByLabel('Budget ($)')).not.toBeVisible();
  });

  test('CapEx and OpEx inputs accept whole numbers without leading zeros', async ({ page }) => {
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const capexInput = panel.getByLabel('CapEx ($)');
    await capexInput.fill('500000');
    await expect(capexInput).toHaveValue('500000');

    const opexInput = panel.getByLabel('OpEx ($)');
    await opexInput.fill('100000');
    await expect(opexInput).toHaveValue('100000');
  });

  test('timeline card shows stacked CapEx/OpEx label when budget label mode is on', async ({ page }) => {
    // Switch to label mode
    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
      await budgetToggle.click();
    }

    // Open an initiative and set capex + opex
    const bar = page.locator('[data-initiative-id="i-ciam-sso"]');
    await expect(bar).toBeVisible();
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    await panel.getByLabel('CapEx ($)').fill('600000');
    await panel.getByLabel('OpEx ($)').fill('150000');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).not.toBeVisible();

    // Card should show stacked CapEx/OpEx labels
    const capexLabel = bar.getByTestId('capex-label');
    const opexLabel  = bar.getByTestId('opex-label');
    await expect(capexLabel).toBeVisible();
    await expect(opexLabel).toBeVisible();
    await expect(capexLabel).toContainText('CapEx');
    await expect(opexLabel).toContainText('OpEx');

    // OpEx must appear BELOW CapEx (stacked vertically, not side-by-side)
    const capexBox = await capexLabel.boundingBox();
    const opexBox  = await opexLabel.boundingBox();
    expect(opexBox!.y).toBeGreaterThan(capexBox!.y);
  });

  test('data manager shows CapEx and OpEx columns instead of Budget', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    // The initiatives tab should have capex and opex columns, not budget
    await expect(page.locator('[data-testid^="real-input-capex"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-opex"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-budget"]')).toHaveCount(0);
  });
});
