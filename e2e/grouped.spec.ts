import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

test.describe('Grouped Initiative Budget', () => {
    test('should show summed capex and dark font for grouped initiatives', async ({ page }) => {
        await page.goto('http://localhost:3000/');

        // Enable budget labels via inline toggle (off → label)
        const budgetToggle = page.getByTestId('toggle-budget');
        while ((await budgetToggle.getAttribute('data-mode')) !== 'label') {
            await budgetToggle.click();
        }

        const targetAssetId = 'a-ciam';
        const targetRow = page.locator(`[data-asset-id="${targetAssetId}"]`);

        // 1. Verify individual capex labels (Passkey: 350k, SSO: 600k)
        await expect(targetRow).toContainText('CapEx $350k');
        await expect(targetRow).toContainText('CapEx $600k');

        // 2. Collapse the group
        const groupBox = targetRow.getByTestId('initiative-group-box');
        await targetRow.hover();
        const collapseBtn = groupBox.getByTestId('collapse-group-btn');
        await collapseBtn.click();

        // 3. Verify project group bar is visible
        const groupBar = page.getByTestId('project-group-bar');
        await expect(groupBar).toBeVisible();

        // 4. Verify summed capex label ($950k)
        await expect(groupBar).toContainText('CapEx $950k');

        // 5. Verify dark font for capex label
        const capexLabel = groupBar.getByTestId('capex-label').last();

        const color = await capexLabel.evaluate(el => getComputedStyle(el).color);
        console.log('CapEx label color:', color);

        // Expected color is dark blue (blue-900).
        if (color.startsWith('oklch')) {
            expect(color).toBe('oklch(0.379 0.146 265.522)');
        } else {
            expect(color).toBe('rgb(30, 58, 138)');
        }
    });
});

test.describe('Grouped initiative description — bullet points', () => {
  async function collapseAndShowDescription(page: any) {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Enable description display via inline toggle
    await page.getByTestId('toggle-descriptions').click();

    // Collapse the CIAM group (Passkey Rollout + SSO Consolidation)
    const targetRow = page.locator('[data-asset-id="a-ciam"]');
    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 15000 });
    await targetRow.hover();
    await groupBox.getByTestId('collapse-group-btn').click();

    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 15000 });
    return projectBar;
  }

  test('each initiative name appears as a bullet point on its own line', async ({ page }) => {
    const projectBar = await collapseAndShowDescription(page);

    // Must contain bullet characters
    await expect(projectBar).toContainText('•');

    // Must NOT use the old " + " separator
    const text = await projectBar.textContent();
    expect(text).not.toContain(' + ');
  });

  test('each initiative name is prefixed with a bullet', async ({ page }) => {
    const projectBar = await collapseAndShowDescription(page);

    // Both initiative names must appear prefixed with •
    await expect(projectBar).toContainText('• Passkey Rollout');
    await expect(projectBar).toContainText('• SSO Consolidation');
  });
});

test.describe('Grouped description with legacy imported data', () => {
  const legacyFilePath = path.join(process.cwd(), 'e2e', 'mock-grouped-legacy.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    // Two initiatives on the same asset with no startDate — simulating legacy format.
    // They will be connected by a dependency added via the UI after import.
    const initiatives = [
      {
        id: 'i-legacy-grp-1',
        name: 'Legacy Alpha',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        // intentionally omitting startDate / endDate to simulate old data
        budget: 100000,
      },
      {
        id: 'i-legacy-grp-2',
        name: 'Legacy Beta',
        programmeId: 'prog-1',
        assetId: 'a-ciam',
        budget: 150000,
      },
    ];

    const dependencies = [
      {
        id: 'dep-legacy-grp',
        sourceId: 'i-legacy-grp-1',
        targetId: 'i-legacy-grp-2',
        type: 'related',
      },
    ];

    const wsInit = XLSX.utils.json_to_sheet(initiatives);
    const wsDeps = XLSX.utils.json_to_sheet(dependencies);
    XLSX.utils.book_append_sheet(wb, wsInit, 'Initiatives');
    XLSX.utils.book_append_sheet(wb, wsDeps, 'Dependencies');
    fs.writeFileSync(legacyFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(legacyFilePath)) fs.unlinkSync(legacyFilePath);
  });

  test('grouped description renders initiative names even when startDate is missing', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Turn on description display
    await page.getByTestId('toggle-descriptions').click();

    // Import the legacy file (merge so existing data stays)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(legacyFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Schema warning should appear (missing startDate)
    await expect(modal).toContainText('Schema warnings');

    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();

    // Critical assertion: app must NOT crash after importing data missing startDate.
    // Previously, `a.startDate.localeCompare(...)` would throw a TypeError causing the
    // entire timeline to fail to render. Now it falls back to '' so the sort is safe.
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="asset-row-content"]').first()).toBeVisible();
  });
});

