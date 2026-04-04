import { test, expect, Page } from '@playwright/test';

async function openViewOptions(page: Page) {
  const popover = page.getByTestId('view-options-popover');
  if (!await popover.isVisible()) {
    await page.getByTestId('view-options-btn').click();
    await expect(popover).toBeVisible();
  }
}

test.describe('Display Mode Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('View Options popover has Show section with Both/Initiatives/Applications', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await expect(page.getByTestId('show-both')).toBeVisible();
    await expect(page.getByTestId('show-initiatives')).toBeVisible();
    await expect(page.getByTestId('show-applications')).toBeVisible();
  });

  test('default mode is Both: initiative bars and application rows visible', async ({ page }) => {
    await expect(page.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
  });

  test('Initiatives mode hides application rows', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]')).toHaveCount(0);
  });

  test('Applications mode hides initiative bars', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid^="initiative-bar"]')).toHaveCount(0);
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
  });

  test('switching back to Both restores both layers and button label reflects active mode', async ({ page }) => {
    const btn = page.getByTestId('view-options-btn');
    await btn.click();
    await page.getByTestId('show-initiatives').click();
    await expect(btn).toContainText('Initiatives');

    await page.getByTestId('show-both').click();
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid^="initiative-bar"]').first()).toBeVisible();
    await expect(page.locator('[data-testid^="application-swimlane-"]').first()).toBeVisible();
    await expect(btn).toContainText('Both');
  });
});

test.describe('Display Mode — Empty Rows interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('Applications + Empty Rows Show: assets without applications still visible', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid="asset-row-a-eiam"]')).toBeVisible();
  });

  test('Applications + Empty Rows Hide: assets without applications are hidden', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100);
    await page.getByTestId('display-more-btn').click();
    await page.locator('#emptyRowDisplay').selectOption('hide');
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid="asset-row-a-eiam"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="asset-row-a-ciam"]')).toBeVisible();
  });

  test('Both + Empty Rows Hide: assets with applications remain visible', async ({ page }) => {
    await page.getByTestId('display-more-btn').click();
    await page.locator('#emptyRowDisplay').selectOption('hide');
    await page.mouse.click(100, 100);
    await expect(page.locator('[data-testid="asset-row-a-ciam"]')).toBeVisible();
  });
});

test.describe('Inline Display Toggles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('all four display toggles are present in the header', async ({ page }) => {
    await expect(page.getByTestId('toggle-conflicts')).toBeVisible();
    await expect(page.getByTestId('toggle-relationships')).toBeVisible();
    await expect(page.getByTestId('toggle-descriptions')).toBeVisible();
    await expect(page.getByTestId('toggle-budget')).toBeVisible();
  });

  test('toggle-budget cycles through off → label → bar-height → off', async ({ page }) => {
    const toggle = page.getByTestId('toggle-budget');
    await expect(toggle).toHaveAttribute('data-mode', 'off');
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-mode', 'label');
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-mode', 'bar-height');
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-mode', 'off');
  });
});

test.describe('Description Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('can edit description in initiative panel and it persists', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('This is a test description for the initiative.');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(panel).toBeVisible();
    await expect(panel.getByLabel('Description')).toHaveValue('This is a test description for the initiative.');
  });

  test('description appears in timeline bar title attribute', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('My tooltip description');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    await expect(bar).toHaveAttribute('title', /My tooltip description/);
  });

  test('description toggle expands bar and shows text', async ({ page }) => {
    const bar = page.locator('div[data-initiative-id="i-ciam-passkey"]');
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('A long description that should cause the bar to expand vertically.');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    const initialHeight = (await bar.boundingBox())?.height || 0;
    await page.getByTestId('toggle-descriptions').click();

    await expect.poll(async () => (await bar.boundingBox())?.height || 0).toBeGreaterThan(initialHeight);
    await expect(bar).toContainText('A long description');
  });
});

