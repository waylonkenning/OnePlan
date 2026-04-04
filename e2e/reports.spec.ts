import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openInitiativePanel(page: Page) {
  await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 5000 });
  const bar = page.locator('[data-testid^="initiative-bar"]').first();
  await bar.click();
  await page.getByTestId('initiative-action-edit').click();
  await expect(page.getByTestId('initiative-panel')).toBeVisible();
}

async function openViewOptions(page: Page) {
  const popover = page.getByTestId('view-options-popover');
  if (!await popover.isVisible()) {
    await page.getByTestId('view-options-btn').click();
    await expect(popover).toBeVisible();
  }
}

test.describe('Reports mode', () => {
  test('Reports nav button is present in the header', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await expect(page.getByTestId('nav-reports')).toBeVisible();
  });

  test('clicking Reports switches to the Reports view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('nav-reports').click();

    await expect(page.getByTestId('reports-view')).toBeVisible();
  });

  test('Reports nav button is highlighted when active', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const navBtn = page.getByTestId('nav-reports');
    await navBtn.click();

    await expect(navBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('switching away from Reports and back retains the Reports view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('reports-view')).toBeVisible();

    await page.getByTestId('nav-visualiser').click();
    await expect(page.getByTestId('reports-view')).not.toBeVisible();

    await page.getByTestId('nav-reports').click();
    await expect(page.getByTestId('reports-view')).toBeVisible();
  });
});

test.describe('Reports Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-reports').click();
  });

  test('shows a home screen with 4 report cards', async ({ page }) => {
    await expect(page.getByTestId('reports-view')).toBeVisible();
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-card-version-history')).toBeVisible();
    await expect(page.getByTestId('report-card-budget')).toBeVisible();
    await expect(page.getByTestId('report-card-initiatives-dependencies')).toBeVisible();
    await expect(page.getByTestId('report-card-capacity')).toBeVisible();
  });

  test('home screen does not show any report view directly', async ({ page }) => {
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-version-history')).not.toBeVisible();
    await expect(page.getByTestId('report-view-budget')).not.toBeVisible();
    await expect(page.getByTestId('report-view-initiatives-dependencies')).not.toBeVisible();
    await expect(page.getByTestId('report-view-capacity')).not.toBeVisible();
  });

  test('clicking Version History card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-version-history').click();
    await expect(page.getByTestId('report-view-version-history')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('clicking Budget Report card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('report-view-budget')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('clicking Initiatives & Dependencies card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-initiatives-dependencies').click();
    await expect(page.getByTestId('report-view-initiatives-dependencies')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('clicking Capacity & Resources card opens that report', async ({ page }) => {
    await page.getByTestId('report-card-capacity').click();
    await expect(page.getByTestId('report-view-capacity')).toBeVisible();
    await expect(page.getByTestId('reports-home')).not.toBeVisible();
  });

  test('back button returns to home screen', async ({ page }) => {
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('report-view-budget')).toBeVisible();

    await page.getByTestId('report-back-btn').click();
    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-budget')).not.toBeVisible();
  });

  test('navigating away from Reports and back resets to home screen', async ({ page }) => {
    await page.getByTestId('report-card-budget').click();
    await expect(page.getByTestId('report-view-budget')).toBeVisible();

    await page.getByTestId('nav-visualiser').click();
    await page.getByTestId('nav-reports').click();

    await expect(page.getByTestId('reports-home')).toBeVisible();
    await expect(page.getByTestId('report-view-budget')).not.toBeVisible();
  });
});

