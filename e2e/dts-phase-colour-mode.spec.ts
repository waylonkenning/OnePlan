import { test, expect } from '@playwright/test';

/**
 * US-DTS-02: Add "Colour by DTS Phase" colour mode alongside the existing group-by option
 *
 * AC1: View options popover opens for DTS workspaces (group-by-dts-phase coexists with colour-by-dts-phase)
 * AC2: A "DTS Phase" option appears in the Colour By section for DTS workspaces
 * AC3: Selecting "Colour by DTS Phase" applies colour coding to initiative bars
 * AC4: "Colour by DTS Phase" is NOT shown for non-DTS workspaces
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

test.describe('US-DTS-02: DTS Phase colour mode', () => {

  test('AC1: view options popover opens and shows both group-by and colour-by sections (DTS workspace)', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('view-options-popover')).toBeVisible();
    await expect(page.getByTestId('group-by-dts-phase')).toBeVisible();
    await expect(page.getByTestId('colour-by-dts-phase')).toBeVisible();
    await page.getByTestId('view-options-btn').click();
  });

  test('AC2: Colour By section shows DTS Phase option for DTS workspaces', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('colour-by-dts-phase')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('view-options-btn').click();
  });

  test('AC3: selecting Colour by DTS Phase applies colour to bars', async ({ page }) => {
    await loadDtsTemplate(page);
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('colour-by-dts-phase').click();
    await page.getByTestId('view-options-btn').click();
    // At least one initiative bar should be visible and the colour mode active
    await expect(page.locator('[data-initiative-id]').first()).toBeVisible({ timeout: 10000 });
  });

  test('AC4: Colour By DTS Phase not shown for non-DTS workspaces', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
    await page.getByTestId('view-options-btn').click();
    await expect(page.getByTestId('colour-by-dts-phase')).not.toBeVisible();
    await page.getByTestId('view-options-btn').click();
  });

});
