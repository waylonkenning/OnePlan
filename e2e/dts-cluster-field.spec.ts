import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * User Story 25: DTS Cluster Field in Workspace Settings
 *
 * AC1: A "Cluster" text field is available in the workspace/timeline settings panel
 * AC2: The cluster name appears in the visible timeline header (captured in PDF/SVG exports)
 * AC3: The cluster name appears in the DTS Summary Excel tab
 * AC4: The field is optional and blank by default
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

async function loadDtsTemplate(page: import('@playwright/test').Page) {
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
}

test.describe('US-25: DTS Cluster Field in Workspace Settings', () => {

  // ── AC1 + AC4 ──────────────────────────────────────────────────────────────
  test('AC1+AC4: cluster text field exists in settings and is blank by default', async ({ page }) => {
    await loadDtsTemplate(page);

    // Open more settings panel
    await page.getByTestId('display-more-btn').click();

    // Cluster input should exist and be blank by default
    const clusterInput = page.getByTestId('cluster-name-input');
    await expect(clusterInput).toBeVisible();
    await expect(clusterInput).toHaveValue('');
  });

  // ── AC2 ──────────────────────────────────────────────────────────────────
  test('AC2: cluster name appears in the timeline header', async ({ page }) => {
    await loadDtsTemplate(page);

    // Open more settings and type a cluster name
    await page.getByTestId('display-more-btn').click();
    await page.getByTestId('cluster-name-input').fill('Digital First Cluster');
    // Close popover by pressing Escape or clicking elsewhere
    await page.keyboard.press('Escape');

    // The cluster name should be visible in the timeline header area
    await expect(page.getByTestId('timeline-cluster-name')).toBeVisible();
    await expect(page.getByTestId('timeline-cluster-name')).toHaveText('Digital First Cluster');
  });

  // ── AC3 ──────────────────────────────────────────────────────────────────
  test('AC3: cluster name appears in DTS Summary Excel tab', async ({ page }) => {
    await loadDtsTemplate(page);

    // Set cluster name
    await page.getByTestId('display-more-btn').click();
    await page.getByTestId('cluster-name-input').fill('Science Cluster');
    await page.keyboard.press('Escape');

    // Export Excel
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-excel').click(),
    ]);
    const filePath = await download.path();
    if (!filePath) throw new Error('Download path is null');
    const buffer = fs.readFileSync(filePath);
    const wb = XLSX.read(buffer, { type: 'buffer' });

    // DTS Summary sheet should contain the cluster name somewhere
    const ws = wb.Sheets['DTS Summary'];
    const sheetText = JSON.stringify(XLSX.utils.sheet_to_json(ws, { header: 1 }));
    expect(sheetText).toContain('Science Cluster');
  });

});
