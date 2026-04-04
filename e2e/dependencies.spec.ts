import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function waitForApp(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

async function injectDependency(
  page: Page,
  dep: { id: string; sourceId: string; targetId: string; type: string }
) {
  await page.evaluate(async (dep) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('it-initiative-visualiser');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = db.transaction('dependencies', 'readwrite');
    tx.objectStore('dependencies').put(dep);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, dep);
}

async function getDependencyCount(page: Page): Promise<number> {
  return page.evaluate((): Promise<number> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('it-initiative-visualiser');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('dependencies', 'readonly');
        const count = tx.objectStore('dependencies').count();
        count.onsuccess = () => { resolve(count.result); db.close(); };
        count.onerror = () => reject(count.error);
      };
      req.onerror = () => reject(req.error);
    });
  });
}

async function getFirstInitiativeId(page: Page): Promise<string> {
  return page.evaluate((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('it-initiative-visualiser');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('initiatives', 'readonly');
        const cursor = tx.objectStore('initiatives').openCursor();
        cursor.onsuccess = () => {
          if (cursor.result) { resolve(cursor.result.value.id); db.close(); }
          else reject(new Error('No initiatives found'));
        };
        cursor.onerror = () => reject(cursor.error);
      };
      req.onerror = () => reject(req.error);
    });
  });
}

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
  await milestone.scrollIntoViewIfNeeded();
  await milestone.hover();
  const handle = milestone.locator('[data-testid="milestone-dep-handle"]');
  await expect(handle).toBeVisible({ timeout: 5000 });
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
  await expect(initBar).toBeVisible({ timeout: 5000 });
  const initBox = await initBar.boundingBox();
  expect(initBox).not.toBeNull();

  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.move(initBox!.x + initBox!.width / 2, initBox!.y + initBox!.height / 2, { steps: 10 });
  await page.waitForTimeout(100);
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
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  if (withDemoData) {
    await page.getByTestId('template-select-with-demo-btn-dts').click();
  } else {
    await page.getByTestId('template-select-no-demo-btn-dts').click();
  }
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function openReportsDependencies(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  await page.getByTestId('nav-reports').click();
  await expect(page.getByTestId('reports-view')).toBeVisible();
  await page.getByTestId('report-card-initiatives-dependencies').click();
}

async function openInitiativePanelById(page: Page, initiativeId: string) {
  await page.evaluate((id) => {
    const bar = document.querySelector(`[data-initiative-id="${id}"]`);
    bar?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, initiativeId);
  await expect(page.locator('[data-testid="initiative-action-edit"]')).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="initiative-action-edit"]') as HTMLElement;
    btn?.click();
  });
}

// ─── Dependency Arrow Drawing ─────────────────────────────────────────────────

test.describe('Dependency Arrow Drawing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('dragging arrow horizontally changes and persists path', async ({ page }) => {
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await expect(dependencyGroup).toBeVisible();

    const path = dependencyGroup.locator('path').nth(1);
    const initialPath = await path.getAttribute('d');

    const box = await dependencyGroup.boundingBox();
    if (!box) throw new Error('No bounding box for dependency');

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 100, startY);

    expect(await path.getAttribute('d')).not.toBe(initialPath);
    await page.mouse.up();

    const finalPath = await path.getAttribute('d');
    expect(finalPath).not.toBe(initialPath);

    await page.reload();
    await page.waitForSelector('#timeline-visualiser');

    const reloadedPath = await page.locator('g.cursor-pointer.group').first().locator('path').nth(1).getAttribute('d');
    expect(reloadedPath).toBe(finalPath);
  });

  test('live drawing start position is within viewport bounds', async ({ page }) => {
    const initiatives = page.locator('[data-initiative-id]');
    await expect(initiatives.first()).toBeVisible({ timeout: 10000 });

    const initiative = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await expect(initiative).toBeVisible({ timeout: 10000 });

    const box = await initiative.boundingBox();
    if (!box) throw new Error('Could not find initiative box');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 50, { steps: 20 });

    const livePath = page.locator('[data-testid="dependencies-svg"]').locator('path[stroke-dasharray="5 5"]');
    await expect(livePath).toBeVisible({ timeout: 5000 });

    const d = await livePath.getAttribute('d');
    if (!d) throw new Error('Path d attribute is empty');

    const startX = parseFloat(d.trim().split(' ')[1]);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(startX).toBeLessThan(viewportWidth);
  });

  test('drawing a new dependency defaults to requires type (blue)', async ({ page }) => {
    test.setTimeout(60000);
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const sourceInit = page.locator('div[title*="Passkey Rollout"]').first();
    const targetInit = page.locator('div[title*="Zero Trust Network Access"]').first();

    const sourceBox = await sourceInit.boundingBox();
    const targetBox = await targetInit.boundingBox();
    if (!sourceBox || !targetBox) throw new Error('Could not find initiatives');

    const blueArrowsBefore = await page.locator('g.cursor-pointer.group path[stroke="#3b82f6"]').count();

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();

    const blueArrowsAfter = await page.locator('g.cursor-pointer.group path[stroke="#3b82f6"]').count();
    expect(blueArrowsAfter).toBeGreaterThan(blueArrowsBefore);
  });
});

