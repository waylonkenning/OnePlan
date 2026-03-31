import { test, expect } from '@playwright/test';

/**
 * User Story: Dependency Constraint Validation (P0 Safety Net)
 *
 * AC1: App renders without crashing when a self-referencing dependency
 *      (sourceId === targetId) exists in IndexedDB
 * AC2: App renders without crashing when a dependency references an initiative
 *      that no longer exists (orphaned ref) — no arrow is drawn for it
 * AC3: Dragging from an initiative to itself does not create a new dependency
 */

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

test.describe('Dependency Constraint Validation', () => {

  // ── AC1 ──────────────────────────────────────────────────────────────────
  test('AC1: self-referencing dependency (sourceId === targetId) does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForApp(page);

    const selfId = await getFirstInitiativeId(page);

    await injectDependency(page, {
      id: 'dep-self-loop-test',
      sourceId: selfId,
      targetId: selfId,
      type: 'requires',
    });

    await page.reload();

    // App should render without crashing
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 20000 });

    // No unhandled JS errors
    expect(errors.filter(e => !/ResizeObserver/.test(e))).toHaveLength(0);
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: dependency referencing a deleted initiative does not crash the app', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await waitForApp(page);

    await injectDependency(page, {
      id: 'dep-orphan-test',
      sourceId: 'i-does-not-exist-xyz',
      targetId: 'i-also-does-not-exist-xyz',
      type: 'requires',
    });

    await page.reload();

    // App should render without crashing
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible({ timeout: 20000 });

    // No unhandled JS errors
    expect(errors.filter(e => !/ResizeObserver/.test(e))).toHaveLength(0);

    // The SVG should still be present (no fatal render error)
    await expect(page.locator('[data-testid="dependencies-svg"]')).toBeVisible();
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: dragging vertically from an initiative back to itself creates no new dependency', async ({ page }) => {
    await waitForApp(page);

    const depCountBefore = await getDependencyCount(page);

    // Find the first visible initiative bar and drag down then back up to the same bar
    const initiativeBar = page.locator('[data-initiative-id]').first();
    await expect(initiativeBar).toBeVisible();

    const box = await initiativeBar.boundingBox();
    if (!box) throw new Error('No bounding box for initiative bar');

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Drag down 50px (enough to trigger dep drawing) then back to the same bar
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 50, { steps: 5 });
    // Release on the same bar
    await page.mouse.move(startX, startY, { steps: 5 });
    await page.mouse.up();

    // Small wait for any state update
    await page.waitForTimeout(300);

    const depCountAfter = await getDependencyCount(page);

    // No new dependency should have been created
    expect(depCountAfter).toBe(depCountBefore);
  });
});
