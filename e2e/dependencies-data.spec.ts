import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wait for SVG dep arrows to be measured and rendered (50ms DOM delay + buffer). */
async function waitForDepsRendered(page: Page) {
  await page.waitForTimeout(500);
}

async function selectFirstSegment(page: Page) {
  const bar = page.locator('[data-testid^="segment-bar-"]').first();
  await expect(bar).toBeVisible({ timeout: 10000 });
  await bar.click();
  return bar;
}

async function dragMilestoneToBelowInitiative(page: Page) {
  const milestone = page.locator('[data-milestone-id]').first();
  const handle = milestone.locator('[data-testid="milestone-dep-handle"]');
  await handle.scrollIntoViewIfNeeded();
  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();

  const milestoneBottom = handleBox!.y + handleBox!.height;

  const initId = await page.evaluate((minY: number) => {
    const els = document.querySelectorAll('[data-initiative-id]');
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.top > minY + 20) return el.getAttribute('data-initiative-id');
    }
    return null;
  }, milestoneBottom);

  expect(initId).not.toBeNull();
  const initBar = page.locator(`[data-initiative-id="${initId}"]`);
  const initBox = await initBar.boundingBox();
  expect(initBox).not.toBeNull();

  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
  await page.mouse.up();
}

async function simulateFirstRun(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('it-initiative-visualiser');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => setTimeout(resolve, 200);
    });
    localStorage.removeItem('scenia-e2e');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
}

async function loadDtsTemplate(page: Page, withDemoData = true) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  if (withDemoData) {
    await page.getByTestId('template-select-with-demo-btn-dts').click();
  } else {
    await page.getByTestId('template-select-no-demo-btn-dts').click();
  }
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

// ─── Data Integrity ───────────────────────────────────────────────────────────

test('demo data has no orphaned dependency references', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

  const orphanedDepIds = await page.evaluate((): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('it-initiative-visualiser');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['initiatives', 'dependencies'], 'readonly');
        const initiativeIds = new Set<string>();
        const orphaned: string[] = [];

        const initReq = tx.objectStore('initiatives').getAll();
        initReq.onsuccess = () => {
          initReq.result.forEach((i: { id: string }) => initiativeIds.add(i.id));

          const depReq = tx.objectStore('dependencies').getAll();
          depReq.onsuccess = () => {
            depReq.result.forEach((d: { id: string; sourceId: string; targetId: string }) => {
              if (!initiativeIds.has(d.sourceId) || !initiativeIds.has(d.targetId)) {
                orphaned.push(d.id);
              }
            });
            resolve(orphaned);
          };
        };
      };
    });
  });

  expect(orphanedDepIds, `Orphaned dependency IDs found: ${orphanedDepIds.join(', ')}`).toHaveLength(0);
});

// ─── Milestone Dependencies ───────────────────────────────────────────────────