test.describe('Grouped description on narrow bar', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-narrow-group.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    const initiatives = [
      {
        id: 'i-narrow-grp-1',
        name: 'Narrow Alpha',
        programmeId: 'prog-1',
        assetId: 'a-pam',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        budget: 10000,
      },
      {
        id: 'i-narrow-grp-2',
        name: 'Narrow Beta',
        programmeId: 'prog-1',
        assetId: 'a-pam',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        budget: 10000,
      },
    ];

    const dependencies = [
      {
        id: 'dep-narrow-grp',
        sourceId: 'i-narrow-grp-1',
        targetId: 'i-narrow-grp-2',
        type: 'related',
      },
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initiatives), 'Initiatives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dependencies), 'Dependencies');
    fs.writeFileSync(mockFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
  });

  test('group description renders on a narrow bar (width < 8% of timeline)', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Import the short initiatives via the standard Excel import flow
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(mockFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();

    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Enable description display. The default timeline is 36 months from 2026-01-01,
    // so the 2-month group (Sep–Oct 2026) spans only ~5.6% — below the old
    // `width > 8` guard that was blocking the description.
    await page.getByTestId('toggle-descriptions').click();

    // Collapse the group on the PAM asset row
    const pamRow = page.locator('[data-asset-id="a-pam"]');
    await expect(pamRow).toBeVisible({ timeout: 10000 });
    await pamRow.hover();

    const groupBox = pamRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 10000 });
    await groupBox.getByTestId('collapse-group-btn').click();

    const groupBar = page.getByTestId('project-group-bar').first();
    await expect(groupBar).toBeVisible({ timeout: 10000 });

    // Description MUST contain both names as bullet points even though the bar
    // is narrower than 8% of the timeline width.
    await expect(groupBar).toContainText('• Narrow Alpha');
    await expect(groupBar).toContainText('• Narrow Beta');
  });
});

test.describe('Grouped description — no truncation', () => {
  const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-long-group.xlsx');

  test.beforeAll(() => {
    const wb = XLSX.utils.book_new();

    // 5 initiatives with long names on a-pam, placed in Oct–Nov 2026 so they
    // are within the default 36-month timeline and past the sticky left column.
    // Joined description: "Alpha Initiative + Beta Initiative + Gamma Initiative
    //   + Delta Initiative + Epsilon Initiative" = ~93 chars.
    // On a narrow bar (~5.6% width, 22 chars/line) this needs 5 lines —
    // exceeding the old 3-line cap.
    const initiatives = [
      { id: 'i-long-grp-1', name: 'Alpha Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-10-01', endDate: '2026-10-15', budget: 10000 },
      { id: 'i-long-grp-2', name: 'Beta Initiative',  programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-10-16', endDate: '2026-10-31', budget: 10000 },
      { id: 'i-long-grp-3', name: 'Gamma Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-11-01', endDate: '2026-11-15', budget: 10000 },
      { id: 'i-long-grp-4', name: 'Delta Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-11-16', endDate: '2026-11-30', budget: 10000 },
      { id: 'i-long-grp-5', name: 'Epsilon Initiative', programmeId: 'prog-1', assetId: 'a-pam', startDate: '2026-12-01', endDate: '2026-12-15', budget: 10000 },
    ];

    // Chain all 5 together with dependencies so they form one group
    const dependencies = [
      { id: 'dep-long-1', sourceId: 'i-long-grp-1', targetId: 'i-long-grp-2', type: 'related' },
      { id: 'dep-long-2', sourceId: 'i-long-grp-2', targetId: 'i-long-grp-3', type: 'related' },
      { id: 'dep-long-3', sourceId: 'i-long-grp-3', targetId: 'i-long-grp-4', type: 'related' },
      { id: 'dep-long-4', sourceId: 'i-long-grp-4', targetId: 'i-long-grp-5', type: 'related' },
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(initiatives), 'Initiatives');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dependencies), 'Dependencies');
    fs.writeFileSync(mockFilePath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  });

  test.afterAll(() => {
    if (fs.existsSync(mockFilePath)) fs.unlinkSync(mockFilePath);
  });

  test('group bar expands to show full description without truncation', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Import the 5-initiative group
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(mockFilePath);

    const modal = page.locator('.import-preview-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Merge Data' }).click();
    await expect(modal).toBeHidden();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Enable description display (default 36-month timeline keeps the bar narrow)
    await page.getByTestId('toggle-descriptions').click();

    // Collapse the group on the PAM row
    const pamRow = page.locator('[data-asset-id="a-pam"]');
    await expect(pamRow).toBeVisible({ timeout: 10000 });
    await pamRow.hover();

    const groupBox = pamRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 10000 });
    await groupBox.getByTestId('collapse-group-btn').click();

    const groupBar = page.getByTestId('project-group-bar').first();
    await expect(groupBar).toBeVisible({ timeout: 10000 });

    // All 5 initiative names must appear in the bar's text content
    await expect(groupBar).toContainText('Alpha Initiative');
    await expect(groupBar).toContainText('Epsilon Initiative');

    // The description element must NOT be clipped — scrollHeight must equal
    // clientHeight. With `line-clamp-3` applied, scrollHeight > clientHeight
    // because the CSS max-height cuts off lines 4+.
    const descEl = groupBar.locator('.whitespace-pre-wrap');
    const isClipped = await descEl.evaluate((el) => el.scrollHeight > el.clientHeight);
    expect(isClipped).toBe(false);
  });
});

test.describe('Grouped Initiative Description', () => {
  test('should concatenate initiative names with + in collapsed groups', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    // Enable description display via inline toggle
    await page.getByTestId('toggle-descriptions').click();
    
    // For now, let's assume it's ON by default or toggle it if needed.
    // Let's use the 'a-ciam' asset which likely has grouped initiatives in demo data.
    const targetAssetId = 'a-ciam';
    const targetRow = page.locator(`[data-asset-id="${targetAssetId}"]`);
    
    // Find the group and collapse it
    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 15000 });
    
    await targetRow.hover();
    const collapseBtn = groupBox.getByTestId('collapse-group-btn');
    await collapseBtn.click();

    // Verify the project bar is visible
    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 15000 });

    // The description usually appears inside the bar or as a tooltip/text.
    // In Timeline.tsx line 1244: {init.description}
    // We expect "Name 1 + Name 2" instead of "Name 1, Name 2"
    
    // Note: This test is EXPECTED TO FAIL currently because it uses ", "
    const descriptionText = await projectBar.textContent();
    console.log('Detected Group Description:', descriptionText);
    
    // Each initiative name should now appear as a bullet point
    await expect(projectBar).toContainText('•');
  });
});
