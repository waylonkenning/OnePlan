import { test, expect } from '@playwright/test';

async function clearDB(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) { if (db.name) window.indexedDB.deleteDatabase(db.name); }
  });
}

test.describe('Timeline Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDB(page);
    await page.reload();
  });

  test('double-clicking empty row opens creation panel pre-filled with date', async ({ page }) => {
    const firstRowContent = page.locator('.group.relative').first().locator('[data-testid="asset-row-content"]');
    await expect(firstRowContent).toBeVisible();
    await firstRowContent.dblclick({ position: { x: 300, y: 20 } });

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('h2')).toContainText('Initiative');

    const nameInput = panel.locator('input[type="text"]').first();
    await expect(nameInput).toHaveValue('');
    expect(await panel.locator('input[type="date"]').first().inputValue()).not.toBe('');
    expect(await panel.locator('input[type="date"]').nth(1).inputValue()).not.toBe('');

    await nameInput.fill('Timeline Click Built Initiative');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();
    await expect(page.locator('div[title*="Timeline Click Built Initiative"]')).toBeVisible();
  });
});

test.describe('Timeline Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDB(page);
    await page.goto('/');
  });

  test('can configure start date and duration; settings persist after reload', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    const startYearInput = page.getByLabel('Start');
    const monthsSelect = page.getByLabel('Months');

    await expect(startYearInput).toHaveValue('2026-01-01');
    await expect(monthsSelect).toHaveValue('36');
    await expect(page.getByTestId('timeline-col-0')).toBeVisible();
    await expect(page.getByTestId('timeline-col-11')).toBeVisible();

    await startYearInput.fill('2024-01-01');
    await startYearInput.press('Enter');
    await expect(page.getByTestId('timeline-col-0')).toContainText('2024');

    await monthsSelect.selectOption('12');
    await expect(page.getByTestId('timeline-col-0')).toContainText('Jan');

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByLabel('Months')).toHaveValue('12');
    await expect(page.getByLabel('Start')).toHaveValue('2024-01-01');
  });

  test('start date persists; weekly columns snap to Monday', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    const startInput = page.getByLabel('Start');

    await startInput.fill('2025-06-15');
    await startInput.press('Enter');
    await page.getByLabel('Months').selectOption('3');
    await expect(page.getByTestId('timeline-col-0')).toContainText('09 Jun');

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await expect(page.getByLabel('Start')).toHaveValue('2025-06-15');
  });

  test('timeline dynamically extends columns to fit out-of-bounds initiatives', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    await page.getByLabel('Months').selectOption('3');
    await expect(page.getByTestId('timeline-col-20')).toBeVisible();

    await page.getByRole('button', { name: 'Data Manager' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();
    await page.getByRole('button', { name: 'Milestones' }).click();
    await page.getByRole('button', { name: 'Delete all rows for this table' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');
    await expect(page.getByTestId('timeline-col-12')).toBeVisible();
    await expect(page.getByTestId('timeline-col-20')).not.toBeVisible();
  });
});

test.describe('Timeline Weekly Columns Start on Monday', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDB(page);
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser', { timeout: 10000 });
  });

  test('first weekly column shows Monday 29 Dec when start date is Thursday 1 Jan 2026', async ({ page }) => {
    await page.getByLabel('Start').fill('2026-01-01');
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(300);
    await expect(page.getByTestId('timeline-col-0')).toContainText('29 Dec');
  });

  test('first weekly column date is always a Monday (Wednesday start date)', async ({ page }) => {
    await page.getByLabel('Start').fill('2026-03-04');
    await page.getByLabel('Months').selectOption('3');
    await page.waitForTimeout(300);
    await expect(page.getByTestId('timeline-col-0')).toContainText('02 Mar');
  });
});