test.describe('Milestone Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('milestone markers show a dep-draw handle on hover', async ({ page }) => {
    const milestone = page.locator('[data-milestone-id]').first();
    await milestone.hover();
    await expect(milestone.locator('[data-testid="milestone-dep-handle"]')).toBeVisible();
  });

  test('dragging from milestone handle to an initiative creates a dependency', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    await dragMilestoneToBelowInitiative(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  test('milestone dependency arrow renders with correct data attribute', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    const initialMilestoneDepCount = await page.locator('[data-testid="milestone-dep-source"]').count();
    await dragMilestoneToBelowInitiative(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
    await expect(page.locator('[data-testid="milestone-dep-source"]')).toHaveCount(initialMilestoneDepCount + 1);
  });

  test('clicking a milestone dependency arrow opens the dependency panel', async ({ page }) => {
    await waitForDepsRendered(page);
    await dragMilestoneToBelowInitiative(page);
    await page.locator('[data-dep-id]').last().click();
    await expect(page.locator('[data-testid="dep-source-name"]')).toBeVisible();
  });

  test('milestone dependency persists across page reload', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    await dragMilestoneToBelowInitiative(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await waitForDepsRendered(page);

    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  test('milestone dependencies appear in the reports view', async ({ page }) => {
    await waitForDepsRendered(page);
    await dragMilestoneToBelowInitiative(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-initiatives-dependencies').click();
    await expect(page.locator('[data-testid="report-milestone-dependencies"]')).toBeVisible();
  });
});

// ─── Segment Dependencies (US-05) ────────────────────────────────────────────

test.describe('US-05: Segment dependency relationships', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await waitForDepsRendered(page);
  });

  test('AC1: selected segment shows a dependency-draw handle', async ({ page }) => {
    const bar = await selectFirstSegment(page);
    await expect(bar.locator('[data-testid="segment-dep-handle"]')).toBeVisible();
  });

  test('AC2: dragging handle to initiative creates a dependency arrow', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    await expect(handle).toBeVisible();
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();

    const initBox = await page.locator('[data-initiative-id]').first().boundingBox();
    expect(initBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDepsRendered(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  test('AC3: segment dependency persists across reload', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    const handleBox = await handle.boundingBox();
    const initBox = await page.locator('[data-initiative-id]').first().boundingBox();
    expect(handleBox).not.toBeNull();
    expect(initBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDepsRendered(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await waitForDepsRendered(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);
  });

  test('AC4: dropping on another segment does not create a dependency', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const segBars = page.locator('[data-testid^="segment-bar-"]');
    const count = await segBars.count();
    test.skip(count < 2, 'Need at least two segment bars for this test');

    const firstBar = segBars.first();
    await firstBar.click();
    const handleBox = await firstBar.locator('[data-testid="segment-dep-handle"]').boundingBox();
    const secondBox = await segBars.nth(1).boundingBox();
    expect(handleBox).not.toBeNull();
    expect(secondBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(secondBox!.x + secondBox!.width / 2, secondBox!.y + secondBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDepsRendered(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount);
  });

  test('AC5: clicking segment dep arrow opens DependencyPanel with segment as source', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-dep-handle"]');
    const handleBox = await handle.boundingBox();
    const initBox = await page.locator('[data-initiative-id]').first().boundingBox();
    expect(handleBox).not.toBeNull();
    expect(initBox).not.toBeNull();

    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 15 });
    await page.mouse.up();

    await waitForDepsRendered(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    await page.locator('[data-dep-id]').last().locator('path').first().click({ force: true });
    await expect(page.locator('[data-testid="dep-source-name"]')).toBeVisible();
  });
});

// ─── DTS Template Dependencies (US-22) ───────────────────────────────────────

test.describe('US-22: Pre-drawn DTS Dependencies in Demo', () => {

  test('AC1: DTS demo data includes at least 6 initiative-to-initiative dependencies', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Dependencies/ }).click();

    const badge = page.locator('[data-testid="data-manager-tab-dependencies"] span').last();
    const count = parseInt(await badge.textContent() || '0', 10);
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('AC2: DTS demo data includes at least 2 milestone-to-initiative dependencies', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('nav-reports').click();
    await page.getByTestId('report-card-initiatives-dependencies').click();
    await expect(page.getByTestId('report-milestone-dependencies')).toBeVisible({ timeout: 10000 });
    expect(await page.locator('[data-testid="report-milestone-dependencies"] li').count()).toBeGreaterThanOrEqual(2);
  });

  test('AC3: Portal Decommission initiative shows at least 2 upstream blockers', async ({ page }) => {
    test.setTimeout(60000);
    await loadDtsTemplate(page);

    const portalBar = page.locator('[data-testid^="initiative-bar-dts-i-portal"]');
    await expect(portalBar).toBeVisible({ timeout: 15000 });
    await portalBar.click();
    await portalBar.locator('[data-testid="initiative-edit"]').click();
    await expect(page.getByTestId('related-initiatives-section')).toBeVisible({ timeout: 10000 });

    expect(await page.locator('[data-testid="related-initiatives-section"] li').count()).toBeGreaterThanOrEqual(2);
  });

  test('AC4: loading DTS template WITHOUT demo data results in zero dependencies', async ({ page }) => {
    await loadDtsTemplate(page, false);
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Dependencies/ }).click();

    const count = parseInt(
      await page.locator('[data-testid="data-manager-tab-dependencies"] span').last().textContent() || '0',
      10
    );
    expect(count).toBe(0);
  });

  test('AC5: GEANZ workspace dependency count is a non-negative number', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Dependencies/ }).click();

    const badge = page.locator('[data-testid="data-manager-tab-dependencies"] span').last();
    await expect(badge).toBeVisible();
    const count = parseInt(await badge.textContent() || '0', 10);
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
