import { test, expect, Page } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function openSettings(page: Page) {
  await page.locator('[data-testid="mobile-settings-btn"]').click();
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]');
}

async function closeSettings(page: Page) {
  await page.locator('[data-testid="mobile-settings-backdrop"]').click({ position: { x: 10, y: 10 } });
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { state: 'hidden' });
}

async function closeSettingsEsc(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]', { state: 'hidden' });
}

async function setStartDate(page: Page, date: string) {
  await page.locator('[data-testid="mobile-settings-sheet"]').locator('input[type="date"]').fill(date);
}

async function setMonths(page: Page, months: number) {
  await page.locator('[data-testid="mobile-settings-sheet"]').locator('select').selectOption(String(months));
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
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 10000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 10000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  await tutorialModal.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

// ─── Mobile layout foundation ─────────────────────────────────────────────────

test.describe('Mobile layout — foundation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('mobile shows card view (not timeline) with at least one asset card', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
    await expect(page.locator('#timeline-visualiser')).toBeHidden();
    await expect(page.locator('[data-testid^="asset-card-"]').first()).toBeVisible();
  });

  test('app outer padding is reduced on mobile', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root > div');
    const paddingLeft = await root.evaluate(el => parseInt(getComputedStyle(el).paddingLeft));
    expect(paddingLeft).toBeLessThanOrEqual(16);
  });

  test('desktop shows timeline and not card view', async ({ page, browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.goto('/');
    await p.waitForSelector('#timeline-visualiser', { timeout: 15000 });
    await expect(p.locator('#timeline-visualiser')).toBeVisible();
    await expect(p.locator('[data-testid="mobile-card-view"]')).not.toBeVisible();
    await ctx.close();
  });
});

// ─── Horizontal scroll ────────────────────────────────────────────────────────

test.describe('Mobile layout — horizontal scroll', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('header overflow is not clipped', async ({ page }) => {
    await page.goto('/');
    const overflowX = await page.locator('header').evaluate(el => getComputedStyle(el).overflowX);
    expect(['auto', 'scroll', 'visible']).toContain(overflowX);
  });

  test('data manager table is horizontally scrollable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
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

// ─── Header and settings sheet ────────────────────────────────────────────────

test.describe('Mobile layout — header and settings sheet', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mobile header is visible and desktop controls are hidden', async ({ page }) => {
    await expect(page.locator('[data-testid="desktop-header-controls"]')).toBeHidden();
    await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-settings-btn"]')).toBeVisible();
  });

  test('tapping settings opens the bottom sheet with date and months controls', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    const sheet = page.locator('[data-testid="mobile-settings-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('input[type="date"]')).toBeVisible();
    await expect(sheet.locator('select')).toBeVisible();
  });

  test('settings sheet closes on backdrop tap', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await page.locator('[data-testid="mobile-settings-backdrop"]').click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });

  test('settings sheet closes on Escape', async ({ page }) => {
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeHidden();
  });
});

// ─── Bottom tab bar ───────────────────────────────────────────────────────────

test.describe('Mobile layout — bottom tab bar', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('tab bar is visible with only Visualiser and Reports tabs (no Data tab)', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-tab-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-visualiser"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-reports"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-data"]')).not.toBeVisible();
  });

  test('tab bar switches to Reports and back to Visualiser', async ({ page }) => {
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await expect(page.locator('[data-testid="reports-view"]')).toBeVisible();
    await page.locator('[data-testid="mobile-tab-visualiser"]').click();
    await expect(page.locator('[data-testid="mobile-card-view"]')).toBeVisible();
  });

  test('footer is hidden on mobile', async ({ page }) => {
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('footer')).toBeHidden();
  });
});

// ─── Touch optimisation ───────────────────────────────────────────────────────

