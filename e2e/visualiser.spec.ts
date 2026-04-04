import { test, expect } from '@playwright/test';

test.describe('Visualiser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('colour mode toggle — switching to By Strategy updates the legend', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    const byProgBtn = page.getByRole('button', { name: 'By Programme' });
    const byStratBtn = page.getByRole('button', { name: 'By Strategy' });
    await expect(byProgBtn).toHaveAttribute('aria-pressed', 'true');

    await byStratBtn.click();
    await expect(byStratBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Strategies').first()).toBeVisible();
    await expect(page.getByText('Customer First').first()).toBeVisible();
  });

  test('conflict markers appear for overlapping initiatives on the same asset', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'id,name,assetId,startDate,endDate,budget\nconf-1,Conflict A,a-ciam,2026-04-01,2026-12-31,100\nconf-2,Conflict B,a-ciam,2026-04-01,2026-12-31,100'
    );
    await expect(page.getByRole('button', { name: 'Import Rows' })).toBeEnabled();
    await page.getByRole('button', { name: 'Import Rows' }).click();

    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');
    await expect(page.locator('[data-testid="conflict-marker"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('conflict markers are behind sticky asset labels (z-index layering)', async ({ page }) => {
    await page.getByRole('button', { name: 'Data Manager' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'id,name,assetId,startDate,endDate,budget\nconf-1,Conflict A,a-ciam,2026-04-01,2026-12-31,100\nconf-2,Conflict B,a-ciam,2026-04-01,2026-12-31,100'
    );
    await page.getByRole('button', { name: 'Import Rows' }).click();
    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');

    const markerContainer = page.locator('div.z-0:has-text("Conflict Detected")').first();
    await expect(markerContainer).toBeVisible({ timeout: 10000 });
    const markerZ = await markerContainer.evaluate(el => window.getComputedStyle(el).zIndex);
    const stickyLabel = page.locator('div.sticky.left-0.z-30').first();
    await expect(stickyLabel).toBeVisible();
    const labelZ = await stickyLabel.evaluate(el => window.getComputedStyle(el).zIndex);
    expect(parseInt(markerZ)).toBeLessThan(parseInt(labelZ));
  });

  test('timeline renders correctly when an initiative has an invalid date', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await page.getByRole('button', { name: 'Paste CSV' }).click();
    await page.getByTestId('csv-paste-textarea').fill(
      'id,name,assetId,startDate,endDate,budget\ngood-1,Good Initiative,a-ciam,2026-01-01,2026-06-30,0\nbad-1,Bad Date Initiative,a-ciam,2026-01-01,,0'
    );
    await page.getByRole('button', { name: 'Import Rows' }).click();

    await page.getByTestId('nav-visualiser').click();
    await page.waitForSelector('#timeline-visualiser');
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.locator('[data-testid="timeline-col-0"]')).toBeVisible();
  });

  test('milestones render in the timeline', async ({ page }) => {
    await expect(page.locator('[data-testid="milestone-dep-handle"]').first()).toBeVisible();
  });

  test('initiative resizing persists after reload', async ({ page }) => {
    await page.waitForSelector('#timeline-visualiser');
    const initiative = page.locator('div[title*="Passkey Rollout"]').first();
    const initialBox = await initiative.boundingBox();
    if (!initialBox) throw new Error('Could not find bounding box');

    const rightHandle = initiative.locator('.cursor-ew-resize').nth(1);
    await rightHandle.hover();
    const handleBox = await rightHandle.boundingBox();
    if (!handleBox) throw new Error('Could not find handle box');

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2, { steps: 25 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const newBox = await initiative.boundingBox();
    expect(newBox!.width).toBeGreaterThan(initialBox.width + 50);

    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForSelector('[data-testid="asset-row-content"]');
    const persistedBox = await page.locator('div[title*="Passkey Rollout"]').first().boundingBox();
    expect(persistedBox!.width).toBeGreaterThan(initialBox.width + 50);
  });
});
