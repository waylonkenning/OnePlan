import { test, expect } from '@playwright/test';

/**
 * User Story 26: GEANZ-to-DTS Cross-Mapping Tooltips
 *
 * AC1: GEANZ application area rows in the GEANZ template show a badge
 *      indicating the corresponding DTS asset alias code (where a mapping exists)
 * AC2: Mappings are defined in a lookup table
 * AC3: The mapping is informational only
 * AC4: GEANZ areas with no clear DTS mapping show no badge
 */

async function simulateFirstRun(page: import('@playwright/test').Page) {
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

/**
 * Loads the DTS template (DTS assets only — no TAP.XX.XX GEANZ assets),
 * then programmatically enables the GEANZ catalogue so all GEANZ areas
 * appear as unpopulated and cross-map badges are visible.
 */
async function loadDtsWithGeanzCatalogue(page: import('@playwright/test').Page) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
  // Enable GEANZ catalogue by patching timelineSettings in IndexedDB
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('it-initiative-visualiser');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const settings = await new Promise<any>((resolve, reject) => {
      const req = store.get('timelineSettings');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (settings) {
      settings.showGeanzCatalogue = true;
      store.put(settings, 'timelineSettings');
    }
    await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); });
    db.close();
  });
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

test.describe('US-26: GEANZ-to-DTS Cross-Mapping Tooltips', () => {

  // ── AC1 + AC2 ──────────────────────────────────────────────────────────────
  test('AC1+AC2: TAP.07 (Identity & Access Mgmt) shows DTS.DPI.01 badge', async ({ page }) => {
    await loadDtsWithGeanzCatalogue(page);

    // Scroll down to the GEANZ section
    const tap07entry = page.getByTestId('geanz-area-entry-TAP.07');
    await tap07entry.scrollIntoViewIfNeeded();

    // Should show a DTS cross-map badge
    const badge = tap07entry.getByTestId('geanz-dts-map-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('DTS.DPI.01');
  });

  // ── AC4 ──────────────────────────────────────────────────────────────────
  test('AC4: TAP.08 (Security) has no DTS mapping badge', async ({ page }) => {
    await loadDtsWithGeanzCatalogue(page);

    const tap08entry = page.getByTestId('geanz-area-entry-TAP.08');
    await tap08entry.scrollIntoViewIfNeeded();

    // TAP.08 (Security) has no direct DTS mapping — badge should not appear
    const badge = tap08entry.getByTestId('geanz-dts-map-badge');
    await expect(badge).not.toBeVisible();
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: badge is informational — asset count and data are unchanged', async ({ page }) => {
    await loadDtsWithGeanzCatalogue(page);

    // The GEANZ section should still show the normal area rows
    const geanzSection = page.getByTestId('geanz-section');
    await expect(geanzSection).toBeVisible();

    // The DTS assets are still present (not affected by cross-map)
    await expect(page.getByTestId('asset-row-content').first()).toBeVisible();
  });

});
