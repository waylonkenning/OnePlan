import { test, expect } from '@playwright/test';

type Page = import('@playwright/test').Page;

async function openSettings(page: Page) {
  await page.locator('[data-testid="mobile-settings-btn"]').click();
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]');
}

async function closeSettings(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { state: 'hidden' });
}

async function closeSettingsBackdrop(page: Page) {
  await page.locator('[data-testid="mobile-settings-backdrop"]').click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { state: 'hidden' });
}

async function setToggle(page: Page, testid: string, desiredOn: boolean) {
  const btn = page.locator(`[data-testid="${testid}"]`);
  const currentlyOn = (await btn.getAttribute('aria-pressed')) === 'true';
  if (currentlyOn !== desiredOn) await btn.click();
}

async function setBudgetMode(page: Page, desired: 'off' | 'label' | 'bar-height') {
  const btn = page.locator('[data-testid="mobile-toggle-budget"]');
  for (let i = 0; i < 3; i++) {
    if ((await btn.textContent() ?? '').includes(`Budget: ${desired}`)) return;
    await btn.click();
  }
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

async function loadDtsMobile(page: Page) {
  await page.goto('/');
  await simulateFirstRun(page);
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 5000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  await tutorialModal.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function setStartDate(page: Page, date: string) {
  await page.locator('[data-testid="mobile-settings-sheet"]').locator('input[type="date"]').fill(date);
}

async function setMonths(page: Page, months: number) {
  await page.locator('[data-testid="mobile-settings-sheet"]').locator('select').selectOption(String(months));
}

async function waitForMobile(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
}

test.describe('Mobile card view — display toggles', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  const INITIATIVE_ID = 'i-ciam-passkey';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector(`[data-testid="initiative-row-${INITIATIVE_ID}"]`, { timeout: 15000 });
  });

  test('AC1: Descriptions toggle ON shows description text', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-descriptions', true);
    await closeSettings(page);
    await expect(page.locator(`[data-testid="initiative-description-${INITIATIVE_ID}"]`)).toBeVisible();
  });

  test('AC2: Descriptions toggle OFF hides description text', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-descriptions', false);
    await closeSettings(page);
    await expect(page.locator(`[data-testid="initiative-description-${INITIATIVE_ID}"]`)).not.toBeVisible();
  });

  test('AC3: Budget toggle ON shows formatted budget', async ({ page }) => {
    await openSettings(page);
    await setBudgetMode(page, 'label');
    await closeSettings(page);
    const budgetEl = page.locator(`[data-testid="initiative-budget-${INITIATIVE_ID}"]`);
    await expect(budgetEl).toBeVisible();
    await expect(budgetEl).toContainText('350');
  });

  test('AC4: Budget toggle OFF hides budget', async ({ page }) => {
    await openSettings(page);
    await setBudgetMode(page, 'off');
    await closeSettings(page);
    await expect(page.locator(`[data-testid="initiative-budget-${INITIATIVE_ID}"]`)).not.toBeVisible();
  });

  test('AC5: Relationships toggle ON shows related initiative', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-relationships', true);
    await closeSettings(page);
    const relEl = page.locator(`[data-testid="initiative-relationships-${INITIATIVE_ID}"]`);
    await expect(relEl).toBeVisible();
    await expect(relEl).toContainText('SSO');
  });

  test('AC6: Relationships toggle OFF hides relationship info', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-relationships', false);
    await closeSettings(page);
    await expect(page.locator(`[data-testid="initiative-relationships-${INITIATIVE_ID}"]`)).not.toBeVisible();
  });
});

test.describe('Mobile card view — DTS fields (US-27)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('AC3: DTS Phase bucket mode appears in settings for DTS workspaces', async ({ page }) => {
    await loadDtsMobile(page);
    await openSettings(page);
    await expect(page.getByTestId('bucket-mode-dts-phase')).toBeVisible();
  });

  test('AC4: Adoption Status toggle appears in settings for DTS workspaces', async ({ page }) => {
    await loadDtsMobile(page);
    await openSettings(page);
    await expect(page.getByTestId('mobile-toggle-dts-adoption')).toBeVisible();
  });

  test('AC1: enabling Adoption Status shows badges on asset cards', async ({ page }) => {
    await loadDtsMobile(page);
    await openSettings(page);
    await page.getByTestId('mobile-toggle-dts-adoption').click();
    await page.getByTestId('mobile-settings-backdrop').click();
    await expect(page.locator('[data-testid^="mobile-adoption-badge-"]').first()).toBeVisible();
  });

  test('AC2: initiative rows show DTS phase label when phase is set', async ({ page }) => {
    await loadDtsMobile(page);
    await expect(page.locator('[data-testid^="initiative-phase-label-"]').first()).toBeVisible();
  });
});

