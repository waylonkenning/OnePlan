import { test, expect } from '@playwright/test';

test.describe('Budget Reports (Summary & Breakdown)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await page.getByRole('button', { name: 'Reports' }).click();
    await page.waitForSelector('[data-testid="reports-view"]', { timeout: 10000 });
    await page.getByTestId('report-card-budget').click();
  });

  test('budget summary and breakdowns are visible', async ({ page }) => {
    await expect(page.getByTestId('report-budget-summary')).toBeVisible();
    await expect(page.getByTestId('budget-by-programme')).toBeVisible();
    await expect(page.getByTestId('budget-by-strategy')).toBeVisible();
    await expect(page.getByTestId('budget-by-category')).toBeVisible();
  });

  test('grand total matches sum of all initiative budgets', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await page.waitForSelector('[data-testid^="real-input-capex"]', { timeout: 10000 });

    const capexInputs = page.locator('[data-testid^="real-input-capex"]');
    const opexInputs = page.locator('[data-testid^="real-input-opex"]');
    const count = await capexInputs.count();
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += (parseFloat(await capexInputs.nth(i).inputValue()) || 0)
             + (parseFloat(await opexInputs.nth(i).inputValue()) || 0);
    }

    await page.getByRole('button', { name: 'Reports' }).click();
    await page.getByTestId('report-card-budget').click();
    await page.waitForSelector('[data-testid="report-budget-summary"]', { timeout: 10000 });

    const totalEl = page.getByTestId('budget-grand-total');
    await expect(totalEl).toBeVisible();
    expect(total).toBeGreaterThan(0);
    expect(await totalEl.textContent()).toBeTruthy();
  });
});

test.describe('Budget Visualisation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('can toggle budget visualisation to bar-height', async ({ page }) => {
    const initiativeBar = page.locator('div[data-initiative-id="i-ciam-sso"]');
    await expect(initiativeBar).toBeVisible();
    const initialHeight = (await initiativeBar.boundingBox())?.height || 0;

    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'bar-height') {
      await budgetToggle.click();
    }

    await expect.poll(async () => {
      return (await initiativeBar.boundingBox())?.height || 0;
    }).toBeGreaterThan(initialHeight);
  });

  test('can toggle budget visualisation to label showing CapEx/OpEx', async ({ page }) => {
    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
      await budgetToggle.click();
    }

    const bar = page.locator('div[data-initiative-id="i-ciam-sso"]');
    await expect(bar).toBeVisible();
    await expect(bar).toContainText('CapEx $600k');
  });
});

test.describe('CapEx / OpEx Fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('initiative edit panel has CapEx and OpEx fields instead of Budget', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await expect(panel.getByLabel('CapEx ($)')).toBeVisible();
    await expect(panel.getByLabel('OpEx ($)')).toBeVisible();
    await expect(panel.getByLabel('Budget ($)')).not.toBeVisible();
  });

  test('timeline card shows stacked CapEx and OpEx labels', async ({ page }) => {
    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
      await budgetToggle.click();
    }

    const bar = page.locator('[data-initiative-id="i-ciam-sso"]');
    await bar.dblclick();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('CapEx ($)').fill('600000');
    await panel.getByLabel('OpEx ($)').fill('150000');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).not.toBeVisible();

    const capexLabel = bar.getByTestId('capex-label');
    const opexLabel  = bar.getByTestId('opex-label');
    await expect(capexLabel).toBeVisible();
    await expect(opexLabel).toBeVisible();

    const capexBox = await capexLabel.boundingBox();
    const opexBox  = await opexLabel.boundingBox();
    expect(opexBox!.y).toBeGreaterThan(capexBox!.y);
  });

  test('data manager shows CapEx and OpEx columns, not Budget', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-capex"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-opex"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="real-input-budget"]')).toHaveCount(0);
  });

  test('grouped initiative bar shows summed CapEx with dark font', async ({ page }) => {
    const budgetToggle = page.getByTestId('toggle-budget');
    while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
      await budgetToggle.click();
    }

    const targetRow = page.locator('[data-asset-id="a-ciam"]');
    await expect(targetRow).toContainText('CapEx $350k');
    await expect(targetRow).toContainText('CapEx $600k');

    const groupBox = targetRow.getByTestId('initiative-group-box');
    await targetRow.hover();
    await groupBox.getByTestId('collapse-group-btn').click();

    const groupBar = page.getByTestId('project-group-bar');
    await expect(groupBar).toBeVisible();
    await expect(groupBar).toContainText('CapEx $950k');

    const color = await groupBar.getByTestId('capex-label').last().evaluate(
      el => getComputedStyle(el).color
    );
    if (color.startsWith('oklch')) {
      expect(color).toBe('oklch(0.379 0.146 265.522)');
    } else {
      expect(color).toBe('rgb(30, 58, 138)');
    }
  });
});
