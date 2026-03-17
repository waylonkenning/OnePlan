import { test, expect } from '@playwright/test';

/**
 * Regression test: demo data must not contain dependencies that reference
 * non-existent initiatives. Such orphaned references produce "Unknown" labels
 * in the history diff report and version comparison panels.
 */
test('demo data has no orphaned dependency references', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

  // Read initiatives and dependencies directly from IndexedDB
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