test.describe('Mobile layout — touch optimisation', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('initiative rows have no grab cursor and no timeline resize handles', async ({ page }) => {
    const row = page.locator('[data-testid^="initiative-row-"]').first();
    await expect(row).toBeVisible();
    const cursor = await row.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).not.toBe('grab');
    await expect(page.locator('[data-testid="resize-handle-start"], [data-testid="resize-handle-end"]')).toHaveCount(0);
  });

  test('InitiativePanel inputs are at least 44px tall with numeric inputmode on budget', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const box = await panel.locator('input[type="text"]').first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await expect(panel.locator('input[inputmode="numeric"]').first()).toBeVisible();
  });
});

// ─── Card view core ───────────────────────────────────────────────────────────

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

  test('default bucket mode shows timeline-style labels (Now/Starting soon/Upcoming)', async ({ page }) => {
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    const valid = ['Now', 'Starting soon', 'Upcoming', 'Completed'];
    expect(texts.some(t => valid.some(v => t.includes(v)))).toBe(true);
  });

  test('tapping an initiative row opens the InitiativePanel', async ({ page }) => {
    await page.locator('[data-testid^="initiative-row-"]').first().click();
    await expect(page.locator('[data-testid="initiative-panel"]')).toBeVisible({ timeout: 5000 });
  });
});