test.describe('Snap to Month', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('snaps start date to start of month when snap is on', async ({ page }) => {
    const bar = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await expect(bar).toBeVisible();

    await page.getByTestId('display-more-btn').click();
    await page.getByLabel('Snap to Month').selectOption('off');

    const box1 = await bar.boundingBox();
    await bar.hover();
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.move(box1!.x + box1!.width / 2 + 100, box1!.y + box1!.height / 2, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const box2 = await bar.boundingBox();
    expect(box2!.x).toBeGreaterThan(box1!.x);

    await page.getByTestId('display-more-btn').click();
    await page.getByLabel('Snap to Month').selectOption('month');

    await bar.hover();
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.move(box2!.x + box2!.width / 2 + 150, box2!.y + box2!.height / 2, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const startVal = await page.getByLabel('Start Date').inputValue();
    expect(startVal.endsWith('-01')).toBeTruthy();
  });
});

test.describe('Today Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('today indicator is visible and has Today label when in range', async ({ page }) => {
    const indicator = page.getByTestId('today-indicator');
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText('Today');
  });

  test('indicator is not rendered when today is before the timeline start', async ({ page }) => {
    const futureStart = new Date();
    futureStart.setFullYear(futureStart.getFullYear() + 5);
    await page.getByLabel('Start').fill(futureStart.toISOString().slice(0, 10));
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeHidden();
  });

  test('indicator reappears when timeline start is moved back to include today', async ({ page }) => {
    const futureStart = new Date();
    futureStart.setFullYear(futureStart.getFullYear() + 5);
    await page.getByLabel('Start').fill(futureStart.toISOString().slice(0, 10));
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeHidden();

    const pastStart = new Date();
    pastStart.setFullYear(pastStart.getFullYear() - 1);
    await page.getByLabel('Start').fill(pastStart.toISOString().slice(0, 10));
    await page.getByLabel('Start').press('Tab');
    await expect(page.getByTestId('today-indicator')).toBeVisible();
  });
});

test.describe('Zoom Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('zoom in widens and zoom out narrows timeline columns', async ({ page }) => {
    const getWidth = () => page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    const initialWidth = await getWidth();

    await page.getByTestId('zoom-in').click();
    const zoomedInWidth = await getWidth();
    expect(zoomedInWidth).toBeGreaterThan(initialWidth);

    await page.getByTestId('zoom-out').click();
    const zoomedOutWidth = await getWidth();
    expect(zoomedOutWidth).toBeLessThan(zoomedInWidth);
  });

  test('zoom level persists across page reloads', async ({ page }) => {
    const getWidth = () => page.locator('#timeline-visualiser .overflow-auto > div').first().evaluate(el => el.scrollWidth);
    await page.getByTestId('zoom-in').click();
    await page.getByTestId('zoom-in').click();
    const widthBefore = await getWidth();

    await page.reload();
    await expect(page.locator('#timeline-visualiser')).toBeVisible();
    expect(await getWidth()).toBeCloseTo(widthBefore, -1);
  });

  test('zoom-out disabled at minimum; zoom-in disabled at maximum', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      const btn = page.getByTestId('zoom-out');
      if (await btn.getAttribute('disabled') !== null) break;
      await btn.click();
    }
    await expect(page.getByTestId('zoom-out')).toBeDisabled();

    for (let i = 0; i < 10; i++) {
      const btn = page.getByTestId('zoom-in');
      if (await btn.getAttribute('disabled') !== null) break;
      await btn.click();
    }
    await expect(page.getByTestId('zoom-in')).toBeDisabled();
  });
});