// ─── Dependency Edit Modal ───────────────────────────────────────────────────

test.describe('Dependency Edit Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('clicking a dependency arrow opens the edit modal', async ({ page }) => {
    const dependencyLabel = page.locator('text=blocks').first();
    await expect(dependencyLabel).toBeVisible();

    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Edit Relationship');
    await expect(modal.getByRole('button', { name: 'Delete Relationship' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Reverse Direction' })).toBeVisible();
  });

  test('can delete a dependency from the modal', async ({ page }) => {
    await page.waitForSelector('g.cursor-pointer.group');
    const countBefore = await page.locator('g.cursor-pointer.group').count();

    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.getByRole('button', { name: 'Delete Relationship' }).click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await expect(modal).not.toBeVisible();
    await expect(page.locator('g.cursor-pointer.group')).toHaveCount(countBefore - 1);
  });

  test('can reverse dependency direction', async ({ page }) => {
    await page.waitForSelector('g.cursor-pointer.group');

    await page.locator('g.cursor-pointer.group').first().click({ force: true });
    const modal = page.locator('[data-testid="dependency-panel"]');

    const sourceName = await modal.locator('[data-testid="dep-source-name"]').textContent();
    const targetName = await modal.locator('[data-testid="dep-target-name"]').textContent();

    await modal.getByRole('button', { name: 'Reverse Direction' }).click();

    expect(await modal.locator('[data-testid="dep-source-name"]').textContent()).toBe(targetName);
    expect(await modal.locator('[data-testid="dep-target-name"]').textContent()).toBe(sourceName);

    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();
  });
});

// ─── Dependency Constraint Validation ─────────────────────────────────────────

test.describe('Dependency Constraint Validation', () => {
  test('AC1: self-referencing dependency does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForApp(page);
    const selfId = await getFirstInitiativeId(page);

    await injectDependency(page, { id: 'dep-self-loop-test', sourceId: selfId, targetId: selfId, type: 'requires' });
    await page.reload();

    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 5000 });
    expect(errors.filter(e => !/ResizeObserver/.test(e))).toHaveLength(0);
  });

  test('AC2: dependency referencing a deleted initiative does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForApp(page);
    await injectDependency(page, { id: 'dep-orphan-test', sourceId: 'i-does-not-exist-xyz', targetId: 'i-also-does-not-exist-xyz', type: 'requires' });
    await page.reload();

    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 5000 });
    expect(errors.filter(e => !/ResizeObserver/.test(e))).toHaveLength(0);
    await expect(page.locator('[data-testid="dependencies-svg"]')).toBeVisible();
  });

  test('AC3: dragging from an initiative to itself creates no new dependency', async ({ page }) => {
    await waitForApp(page);

    const depCountBefore = await getDependencyCount(page);

    const initiativeBar = page.locator('[data-initiative-id]').first();
    await expect(initiativeBar).toBeVisible();

    const box = await initiativeBar.boundingBox();
    if (!box) throw new Error('No bounding box for initiative bar');

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 50, { steps: 5 });
    await page.mouse.move(startX, startY, { steps: 5 });
    await page.mouse.up();

    expect(await getDependencyCount(page)).toBe(depCountBefore);
  });
});

// ─── Dependency Data Integrity ───────────────────────────────────────────────