test.describe('History Differences report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('Reports view shows History Differences section', async ({ page }) => {
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();
    await expect(page.getByTestId('report-history-diff')).toBeVisible();
  });

  test('shows empty state when no versions are saved', async ({ page }) => {
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();
    const section = page.getByTestId('report-history-diff');
    await expect(section).toBeVisible();
    await expect(section).toContainText('No saved versions');
  });

  test('shows version selector after saving a version', async ({ page }) => {
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Test Snapshot');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();
    const section = page.getByTestId('report-history-diff');
    await expect(section).toBeVisible();

    await expect(section.getByTestId('version-select')).toBeVisible();
    await expect(section).toContainText('Test Snapshot');
  });

  test('running the diff report shows results inline', async ({ page }) => {
    await page.getByTestId('nav-history').click();
    await page.getByRole('button', { name: 'Save Current State' }).click();
    await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Baseline Snapshot');
    await page.getByRole('button', { name: 'Save Version' }).click();
    await page.getByTestId('close-version-manager').click();

    const passkeyBar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await passkeyBar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
    const nameInput = panel.getByLabel('Initiative Name');
    await expect(nameInput).toHaveValue('Passkey Rollout', { timeout: 3000 });
    await nameInput.fill('Passkey Rollout MODIFIED');
    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();
    const section = page.getByTestId('report-history-diff');
    await section.getByTestId('version-select').selectOption({ label: 'Baseline Snapshot' });
    await section.getByRole('button', { name: 'Run Difference Report' }).click();

    const diffResult = section.getByTestId('diff-result');
    await expect(diffResult).toBeVisible({ timeout: 5000 });
    await expect(diffResult).toContainText('MODIFIED');
  });
});

test.describe('ReportsView — versions load error handling', () => {
  test('shows an error message when versions cannot be loaded from IndexedDB', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('scenia-test-versions-fail', 'true');
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();

    const histDiff = page.getByTestId('report-history-diff');
    await expect(histDiff.getByTestId('versions-load-error')).toBeVisible({ timeout: 5000 });
  });

  test('normal operation shows no error when versions load successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-version-history').click();

    const histDiff = page.getByTestId('report-history-diff');
    await expect(histDiff.getByTestId('versions-load-error')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('RAG Status field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('ragStatus field appears in InitiativePanel', async ({ page }) => {
    await openInitiativePanel(page);
    await expect(page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]')).toBeVisible();
  });

  test('ragStatus field has green / amber / red options', async ({ page }) => {
    await openInitiativePanel(page);
    const field = page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]');
    await expect(field.locator('option[value="green"]')).toBeAttached();
    await expect(field.locator('option[value="amber"]')).toBeAttached();
    await expect(field.locator('option[value="red"]')).toBeAttached();
  });

  test('ragStatus field appears in Data Manager Initiatives table', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager').getByRole('button', { name: /Initiatives/ }).click();
    await expect(
      page.getByTestId('data-manager').locator('th').filter({ hasText: /RAG/i })
    ).toBeVisible();
  });

  test.skip('setting ragStatus in InitiativePanel persists after reload', async ({ page }) => {
    await openInitiativePanel(page);
    const field = page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]');
    await field.selectOption('red');
    await page.getByTestId('initiative-panel').getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByTestId('initiative-panel')).toBeHidden();

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await openInitiativePanel(page);
    await expect(
      page.getByTestId('initiative-panel').locator('[data-testid="initiative-rag-status"]')
    ).toHaveValue('red');
  });
});

test.describe('By Status colour mode (RAG)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('"By Status" button is available in the View Options popover', async ({ page }) => {
    await openViewOptions(page);
    await expect(page.getByRole('button', { name: 'By Status' })).toBeVisible();
  });

  test('clicking "By Status" activates the mode', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    const btn = page.getByRole('button', { name: 'By Status' });
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('legend shows Green, Amber, Red entries when "By Status" is active', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Green');
    await expect(legend).toContainText('Amber');
    await expect(legend).toContainText('Red');
  });

  test('legend reverts to programmes when "By Programme" is re-selected', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Programme' }).click();
    const legend = page.getByTestId('colour-legend');
    await expect(legend).not.toContainText('Amber');
    await expect(legend).toContainText('Programmes');
  });

  test.skip('"By Status" mode persists across page reload', async ({ page }) => {
    await openViewOptions(page);
    await page.getByRole('button', { name: 'By Status' }).click();
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    const legend = page.getByTestId('colour-legend');
    await expect(legend).toContainText('Green');
    await expect(legend).toContainText('Amber');
    await expect(legend).toContainText('Red');
  });
});
