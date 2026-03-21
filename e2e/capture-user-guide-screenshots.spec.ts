/**
 * Captures the 15 new screenshots needed for the Scenia user guide.
 * Run with: npx playwright test e2e/capture-user-guide-screenshots.spec.ts --reporter=line
 *
 * Outputs to public/features/ alongside existing screenshots.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const OUT = path.resolve('public', 'features');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loadApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('scenia-e2e', 'true');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

async function loadMobileApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('scenia-e2e', 'true');
    localStorage.setItem('scenia_has_seen_landing', 'true');
  });
  await page.reload();
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 20000 });
}

// Save a named version and return to the Visualiser. Assumes app is already loaded.
async function saveVersion(page: import('@playwright/test').Page, name: string) {
  await page.getByTestId('nav-history').click();
  await page.getByRole('button', { name: 'Save Current State' }).click();
  await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', name);
  await page.getByRole('button', { name: 'Save Version' }).click();
  await page.waitForTimeout(400);
  await page.getByTestId('close-version-manager').click();
  // Navigate back to the Visualiser so initiative bars are accessible
  await page.getByTestId('nav-visualiser').click();
  await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 15000 });
  await page.waitForTimeout(300);
}

// ─── 1. Reports home screen ───────────────────────────────────────────────────

test('reports-home-screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);
  await page.getByTestId('nav-reports').click();
  await page.waitForSelector('[data-testid="reports-home"]', { timeout: 10000 });
  await page.waitForTimeout(300);

  const el = page.locator('[data-testid="reports-home"]');
  const box = await el.boundingBox();
  if (!box) throw new Error('reports-home not found');

  await page.screenshot({
    path: `${OUT}/reports-home-screen.png`,
    clip: {
      x: Math.max(0, box.x - 24),
      y: Math.max(0, box.y - 24),
      width: Math.min(box.width + 48, 1280),
      height: Math.min(box.height + 48, 760),
    },
  });
});

// ─── 2. Budget report ────────────────────────────────────────────────────────

test('budget-report', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);
  await page.getByTestId('nav-reports').click();
  await page.getByTestId('report-card-budget').click();
  await page.waitForSelector('[data-testid="report-budget-summary"]', { timeout: 10000 });
  await page.waitForTimeout(500);

  const container = page.locator('[data-testid="report-view-budget"]');
  const box = await container.boundingBox();
  if (!box) throw new Error('report-view-budget not found');

  await page.screenshot({
    path: `${OUT}/budget-report.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 720) },
  });
});

// ─── 3. Capacity report ──────────────────────────────────────────────────────

test('capacity-report', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);
  await page.getByTestId('nav-reports').click();
  await page.getByTestId('report-card-capacity').click();
  await page.waitForSelector('[data-testid="capacity-report"]', { timeout: 10000 });
  await page.waitForTimeout(300);

  const container = page.locator('[data-testid="report-view-capacity"]');
  const box = await container.boundingBox();
  if (!box) throw new Error('report-view-capacity not found');

  await page.screenshot({
    path: `${OUT}/capacity-report.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 720) },
  });
});

// ─── 4. Initiatives & dependencies report ────────────────────────────────────

test('initiatives-dependencies-report', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);
  await page.getByTestId('nav-reports').click();
  await page.getByTestId('report-card-initiatives-dependencies').click();
  await page.waitForSelector('[data-testid="report-dependencies"]', { timeout: 10000 });
  await page.waitForTimeout(300);

  const container = page.locator('[data-testid="report-view-initiatives-dependencies"]');
  const box = await container.boundingBox();
  if (!box) throw new Error('report-view-initiatives-dependencies not found');

  await page.screenshot({
    path: `${OUT}/initiatives-dependencies-report.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 720) },
  });
});

// ─── 5. Version history: save dialog ─────────────────────────────────────────

test('version-history-save-dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  await page.getByTestId('nav-history').click();
  await page.getByRole('button', { name: 'Save Current State' }).click();
  await page.waitForSelector('input[placeholder="e.g., March 2026 Snapshot"]', { timeout: 5000 });
  await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Q2 2026 Baseline');
  await page.fill('textarea[placeholder*="What changes"]', 'Pre-board snapshot before quarterly planning review.');
  await page.waitForTimeout(300);

  // Full-screen shot — the modal is a fixed overlay
  await page.screenshot({ path: `${OUT}/version-history-save-dialog.png` });
});

// ─── 6. Version history: restore confirm modal ───────────────────────────────

test('version-history-restore-modal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Save a version first
  await page.getByTestId('nav-history').click();
  await page.getByRole('button', { name: 'Save Current State' }).click();
  await page.fill('input[placeholder="e.g., March 2026 Snapshot"]', 'Q1 Baseline');
  await page.getByRole('button', { name: 'Save Version' }).click();
  await page.waitForTimeout(400);

  // Click the version to select it — shows details panel
  await page.getByText('Q1 Baseline').click();
  await page.waitForTimeout(300);

  // Click "Restore to Current" which triggers the confirm modal
  await page.getByRole('button', { name: 'Restore to Current' }).click();
  await page.waitForSelector('[data-testid="confirm-modal"]', { timeout: 5000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/version-history-restore-modal.png` });
});

// ─── 7. Version history: diff report ─────────────────────────────────────────

test('version-history-diff-report', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Save a baseline
  await saveVersion(page, 'Baseline');

  // Modify an initiative name to create a diff
  const initBar = page.locator('[data-testid^="initiative-bar"]').first();
  await initBar.click();
  await initBar.locator('[data-testid="initiative-edit"]').click();
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 8000 });
  const nameInput = page.locator('[data-testid="initiative-panel"]').getByLabel('Initiative Name');
  const original = await nameInput.inputValue();
  await nameInput.fill(original + ' (Revised)');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(300);

  // Run the diff from the Version History tab
  await page.getByTestId('nav-history').click();
  // Select the baseline version to reveal its detail panel
  await page.getByText('Baseline').first().click();
  await page.waitForTimeout(200);
  // "Run Difference Report" opens the VersionComparisonReport overlay
  await page.getByRole('button', { name: 'Run Difference Report' }).click();
  // Wait for the comparison overlay to appear (close-report is its close button)
  await page.waitForSelector('[data-testid="close-report"]', { timeout: 10000 });
  await page.waitForTimeout(400);

  // Full-screen shot — the overlay is fixed and centred
  await page.screenshot({ path: `${OUT}/version-history-diff-report.png` });
});

// ─── 8. History diff report (from Reports view) ───────────────────────────────

test('history-diff-report', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Save a baseline version
  await saveVersion(page, 'Baseline');

  // Make a change
  const initBar = page.locator('[data-testid^="initiative-bar"]').first();
  await initBar.click();
  await initBar.locator('[data-testid="initiative-edit"]').click();
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 8000 });
  const nameInput = page.locator('[data-testid="initiative-panel"]').getByLabel('Initiative Name');
  const original = await nameInput.inputValue();
  await nameInput.fill(original + ' (Modified)');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(300);

  // Navigate to Reports → History Differences
  await page.getByTestId('nav-reports').click();
  await page.getByTestId('report-card-version-history').click();
  await page.waitForSelector('[data-testid="report-history-diff"]', { timeout: 5000 });
  await page.getByTestId('version-select').selectOption({ label: 'Baseline' });
  await page.getByRole('button', { name: 'Run Difference Report' }).click();
  await page.waitForSelector('[data-testid="diff-result"]', { timeout: 10000 });
  await page.waitForTimeout(400);

  const container = page.locator('[data-testid="report-view-version-history"]');
  const box = await container.boundingBox();
  if (!box) throw new Error('report-view-version-history not found');
  await page.screenshot({
    path: `${OUT}/history-diff-report.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 720) },
  });
});

// ─── 9. Excel import preview modal ───────────────────────────────────────────

test('excel-import-preview-modal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // Build a minimal xlsx fixture
  const fixturePath = path.resolve('e2e', 'tmp-import-fixture.xlsx');
  const wb = XLSX.utils.book_new();
  const wsInitiatives = XLSX.utils.json_to_sheet([
    { id: 'i-tmp-1', name: 'Cloud Migration Phase 2', assetId: 'a-ciam', startDate: '2026-06-01', endDate: '2026-12-31', budget: 250000 },
    { id: 'i-tmp-2', name: 'Data Platform Upgrade',   assetId: 'a-pam',  startDate: '2026-09-01', endDate: '2027-03-31', budget: 180000 },
    { id: 'i-tmp-3', name: 'DevOps Toolchain Refresh', assetId: 'a-ciam', startDate: '2027-01-01', endDate: '2027-06-30', budget: 120000 },
  ]);
  XLSX.utils.book_append_sheet(wb, wsInitiatives, 'Initiatives');
  XLSX.writeFile(wb, fixturePath);

  await loadApp(page);

  // Set the file on the hidden file input to trigger the import preview
  const fileInput = page.locator('input[type="file"][accept*="xlsx"]');
  await fileInput.setInputFiles(fixturePath);
  await page.waitForSelector('.import-preview-modal', { timeout: 8000 });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/excel-import-preview-modal.png` });

  // Cleanup fixture
  if (fs.existsSync(fixturePath)) fs.unlinkSync(fixturePath);
});

// ─── 10. Excel export controls ───────────────────────────────────────────────

test('excel-export-data-manager', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Export controls (PDF, SVG, Export, Import) are always in the header
  const exportBtn = page.getByRole('button', { name: /^Export$/ });
  await expect(exportBtn).toBeVisible({ timeout: 5000 });

  // Crop to just the right-hand header controls area containing the export buttons
  const box = await exportBtn.boundingBox();
  if (!box) throw new Error('Export button not found');
  await page.screenshot({
    path: `${OUT}/excel-export-data-manager.png`,
    clip: {
      x: Math.max(0, box.x - 220),
      y: 0,
      width: Math.min(box.x + box.width + 80, 1280) - Math.max(0, box.x - 220),
      height: Math.max(box.y + box.height + 12, 56),
    },
  });
});

// ─── 11. PDF & SVG export controls ───────────────────────────────────────────

test('pdf-svg-export-visualiser', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  const svgBtn = page.getByTestId('export-svg');
  await expect(svgBtn).toBeVisible({ timeout: 5000 });

  // Crop to the full export/import strip: PDF · SVG · Export · Import
  const pdfBtn = page.getByRole('button', { name: /^PDF$/ });
  const importBtn = page.getByRole('button', { name: /^Import$/ });
  const pdfBox = await pdfBtn.boundingBox();
  const importBox = await importBtn.boundingBox();
  if (!pdfBox || !importBox) throw new Error('Export buttons not found');

  await page.screenshot({
    path: `${OUT}/pdf-svg-export-visualiser.png`,
    clip: {
      x: Math.max(0, pdfBox.x - 8),
      y: 0,
      width: importBox.x + importBox.width + 8 - Math.max(0, pdfBox.x - 8),
      height: Math.max(pdfBox.y + pdfBox.height + 12, 56),
    },
  });
});

// ─── 12. Resource roster in Data Manager ─────────────────────────────────────

test('resource-roster-data-manager', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);
  await page.getByTestId('nav-data-manager').click();
  await page.getByTestId('data-manager-tab-resources').click();
  // Wait for the table to populate
  await page.waitForSelector('table tbody tr[data-real="true"]', { timeout: 10000 });
  await page.waitForTimeout(300);

  const dm = page.locator('[data-testid="data-manager"]');
  const box = await dm.boundingBox();
  if (!box) throw new Error('data-manager not found');

  await page.screenshot({
    path: `${OUT}/resource-roster-data-manager.png`,
    clip: { x: box.x, y: box.y, width: Math.min(box.width, 1280), height: Math.min(box.height, 700) },
  });
});

// ─── 13. Initiative panel: resources section ─────────────────────────────────

test('initiative-panel-resource-assignment', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loadApp(page);

  // Select then open the first initiative
  await page.waitForSelector('[data-testid^="initiative-bar"]', { timeout: 15000 });
  const initBar = page.locator('[data-testid^="initiative-bar"]').first();
  await initBar.click();
  await initBar.locator('[data-testid="initiative-edit"]').click();
  await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 8000 });

  // Scroll the resources section into view
  const resourcesSection = page.locator('[data-testid="initiative-resources-section"]');
  await resourcesSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const panel = page.locator('[data-testid="initiative-panel"]');
  const panelBox = await panel.boundingBox();
  if (!panelBox) throw new Error('initiative-panel not found');

  const resourcesBox = await resourcesSection.boundingBox();
  if (!resourcesBox) throw new Error('initiative-resources-section not found');

  // Crop to show the panel from owner field down to the resources checklist
  await page.screenshot({
    path: `${OUT}/initiative-panel-resource-assignment.png`,
    clip: {
      x: panelBox.x,
      y: Math.max(panelBox.y, resourcesBox.y - 120),
      width: panelBox.width,
      height: Math.min(resourcesBox.height + 160, 700),
    },
  });
});

// ─── 14. Mobile card view ────────────────────────────────────────────────────

test('mobile-card-view', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 812 });
  await loadMobileApp(page);
  await page.waitForTimeout(500);

  await page.screenshot({
    path: `${OUT}/mobile-card-view.png`,
    clip: { x: 0, y: 0, width: 393, height: 812 },
  });
});

// ─── 15. Mobile settings sheet ───────────────────────────────────────────────

test('mobile-settings-sheet', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 812 });
  await loadMobileApp(page);

  await page.getByTestId('mobile-settings-btn').click();
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { timeout: 5000 });
  await page.waitForTimeout(300);

  await page.screenshot({
    path: `${OUT}/mobile-settings-sheet.png`,
    clip: { x: 0, y: 0, width: 393, height: 812 },
  });
});