test.describe('Floating Legend', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('legend is present, anchored to bottom-right of visualiser', async ({ page }) => {
    const visualiser = page.locator('#timeline-visualiser');
    const legend = visualiser.locator('[data-testid="timeline-legend"]');
    await expect(legend).toBeVisible();

    const visBox = await visualiser.boundingBox();
    const legBox = await legend.boundingBox();
    expect(visBox!.x + visBox!.width - (legBox!.x + legBox!.width)).toBeLessThan(40);
    expect(visBox!.y + visBox!.height - (legBox!.y + legBox!.height)).toBeLessThan(40);
  });

  test('toggle button collapses and expands the legend; state persists after reload', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="legend-toggle"]');
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();

    await toggleBtn.click();
    await expect(content).not.toBeVisible();
    await toggleBtn.click();
    await expect(content).toBeVisible();

    await toggleBtn.click();
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="legend-content"]')).not.toBeVisible();
  });

  test('legend contains programme swatches, milestone icons, dependency key, conflict indicator, and timestamp', async ({ page }) => {
    const content = page.locator('[data-testid="legend-content"]');
    await expect(content).toBeVisible();
    await expect(content.locator('[data-testid="legend-colour-swatches"]')).toBeVisible();
    await expect(content.locator('[data-testid="legend-milestones"]')).toBeVisible();
    await expect(content.locator('[data-testid="legend-dependencies"]')).toBeVisible();
    await expect(content.locator('[data-testid="legend-conflict"]')).toBeVisible();

    const timestamp = page.locator('[data-testid="legend-timestamp"]');
    await expect(timestamp).toBeVisible();
    const text = await timestamp.textContent();
    expect(text).toMatch(/\d{4}/);
    expect(text).toContain(':');
  });

  test('legend appears behind initiative panel (lower z-index)', async ({ page }) => {
    await page.locator('[data-testid^="initiative-bar"]').first().click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible();

    const legend = page.locator('[data-testid="timeline-legend"]');
    await expect(legend).toBeAttached();
    const legendZ = await legend.evaluate(el => getComputedStyle(el).zIndex);
    const panelZ = await page.getByTestId('initiative-panel').evaluate(el => getComputedStyle(el).zIndex);
    expect(Number(legendZ)).toBeLessThan(Number(panelZ));
  });

  test('colour-legend is inside the floating legend, not the header bar', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser [data-testid="colour-legend"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-header-controls"] [data-testid="colour-legend"]')).toHaveCount(0);
  });
});

test.describe('Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('toggle is visible and off by default; no bars marked', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('data-active', 'false');
    await expect(page.locator('[data-critical-path="true"]')).toHaveCount(0);
  });

  test('clicking toggle turns it on; clicking twice turns it off', async ({ page }) => {
    const btn = page.getByTestId('toggle-critical-path');
    await btn.click();
    await expect(btn).toHaveAttribute('data-active', 'true');
    await btn.click();
    await expect(btn).toHaveAttribute('data-active', 'false');
  });

  test('when enabled, at least one initiative bar is marked as critical path', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    await expect(page.locator('[data-critical-path="true"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('ISO 20022 Migration and Core Banking API Layer are on the critical path', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    await expect(page.locator('[data-initiative-id="i-core-iso"]')).toHaveAttribute('data-critical-path', 'true');
    await expect(page.locator('[data-initiative-id="i-core-api"]')).toHaveAttribute('data-critical-path', 'true');
  });

  test('critical path state persists after reload', async ({ page }) => {
    await page.getByTestId('toggle-critical-path').click();
    await expect(page.getByTestId('toggle-critical-path')).toHaveAttribute('data-active', 'true');
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
    await expect(page.getByTestId('toggle-critical-path')).toHaveAttribute('data-active', 'true');
  });
});

test.describe('View Options Popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 10000 });
  });

  test('View button opens popover with colour and group controls', async ({ page }) => {
    const btn = page.getByTestId('view-options-btn');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await expect(page.getByTestId('group-by-asset')).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Programme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Strategy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'By Progress' })).toBeVisible();
  });

  test('popover closes when clicking outside', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await page.mouse.click(100, 100);
    await expect(page.getByTestId('view-options-popover')).toBeHidden();
  });

  test('button label reflects current colour and group mode', async ({ page }) => {
    const btn = page.getByTestId('view-options-btn');
    await expect(btn).toContainText(/Programme|Strategy|Progress|Status/);
    await expect(btn).toContainText(/Asset|Programme|Strategy/);
  });
});