// ─── Bucket modes ─────────────────────────────────────────────────────────────

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

  test('Year mode groups by year label', async ({ page }) => {
    await openSettings(page);
    await page.locator('[data-testid="bucket-mode-year"]').click();
    await page.keyboard.press('Escape');
    const texts = await page.locator('[data-testid^="bucket-label-"]').allTextContents();
    expect(texts.some(t => /^\d{4}$/.test(t.trim()))).toBe(true);
  });

  test('Programme and Strategy modes produce bucket labels', async ({ page }) => {
    for (const mode of ['programme', 'strategy']) {
      await openSettings(page);
      await page.locator(`[data-testid="bucket-mode-${mode}"]`).click();
      await page.keyboard.press('Escape');
      expect(await page.locator('[data-testid^="bucket-label-"]').count()).toBeGreaterThan(0);
    }
  });

  test('selected bucket mode persists across page reload', async ({ page }) => {
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

// ─── Date window filter ───────────────────────────────────────────────────────

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
    await closeSettings(page);
    expect(await page.locator('[data-testid^="initiative-row-"]').count()).toBe(0);
    expect(await page.locator('[data-testid="card-no-initiatives"]').count()).toBeGreaterThan(0);
  });

  test('initiative starting before start date is hidden', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-08-01`);
    await setMonths(page, 36);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-ciam-passkey"]')).not.toBeVisible();
  });

  test('initiative within the date window is visible', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 12);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-apigw-v2"]')).toBeVisible();
  });

  test('initiative ending beyond the window is hidden', async ({ page }) => {
    const year = new Date().getFullYear();
    await openSettings(page);
    await setStartDate(page, `${year}-01-01`);
    await setMonths(page, 3);
    await closeSettings(page);
    await expect(page.locator('[data-testid="initiative-row-i-ciam-sso"]')).not.toBeVisible();
  });
});

// ─── Empty state messaging ────────────────────────────────────────────────────

test.describe('Mobile card view — empty state messaging', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
  });

  test('shows filtered empty state with hidden initiative count when date window excludes all', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);

    await expect(page.locator('[data-testid="card-initiatives-filtered"]').first()).toBeVisible();
    await expect(
      page.locator('[data-testid="asset-card-a-ciam"]').getByTestId('card-initiatives-filtered')
    ).toContainText('2');
  });

  test('clicking the filters link in filtered empty state opens the settings sheet', async ({ page }) => {
    await openSettings(page);
    await setStartDate(page, '2099-01-01');
    await setMonths(page, 36);
    await closeSettings(page);
    await page.locator('[data-testid="card-filter-link"]').first().click();
    await expect(page.locator('[data-testid="mobile-settings-sheet"]')).toBeVisible();
  });

  test('no filtered empty state shown with default settings', async ({ page }) => {
    await expect(page.locator('[data-testid="card-initiatives-filtered"]')).not.toBeVisible();
  });
});

// ─── Display toggles ──────────────────────────────────────────────────────────

test.describe('Mobile card view — display toggles', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  const INITIATIVE_ID = 'i-ciam-passkey';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector(`[data-testid="initiative-row-${INITIATIVE_ID}"]`, { timeout: 15000 });
  });

  test('descriptions toggle ON shows text, OFF hides it', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-descriptions', true);
    await closeSettingsEsc(page);
    await expect(page.locator(`[data-testid="initiative-description-${INITIATIVE_ID}"]`)).toBeVisible();

    await openSettings(page);
    await setToggle(page, 'mobile-toggle-descriptions', false);
    await closeSettingsEsc(page);
    await expect(page.locator(`[data-testid="initiative-description-${INITIATIVE_ID}"]`)).not.toBeVisible();
  });

  test('budget toggle ON shows formatted budget, OFF hides it', async ({ page }) => {
    await openSettings(page);
    await setBudgetMode(page, 'label');
    await closeSettingsEsc(page);
    const budgetEl = page.locator(`[data-testid="initiative-budget-${INITIATIVE_ID}"]`);
    await expect(budgetEl).toBeVisible();
    await expect(budgetEl).toContainText('350');

    await openSettings(page);
    await setBudgetMode(page, 'off');
    await closeSettingsEsc(page);
    await expect(page.locator(`[data-testid="initiative-budget-${INITIATIVE_ID}"]`)).not.toBeVisible();
  });

  test('relationships toggle ON shows related initiatives, OFF hides them', async ({ page }) => {
    await openSettings(page);
    await setToggle(page, 'mobile-toggle-relationships', true);
    await closeSettingsEsc(page);
    const relEl = page.locator(`[data-testid="initiative-relationships-${INITIATIVE_ID}"]`);
    await expect(relEl).toBeVisible();
    await expect(relEl).toContainText('SSO');

    await openSettings(page);
    await setToggle(page, 'mobile-toggle-relationships', false);
    await closeSettingsEsc(page);
    await expect(page.locator(`[data-testid="initiative-relationships-${INITIATIVE_ID}"]`)).not.toBeVisible();
  });
});

// ─── DTS fields ───────────────────────────────────────────────────────────────

test.describe('Mobile card view — DTS fields', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('DTS Phase bucket mode appears in settings for DTS workspaces', async ({ page }) => {
    await loadDtsMobile(page);
    await openSettings(page);
    await expect(page.getByTestId('bucket-mode-dts-phase')).toBeVisible();
  });

  test('Adoption Status toggle appears in settings for DTS workspaces', async ({ page }) => {
    await loadDtsMobile(page);
    await openSettings(page);
    await expect(page.getByTestId('mobile-toggle-dts-adoption')).toBeVisible();
  });

  test('enabling Adoption Status shows badges on asset cards', async ({ page }) => {
    await loadDtsMobile(page);
    await openSettings(page);
    await page.getByTestId('mobile-toggle-dts-adoption').click();
    await page.getByTestId('mobile-settings-backdrop').click();
    await expect(page.locator('[data-testid^="mobile-adoption-badge-"]').first()).toBeVisible();
  });

  test('initiative rows show DTS phase label when phase is set', async ({ page }) => {
    await loadDtsMobile(page);
    await expect(page.locator('[data-testid^="initiative-phase-label-"]').first()).toBeVisible();
  });
});

// ─── Initiative Panel date fields ─────────────────────────────────────────────

test.describe('Initiative Panel — date fields do not overlap on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await page.locator('[data-testid^="initiative-row-"]').first().click();
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

    expect(startBox!.x + startBox!.width).toBeLessThanOrEqual(endBox!.x);
  });

  test('AC2: Both date inputs are side-by-side (each less than 70% of viewport width)', async ({ page }) => {
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
