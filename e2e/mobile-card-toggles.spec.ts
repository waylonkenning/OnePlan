import { test, expect } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Page = import('@playwright/test').Page;

async function openSettings(page: Page) {
  await page.locator('[data-testid="mobile-settings-btn"]').click();
  await page.waitForSelector('[data-testid="mobile-settings-sheet"]');
}

async function closeSettings(page: Page) {
  await page.keyboard.press('Escape');
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
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 20000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 20000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  await tutorialModal.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

// ─── Display toggles ──────────────────────────────────────────────────────────

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

// ─── DTS fields (US-27) ───────────────────────────────────────────────────────

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