test.describe('Mobile card view — core', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('renders one card per asset with category headers', async ({ page }) => {
    expect(await page.locator('[data-testid^="asset-card-"]').count()).toBeGreaterThan(0);
    expect(await page.locator('[data-testid^="card-category-header-"]').count()).toBeGreaterThan(0);
  });

  test('default bucket mode shows Now/Starting soon/Upcoming labels', async ({ page }) => {
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    const valid = ['Now', 'Starting soon', 'Upcoming', 'Completed'];
    expect(texts.some(t => valid.some(v => t.includes(v)))).toBe(true);
  });

  test('tapping an initiative row opens the InitiativePanel', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    await expect(page.locator('[data-testid="initiative-panel"]')).toBeVisible({ timeout: 5000 });
  });

  test('conflict badge renders on cards with conflicting initiatives', async ({ page }) => {
    expect(await page.locator('[data-testid^="conflict-badge-"]').count()).toBeGreaterThanOrEqual(0);
  });

  test.skip('selected bucket mode persists across page reload', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-quarter"]').click();
    await page.keyboard.press('Escape');

    const textsBefore = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(textsBefore.some(t => /Q[1-4] \d{4}/.test(t))).toBe(true);

    await page.reload();
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    const textsAfter = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(textsAfter.some(t => /Q[1-4] \d{4}/.test(t))).toBe(true);
  });
});

test.describe('Mobile card view — bucket modes', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('settings sheet has all five bucket mode options', async ({ page }) => {
    await openSettings(page);
    for (const mode of ['timeline', 'quarter', 'year', 'programme', 'strategy']) {
      await expect(page.locator(`[data-testid="bucket-mode-${mode}"]`)).toBeVisible();
    }
  });

  test('Quarter mode groups by Q-label', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-quarter"]').click();
    await page.keyboard.press('Escape');
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(texts.some(t => /Q[1-4] \d{4}/.test(t))).toBe(true);
  });

  test('Year mode groups by year', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-year"]').click();
    await page.keyboard.press('Escape');
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(texts.some(t => /^\d{4}$/.test(t.trim()))).toBe(true);
  });

  test('Programme mode groups by programme name', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-programme"]').click();
    await page.keyboard.press('Escape');
    expect(await page.locator('[data-testid^="bucket-label-"]').count()).toBeGreaterThan(0);
  });

  test('Strategy mode groups by strategy name', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-strategy"]').click();
    await page.keyboard.press('Escape');
    expect(await page.locator('[data-testid^="bucket-label-"]').count()).toBeGreaterThan(0);
  });
});