test.describe('Colour by Status', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('status field is present in initiative panel with all four options', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    const statusField = panel.locator('[data-testid="initiative-status"]');
    await expect(statusField).toBeVisible();
    await expect(statusField.locator('option[value="planned"]')).toBeAttached();
    await expect(statusField.locator('option[value="active"]')).toBeAttached();
    await expect(statusField.locator('option[value="done"]')).toBeAttached();
    await expect(statusField.locator('option[value="cancelled"]')).toBeAttached();
  });

  test('status column appears in Data Manager Initiatives table', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();
    await expect(page.getByTestId('data-manager').getByRole('columnheader', { name: 'Status', exact: true })).toBeVisible();
  });

  test('status change persists after reload', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.locator('[data-testid="initiative-status"]').selectOption('active');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    await page.getByTestId('initiative-action-edit').click();
    const panel2 = page.getByTestId('initiative-panel');
    await expect(panel2).toBeVisible();
    await expect(panel2.locator('[data-testid="initiative-status"]')).toHaveValue('active');
  });

  test('By Progress mode: button available, activates, legend shows statuses and reverts', async ({ page }) => {
    await openViewOptions(page);
    const progressBtn = page.getByRole('button', { name: 'By Progress' });
    await expect(progressBtn).toBeVisible();
    await progressBtn.click();
    await expect(progressBtn).toHaveAttribute('aria-pressed', 'true');

    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Planned');
    await expect(legend).toContainText('Active');
    await expect(legend).toContainText('Done');
    await expect(legend).toContainText('Cancelled');

    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Programme' }).click();
    await expect(legend).not.toContainText('Planned');
    await expect(legend).toContainText('Programmes');
  });
});

test.describe('Collapsible Categories & Empty Rows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('can collapse and expand categories', async ({ page }) => {
    const categoryHeaderBtn = page.getByRole('button', { name: /Identity & Access Management/i });
    await expect(categoryHeaderBtn).toBeVisible();
    const asset1 = page.getByText('Customer IAM (CIAM)', { exact: true });
    const asset2 = page.getByText('Privileged Access Mgmt', { exact: true });

    await categoryHeaderBtn.click();
    await expect(asset1).not.toBeVisible();
    await expect(asset2).not.toBeVisible();

    await categoryHeaderBtn.click();
    await expect(asset1).toBeVisible();
    await expect(asset2).toBeVisible();
  });

  test('can hide and show empty rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await page.getByRole('button', { name: /Assets/i }).click();
    await page.getByRole('button', { name: 'Add Row' }).click();
    const nameInput = page.locator('table tbody tr[data-real="true"]').last().locator('input[type="text"]').first();
    await nameInput.fill('Empty Asset');
    await page.getByRole('button', { name: 'Visualiser' }).click();

    const emptyAsset = page.getByText('Empty Asset', { exact: true });
    await expect(emptyAsset).toBeVisible();

    await page.getByTestId('display-more-btn').click();
    await page.getByLabel('Empty Rows').selectOption('hide');
    await expect(emptyAsset).not.toBeVisible();

    await page.getByLabel('Empty Rows').selectOption('show');
    await expect(emptyAsset).toBeVisible();
  });
});

test.describe('Visualiser-Only Controls', () => {
  const visualiserOnlyTestIds = [
    'toggle-conflicts', 'toggle-relationships', 'toggle-descriptions', 'toggle-budget',
    'toggle-critical-path', 'toggle-resources', 'zoom-in', 'zoom-out', 'display-more-btn',
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('all visualiser-only toggles visible in Visualiser view', async ({ page }) => {
    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('visualiser-only toggles hidden in Data Manager and Reports', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();
    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeHidden();
    }

    await page.getByTestId('nav-reports').click();
    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeHidden();
    }
  });

  test('toggles reappear when switching back to Visualiser', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTestId('asset-row-content').first()).toBeVisible();
    for (const testId of visualiserOnlyTestIds) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }
  });

  test('timeline range inputs hidden in Data Manager and Reports', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('timeline-start-input')).toBeHidden();
    await expect(page.getByTestId('timeline-months-select')).toBeHidden();

    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('timeline-start-input')).toBeHidden();
    await expect(page.getByTestId('timeline-months-select')).toBeHidden();
  });
});