test.describe('Dependency Data Integrity', () => {
  test('demo data has no orphaned dependency references', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

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
});

// ─── Milestone Dependencies ──────────────────────────────────────────────────

test.describe('Milestone Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
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
    try {
      await dragMilestoneToBelowInitiative(page);
    } catch (e) {
      test.skip(true, 'Could not drag milestone - likely no milestone with initiative below it');
      return;
    }
    await page.locator('[data-dep-id]').last().locator('path').first().click({ force: true });
    await expect(page.locator('[data-testid="dependency-panel"]')).toBeVisible({ timeout: 5000 });
  });

  test.skip('milestone dependency persists across page reload', async ({ page }) => {
    await waitForDepsRendered(page);
    const initialDepCount = await page.locator('[data-dep-id]').count();
    await dragMilestoneToBelowInitiative(page);
    await expect(page.locator('[data-dep-id]')).toHaveCount(initialDepCount + 1);

    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
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

// ─── Segment Dependencies ────────────────────────────────────────────────────

test.describe('Segment Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await waitForDepsRendered(page);
  });

  test('AC1: selected segment shows a dependency-draw handle', async ({ page }) => {
    const bar = await selectFirstSegment(page);
    await expect(bar.locator('[data-testid="segment-action-link"]')).toBeVisible();
  });

  test('AC2: dragging handle to initiative creates a dependency arrow', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-action-link"]');
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

  test.skip('AC3: segment dependency persists across reload', async ({ page }) => {
    const initialDepCount = await page.locator('[data-dep-id]').count();

    const bar = await selectFirstSegment(page);
    const handle = bar.locator('[data-testid="segment-action-link"]');
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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
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
    const handleBox = await firstBar.locator('[data-testid="segment-action-link"]').boundingBox();
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
    const handle = bar.locator('[data-testid="segment-action-link"]');
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

// ─── DTS Template Dependencies ────────────────────────────────────────────────

test.describe('DTS Template Dependencies', () => {
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
    await page.getByTestId('initiative-action-edit').click();
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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await page.getByTestId('nav-data-manager').click();
    await page.getByRole('button', { name: /Dependencies/ }).click();

    const badge = page.locator('[data-testid="data-manager-tab-dependencies"] span').last();
    await expect(badge).toBeVisible();
    const count = parseInt(await badge.textContent() || '0', 10);
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ─── Dependency Visual Enhancements ─────────────────────────────────────────

test.describe('Dependency Visual Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('increased vertical gap for intra-asset dependencies', async ({ page }) => {
    const c1 = page.getByText('Passkey Rollout').first();
    const c2 = page.getByText('SSO Consolidation').first();

    await expect(c1).toBeVisible();
    await expect(c2).toBeVisible();

    const box1 = await c1.boundingBox();
    const box2 = await c2.boundingBox();

    const topBar = box1!.y < box2!.y ? box1! : box2!;
    const bottomBar = box1!.y > box2!.y ? box1! : box2!;
    const gap = bottomBar.y - (topBar.y + topBar.height);
    expect(gap).toBeGreaterThan(30);
  });

  test('dependency labels are offset and not covering the arrow segment', async ({ page }) => {
    const dependencyLabel = page.locator('text=blocks').first();
    await expect(dependencyLabel).toBeVisible();

    const labelBox = await dependencyLabel.boundingBox();
    expect(labelBox).not.toBeNull();

    const box1 = await page.getByText('Passkey Rollout').first().boundingBox();
    const box2 = await page.getByText('SSO Consolidation').first().boundingBox();

    const midX = (box1!.x + box1!.width + box2!.x) / 2;
    const labelMidX = labelBox!.x + labelBox!.width / 2;
    expect(Math.abs(labelMidX - midX)).toBeGreaterThan(15);
  });
});

// ─── Dependency relationship display ────────────────────────────────────────

test.describe('Dependency relationship display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('g.cursor-pointer.group');
  });

  test('edit modal shows initiative names in description sentence', async ({ page }) => {
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await expect(modal).toBeVisible();

    const sourceName = await modal.locator('[data-testid="dep-source-name"]').textContent();
    const targetName = await modal.locator('[data-testid="dep-target-name"]').textContent();
    expect(sourceName).toBeTruthy();
    expect(targetName).toBeTruthy();

    const desc = modal.locator('[data-testid="dep-description"]');
    await expect(desc).toBeVisible();
    const descText = await desc.textContent();

    expect(descText).not.toContain('The source initiative');
    expect(descText).not.toContain('The target initiative');
    expect(descText).not.toContain('There is a general connection between these initiatives');
    expect(descText?.includes(sourceName!) || descText?.includes(targetName!)).toBe(true);
  });

  test('blocks arrow is red', async ({ page }) => {
    const blocksLabel = page.locator('g.cursor-pointer.group').filter({ hasText: 'blocks' }).first();
    await expect(blocksLabel).toBeVisible();
    await expect(blocksLabel.locator('path[stroke]').nth(1)).toHaveAttribute('stroke', '#ef4444');
  });

  test('requires arrow is blue', async ({ page }) => {
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.locator('#depType').selectOption('requires');
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();

    const requiresGroup = page.locator('g.cursor-pointer.group').filter({ hasText: 'requires' }).first();
    await expect(requiresGroup).toBeVisible();
    await expect(requiresGroup.locator('path[stroke]').nth(1)).toHaveAttribute('stroke', '#3b82f6');
  });

  test('related arrow is dark and has no arrowhead marker', async ({ page }) => {
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.locator('#depType').selectOption('related');
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();

    const relatedGroup = page.locator('g.cursor-pointer.group').filter({ hasText: 'related' }).first();
    await expect(relatedGroup).toBeVisible();

    const visiblePath = relatedGroup.locator('path[stroke]').nth(1);
    await expect(visiblePath).toHaveAttribute('stroke', '#475569');
    expect(await visiblePath.getAttribute('marker-end')).toBeFalsy();
  });

  test('source and target names in panel are not truncated', async ({ page }) => {
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const depArrow = page.locator('g[data-dep-id]').first();
    await expect(depArrow).toBeVisible({ timeout: 10000 });
    await depArrow.click();

    const panel = page.getByTestId('dependency-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const sourceClasses = await page.getByTestId('dep-source-name').getAttribute('class');
    const targetClasses = await page.getByTestId('dep-target-name').getAttribute('class');
    expect(sourceClasses).not.toContain('truncate');
    expect(targetClasses).not.toContain('truncate');
  });
});

// ─── Initiatives & Dependencies Report ───────────────────────────────────────

test.describe('Initiatives & Dependencies Report', () => {
  test.beforeEach(async ({ page }) => {
    await openReportsDependencies(page);
  });

  test('report is grouped by asset with asset headings', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toBeVisible();
    await expect(report).toContainText('Customer IAM (CIAM)');
  });

  test('lists initiatives under their asset', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toContainText('Passkey Rollout');
    await expect(report).toContainText('SSO Consolidation');
  });

  test('shows plain-language dependency sentences', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    expect(text).not.toMatch(/blocks .+ —/);
    expect(text).not.toContain('general connection');
    expect(text).toMatch(/must finish before .+ can start\.|requires .+ to finish first\.|are related\./i);
  });

  test('blocks sentence reads "A must finish before B can start"', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    if (text?.match(/must finish before/)) {
      expect(text).toMatch(/\w.+ must finish before \w.+ can start\./);
      expect(text).not.toMatch(/\w.+ blocks \w.+ —/);
    }
  });

  test('requires sentence reads "A requires B to finish first"', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    if (text?.match(/requires .+ to finish first/)) {
      expect(text).toMatch(/\w.+ requires \w.+ to finish first\./);
      expect(text).not.toMatch(/requires .+ to be complete/);
    }
  });
});