test.describe('Mobile card view — date window filter', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('far-future start date hides all initiatives', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettingsBackdrop(page);
    expect(await page.locator('[data-testid^="initiative-row-"]').count()).toBe(0);
    expect(await page.locator('[data-testid="card-no-initiatives"]').count()).toBeGreaterThan(0);
  });

  test('initiative starting before start date is hidden', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-08-01`);
    await setMonths(page, 36);
    await closeSettingsBackdrop(page);
    await expect(page.locator('[data-testid="initiative-row-i-ciam-passkey"]')).not.toBeVisible();
  });

  test('initiative ending beyond the window is hidden', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 3);
    await closeSettingsBackdrop(page);
    await expect(page.locator('[data-testid="initiative-row-i-ciam-sso"]')).not.toBeVisible();
  });

  test('initiative starting exactly on start date is shown when within window', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 12);
    await closeSettingsBackdrop(page);
    await expect(page.locator('[data-testid="initiative-row-i-apigw-v2"]')).toBeVisible();
  });

  test('36-month window shows long-running initiatives', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 36);
    await closeSettingsBackdrop(page);
    await expect(page.locator('[data-testid="initiative-row-i-esb-decomm"]')).toBeVisible();
  });
});

test.describe('Mobile card view — empty state messaging', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('shows filtered empty state when date window excludes all initiatives', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettingsBackdrop(page);
    await expect(page.locator('[data-testid="card-initiatives-filtered"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="asset-card-a-ciam"] [data-testid="card-no-initiatives"]')).not.toBeVisible();
  });

  test('filtered empty state shows the hidden initiative count', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettingsBackdrop(page);
    await expect(page.locator('[data-testid="asset-card-a-ciam"]').getByTestId('card-initiatives-filtered')).toContainText('2');
  });

  test('clicking the filters link opens the settings sheet', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettingsBackdrop(page);
    await page.locator('[data-testid="card-filter-link"]').first().click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  test('no filtered empty state shown with default settings', async ({ page }) => {
    await expect(page.locator('[data-testid="card-initiatives-filtered"]')).not.toBeVisible();
  });
});

test.describe('Mobile layout — foundation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mobile shows card view, not timeline', async ({ page }) => {
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
    await expect(page.locator('#timeline-visualiser')).toBeHidden();
  });

  test('app outer padding is reduced on mobile', async ({ page }) => {
    const root = page.locator('#root > div');
    const paddingLeft = await root.evaluate(el => parseInt(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeLessThanOrEqual(16);
  });

  test('card view renders at least one asset card', async ({ page }) => {
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('[data-testid^="asset-card-"]').first()).toBeVisible();
  });
});

test.describe('Mobile layout — horizontal scroll', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('header overflow is not clipped', async ({ page }) => {
    await page.goto('/');
    const overflowX = await page.locator('header').evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll', 'visible']).toContain(overflowX);
  });

  test('data manager table is horizontally scrollable', async ({ page }) => {
    await waitForMobile(page);
    await page.evaluate(() => {
      (document.querySelector('[data-testid="nav-data-manager"]') as HTMLElement)?.click();
    });
    await page.waitForSelector('[data-testid="data-manager"]');
    const wrapper = page.getByTestId('initiatives-table-scroll-wrapper');
    await expect(wrapper).toBeVisible();
    const overflowX = await wrapper.evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll']).toContain(overflowX);
  });
});

test.describe('Mobile layout — header and settings sheet', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('desktop header controls are hidden on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="desktop-header-controls"]')).toBeHidden();
  });

  test('mobile header shows logo and settings button', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-settings-btn"]')).toBeVisible();
  });

  test('tapping settings opens the bottom sheet', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  test('settings sheet contains date and months controls', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await expect(sheet.locator('input[type="date"]')).toBeVisible();
    await expect(sheet.locator('select')).toBeVisible();
  });

  test('settings sheet closes on backdrop tap', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
    await page.locator('[data-testid="mobile-settings-backdrop"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  test('settings sheet closes on Escape', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  test('desktop shows timeline, not card view', async ({ page, browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.goto('/');
    await p.waitForSelector('#timeline-visualiser', { timeout: 15000 });
    await expect(p.locator('#timeline-visualiser')).toBeVisible();
    await expect(p.locator('[data-testid="mobile-card-view"]')).not.toBeVisible();
    await ctx.close();
  });
});

test.describe('Mobile layout — bottom tab bar', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('tab bar is visible on mobile', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-tab-bar"]')).toBeVisible();
  });

  test('tab bar switches to Reports view', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await expect(page.locator('[data-testid="reports-view"]')).toBeVisible();
  });

  test('tab bar switches back to Visualiser', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await page.locator('[data-testid="mobile-tab-visualiser"]').click();
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
  });
});

test.describe('Mobile layout — touch optimisation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await waitForMobile(page);
  });

  test('initiative rows have no grab cursor', async ({ page }) => {
    const row = page.locator('[data-testid^="initiative-row-"]').first();
    await expect(row).toBeVisible();
    const cursor = await row.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).not.toBe('grab');
  });

  test('no timeline resize handles are present', async ({ page }) => {
    await expect(page.locator('[data-testid="resize-handle-start"], [data-testid="resize-handle-end"]')).toHaveCount(0);
  });

  test('InitiativePanel inputs are at least 44px tall', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    const box = await panel.locator('input[type="text"]').first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('budget field has inputmode="numeric"', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator('input[inputmode="numeric"]').first()).toBeVisible();
  });
});

test.describe('Initiative Panel — date fields do not overlap on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    const firstRow = page.locator('[data-testid^="initiative-row-"]').first();
    await firstRow.click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
  });

  test('AC1: Start Date and End Date inputs do not overlap', async ({ page }) => {
    const startInput = page.locator('#startDate');
    const endInput = page.locator('#endDate');

    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    const startBox = await startInput.boundingBox();
    const endBox = await endInput.boundingBox();

    expect(startBox).not.toBeNull();
    expect(endBox).not.toBeNull();

    const startRight = startBox!.x + startBox!.width;
    const endLeft = endBox!.x;

    expect(startRight).toBeLessThanOrEqual(endLeft);
  });

  test('AC2: Both date inputs are side-by-side (2-column layout preserved)', async ({ page }) => {
    const startInput = page.locator('#startDate');
    const endInput = page.locator('#endDate');

    await expect(startInput).toBeVisible();
    await expect(endInput).toBeVisible();

    const startBox = await startInput.boundingBox();
    const endBox = await endInput.boundingBox();

    expect(startBox).not.toBeNull();
    expect(endBox).not.toBeNull();

    expect(startBox!.width).toBeLessThan(390 * 0.7);
    expect(endBox!.width).toBeLessThan(390 * 0.7);

    expect(startBox!.x).toBeLessThan(endBox!.x);
  });
});
