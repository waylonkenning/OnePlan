import { test, expect } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function waitForApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

async function injectDependency(
  page: import('@playwright/test').Page,
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

async function getDependencyCount(page: import('@playwright/test').Page): Promise<number> {
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

async function getFirstInitiativeId(page: import('@playwright/test').Page): Promise<string> {
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

// ─── Drawing ────────────────────────────────────────────────────────────────

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
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

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

// ─── Editing ─────────────────────────────────────────────────────────────────

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

// ─── Constraint Validation (P0 Safety Net) ───────────────────────────────────

test.describe('Dependency Constraint Validation', () => {

  test('AC1: self-referencing dependency does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForApp(page);
    const selfId = await getFirstInitiativeId(page);

    await injectDependency(page, { id: 'dep-self-loop-test', sourceId: selfId, targetId: selfId, type: 'requires' });
    await page.reload();

    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 20000 });
    expect(errors.filter(e => !/ResizeObserver/.test(e))).toHaveLength(0);
  });

  test('AC2: dependency referencing a deleted initiative does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForApp(page);
    await injectDependency(page, { id: 'dep-orphan-test', sourceId: 'i-does-not-exist-xyz', targetId: 'i-also-does-not-exist-xyz', type: 'requires' });
    await page.reload();

    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 20000 });
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