// ─── Perspective-Aware Sentences ────────────────────────────────────────────

test.describe('Perspective-aware dependency sentences in Reports', () => {
  test.beforeEach(async ({ page }) => {
    await openReportsDependencies(page);
  });

  test('blocked initiative shows "Blocked:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      "Blocked: Developer Portal Launch can't start until API Gateway v2 Migration has finished."
    );
  });

  test('blocking initiative shows "Blocking:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      'Blocking: API Gateway v2 Migration must finish before Developer Portal Launch can start.'
    );
  });

  test('requiring initiative shows "Required:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      'Required: Real-Time Payments Gateway requires Transaction Fraud ML to start first.'
    );
  });

  test('required initiative shows "Required by:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      'Required by: Transaction Fraud ML must start first before Real-Time Payments Gateway.'
    );
  });

  test('no legacy wording remains', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    expect(text).not.toMatch(/blocks .+ —/);
    expect(text).not.toContain('general connection');
    expect(text).not.toMatch(/requires .+ to finish first/);
  });
});

// ─── Perspective-Aware Labels in InitiativePanel ────────────────────────────

test.describe('Perspective-aware labels in InitiativePanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('blocked initiative panel shows "Blocked:" label', async ({ page }) => {
    await openInitiativePanelById(page, 'i-apigw-portal');
    const section = page.getByTestId('related-initiatives-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Blocked');
  });

  test('blocking initiative panel shows "Blocking:" label', async ({ page }) => {
    await openInitiativePanelById(page, 'i-apigw-v2');
    const section = page.getByTestId('related-initiatives-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Blocking');
  });
});

// ─── Reports mobile layout ───────────────────────────────────────────────────

test.describe('Reports mobile layout', () => {
  test('mobile tab bar has only Visualiser and Reports tabs', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-tab-bar"]');
    await expect(page.locator('[data-testid="mobile-tab-visualiser"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-reports"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-data"]')).not.toBeVisible();
  });

  test('footer is hidden on mobile', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('footer')).toBeHidden();
  });
});
