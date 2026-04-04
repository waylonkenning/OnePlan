import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// ─── Helper Functions ─────────────────────────────────────────────────────────

type HelperPage = import('@playwright/test').Page;

async function loadDefault(page: HelperPage) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 15000 });
}

async function openDescriptions(page: HelperPage) {
  await page.getByTestId('toggle-descriptions').click();
}

async function enableBudgetLabels(page: HelperPage) {
  await page.getByTestId('toggle-budget').click();
}

async function load(page: HelperPage) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 15000 });
}

async function switchGroupBy(page: HelperPage, mode: 'asset' | 'programme' | 'strategy') {
  await page.getByTestId('view-options-btn').click();
  await expect(page.getByTestId('view-options-popover')).toBeVisible();
  await page.getByTestId(`group-by-${mode}`).click();
  await page.getByTestId('view-options-btn').click();
  await page.waitForSelector('[data-initiative-id]', { timeout: 10000 });
}

async function getFirstBar(page: HelperPage) {
  const bar = page.locator('[data-initiative-id]').first();
  await expect(bar).toBeVisible({ timeout: 10000 });
  return bar;
}

async function getFirstBarUX(page: HelperPage) {
  return page.locator('[data-testid^="initiative-bar-"]').first();
}

async function getFirstSegment(page: HelperPage) {
  return page.locator('[data-testid^="segment-bar-"]').first();
}

async function loadDtsWithDemo(page: HelperPage) {
  await page.goto('/');
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
  await page.waitForSelector('[data-testid="template-picker-modal"]', { timeout: 5000 });
  await page.getByTestId('template-select-with-demo-btn-dts').click();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  const tutorialModal = page.getByTestId('tutorial-modal');
  if (await tutorialModal.isVisible()) {
    await page.getByRole('button', { name: 'Close' }).first().click();
    await tutorialModal.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function createInitiativeViaDoubleClick(page: HelperPage): Promise<string> {
  const assetRow = page.locator('[data-testid="asset-row-content"]').first();
  await expect(assetRow).toBeVisible();
  const box = await assetRow.boundingBox();
  if (!box) throw new Error('No bounding box for asset row');

  await page.mouse.dblclick(box.x + box.width * 0.03, box.y + box.height / 2);

  const panel = page.locator('[data-testid="initiative-panel"]');
  await expect(panel).toBeVisible({ timeout: 5000 });

  const nameInput = panel.locator('#name');
  await nameInput.fill('Test Bug Initiative');
  await panel.getByRole('button', { name: 'Save Changes' }).click();
  await expect(panel).not.toBeVisible({ timeout: 5000 });

  const newBar = page.locator('[data-initiative-id]').filter({ hasText: 'Test Bug Initiative' }).first();
  await expect(newBar).toBeVisible({ timeout: 10000 });
  const id = await newBar.getAttribute('data-initiative-id');
  if (!id) throw new Error('No initiative id found');
  return id;
}

async function openViewOptions(page: HelperPage) {
  const popover = page.getByTestId('view-options-popover');
  if (!await popover.isVisible()) {
    await page.getByTestId('view-options-btn').click();
    await expect(popover).toBeVisible();
  }
}

async function switchGrouping(page: HelperPage, groupBy: 'programme' | 'strategy' | 'dts-phase') {
  await openViewOptions(page);
  await page.getByTestId(`group-by-${groupBy}`).click();
  await page.getByTestId('view-options-btn').click();
  await expect(page.getByTestId('view-options-popover')).not.toBeVisible();
}

const PASSKEY_BAR = '[data-initiative-id="i-ciam-passkey"]';

// ─── Tests ─────────────────────────────────────────────────────────────────────

/**
 * US-IE-04: Initiative Bar Content Layout
 *
 * AC1: Budget label renders as a small pill right-aligned on the title row
 * AC2: Description occupies a full-width row (not shared with budget or owner)
 * AC3: Owner avatar is absolutely positioned in the top-right corner, not inline
 * AC4: Description is capped at 2 lines with ellipsis (line-clamp-2)
 */
test.describe('US-IE-04: Initiative bar content layout', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: budget pill is visible on the title row', async ({ page }) => {
    await enableBudgetLabels(page);
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    await expect(bar.getByTestId('initiative-budget-pill')).toBeVisible();
  });

  test('AC1: budget pill is right-aligned within the title row', async ({ page }) => {
    await enableBudgetLabels(page);
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    const titleRow = bar.getByTestId('initiative-title-row');
    const pill = bar.getByTestId('initiative-budget-pill');
    await expect(titleRow).toBeVisible();
    await expect(pill).toBeVisible();

    const titleBox = await titleRow.boundingBox();
    const pillBox = await pill.boundingBox();
    expect(pillBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(pillBox!.x + pillBox!.width).toBeLessThanOrEqual(titleBox!.x + titleBox!.width + 4);
  });

  test('AC2: description row spans full bar width when descriptions enabled', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('A test description for layout validation.');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await openDescriptions(page);

    const descRow = bar.getByTestId('initiative-description-row');
    await expect(descRow).toBeVisible();

    const barBox = await bar.boundingBox();
    const descBox = await descRow.boundingBox();
    expect(descBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect(descBox!.width).toBeGreaterThan(barBox!.width * 0.8);
  });

  test('AC2: description row is not on the same row as the budget pill', async ({ page }) => {
    await enableBudgetLabels(page);
    const bar = page.locator(PASSKEY_BAR).first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill('Layout test description.');
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await openDescriptions(page);

    const pill = bar.getByTestId('initiative-budget-pill');
    const descRow = bar.getByTestId('initiative-description-row');
    await expect(pill).toBeVisible();
    await expect(descRow).toBeVisible();

    const pillBox = await pill.boundingBox();
    const descBox = await descRow.boundingBox();
    expect(descBox!.y).toBeGreaterThan(pillBox!.y);
  });

  test('AC3: owner avatar has position absolute', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    const avatar = bar.getByTestId('owner-badge').first();
    await expect(avatar).toBeVisible();
    const position = await avatar.evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('absolute');
  });

  test('AC3: owner avatar is pinned to the top-right of the bar', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await expect(bar).toBeVisible();
    const avatar = bar.getByTestId('owner-badge').first();
    await expect(avatar).toBeVisible();

    const barBox = await bar.boundingBox();
    const avatarBox = await avatar.boundingBox();
    expect(avatarBox).not.toBeNull();
    expect(barBox).not.toBeNull();

    expect(avatarBox!.y - barBox!.y).toBeLessThan(16);
    expect((barBox!.x + barBox!.width) - (avatarBox!.x + avatarBox!.width)).toBeLessThan(24);
  });

  test('AC4: description row has line-clamp-2 applied', async ({ page }) => {
    const bar = page.locator(PASSKEY_BAR).first();
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();
    await panel.getByLabel('Description').fill(
      'This is a very long description that should be clamped to two lines maximum. ' +
      'It contains enough text to overflow into a third line if line clamping is not applied correctly. ' +
      'Even more text to guarantee overflow beyond two lines in the bar.'
    );
    await panel.getByRole('button', { name: 'Save Changes' }).click();
    await expect(panel).toBeHidden();

    await openDescriptions(page);

    const descRow = bar.getByTestId('initiative-description-row');
    await expect(descRow).toBeVisible();
    const overflow = await descRow.evaluate(el => getComputedStyle(el).webkitLineClamp);
    expect(overflow).toBe('2');
  });
});

/**
 * Initiative bar parity across groupBy views.
 *
 * The initiative bar must have consistent UX features regardless of which
 * groupBy mode is active: Asset (primary), Programme, Strategy.
 *
 * Checks: selection highlight, action toolbar (edit + dep handle), resize
 * handles, progress overlay, owner badge.
 */
for (const mode of ['asset', 'programme', 'strategy'] as const) {
  test.describe(`Initiative bar parity — groupBy: ${mode}`, () => {
    test.beforeEach(async ({ page }) => {
      await load(page);
      if (mode !== 'asset') {
        await switchGroupBy(page, mode);
      }
    });

    test(`[${mode}] single-click gives dashed selection outline`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await expect(bar).toHaveCSS('outline-style', 'dashed');
    });

    test(`[${mode}] action toolbar appears on single-click`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
    });

    test(`[${mode}] edit button in toolbar opens InitiativePanel`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await page.getByTestId('initiative-action-edit').click();
      await expect(page.getByTestId('initiative-panel')).toBeVisible();
    });

    test(`[${mode}] dep handle in toolbar has correct testid and tooltip`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      const handle = page.getByTestId('initiative-action-link').first();
      await expect(handle).toBeVisible();
      const title = await handle.getAttribute('title');
      expect(title).toContain('dependency');
    });

    test(`[${mode}] dragging right edge resizes the bar`, async ({ page }) => {
      const bar = await getFirstBar(page);
      const box = await bar.boundingBox();
      expect(box).not.toBeNull();

      const initialWidth = box!.width;

      await page.mouse.move(box!.x + box!.width - 2, box!.y + box!.height / 2);
      await page.mouse.down();
      await page.mouse.move(box!.x + box!.width + 60, box!.y + box!.height / 2, { steps: 10 });
      await page.mouse.up();

      const newBox = await bar.boundingBox();
      expect(newBox!.width).toBeGreaterThan(initialWidth + 20);
    });

    test(`[${mode}] Escape clears selection and hides toolbar`, async ({ page }) => {
      const bar = await getFirstBar(page);
      await bar.click();
      await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('initiative-action-toolbar')).not.toBeVisible();
    });
  });
}

/**
 * Initiative Bar UX Improvements
 *
 * US-IE-01: Selection highlight — dashed high-contrast border replaces invisible white ring
 * US-IE-02: Floating action toolbar — edit/link icons above bar on single-click
 * US-IE-03: Relationship drag discoverability — chain icon + tooltip on drag handle
 * US-IE-04: Bar content layout — budget pill on title row, description full-width, owner pinned
 */
test.describe('US-IE-01: Initiative selection highlight', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: single-click gives bar a dashed outline', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    const outlineStyle = await bar.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outlineStyle).toBe('dashed');
  });

  test('AC2: clicking elsewhere removes the selection outline', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await page.locator('#timeline-visualiser').click({ position: { x: 50, y: 50 } });
    const outlineStyle = await bar.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outlineStyle).not.toBe('dashed');
  });

  test('AC3: selection outline is high-contrast slate (not white)', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await expect(bar).toHaveCSS('outline-color', 'rgb(30, 41, 59)');
  });

  test('AC3: outline style is distinct from critical-path amber ring', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    const outlineStyle = await bar.evaluate(el => getComputedStyle(el).outlineStyle);
    expect(outlineStyle).toBe('dashed');
  });
});

test.describe('US-IE-02: Floating action toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: single-click shows floating toolbar above the bar', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
  });

  test('AC2: Edit button in toolbar opens InitiativePanel', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(page.getByTestId('initiative-panel')).toBeVisible();
  });

  test('AC3: Link button in toolbar is present', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-link')).toBeVisible();
  });

  test('AC4: toolbar disappears when clicking elsewhere', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
    await page.locator('#timeline-visualiser').click({ position: { x: 50, y: 50 } });
    await expect(page.getByTestId('initiative-action-toolbar')).not.toBeVisible();
  });

  test('AC4: toolbar disappears on Escape', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-toolbar')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('initiative-action-toolbar')).not.toBeVisible();
  });
});

test.describe('US-IE-03: Relationship drag handle', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('AC1: drag handle is not visible when bar is not selected', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.hover();
    await expect(page.getByTestId('initiative-action-link').first()).not.toBeVisible();
  });

  test('AC1: drag handle becomes visible when bar is selected', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    await expect(page.getByTestId('initiative-action-link').first()).toBeVisible();
  });

  test('AC2: drag handle has descriptive tooltip', async ({ page }) => {
    const bar = await getFirstBarUX(page);
    await bar.click();
    const handle = page.getByTestId('initiative-action-link').first();
    const title = await handle.getAttribute('title');
    expect(title).toContain('dependency');
  });
});

test.describe('Segment UX — selection highlight', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('single-click gives segment a dashed outline', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(seg).toHaveCSS('outline-style', 'dashed');
  });

  test('selection outline is high-contrast slate', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(seg).toHaveCSS('outline-color', 'rgb(30, 41, 59)');
  });
});

test.describe('Segment UX — floating action toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('single-click shows segment action toolbar', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-toolbar')).toBeVisible();
  });

  test('Edit button in toolbar opens segment panel', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await page.evaluate(() => {
      (document.querySelector('[data-testid="segment-action-edit"]') as HTMLElement)?.click();
    });
    await expect(page.getByTestId('segment-panel')).toBeVisible();
  });

  test('Link button in toolbar is present', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-link')).toBeVisible();
  });

  test('toolbar disappears on Escape', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-toolbar')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('segment-action-toolbar')).not.toBeVisible();
  });
});

test.describe('Segment UX — dep handle', () => {
  test.beforeEach(async ({ page }) => {
    await loadDefault(page);
  });

  test('dep handle not visible before selection', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.hover();
    await expect(page.getByTestId('segment-action-link').first()).not.toBeVisible();
  });

  test('dep handle visible after selection', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    await expect(page.getByTestId('segment-action-link').first()).toBeVisible();
  });

  test('dep handle has descriptive tooltip', async ({ page }) => {
    const seg = await getFirstSegment(page);
    await expect(seg).toBeVisible({ timeout: 10000 });
    await seg.click();
    const handle = page.getByTestId('segment-action-link').first();
    const title = await handle.getAttribute('title');
    expect(title).toContain('dependency');
  });
});

/**
 * US-BUG-01: Newly created initiatives should be editable/deletable and visible in Data Manager
 *
 * AC1: Opening a saved initiative (created via double-click) shows "Edit Initiative" title
 * AC2: Opening a saved initiative shows the Delete Initiative button
 * AC3: The new initiative appears in the Data Manager initiatives table
 */
test.describe('US-BUG-01: Newly created initiative edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await loadDtsWithDemo(page);
  });

  test('AC1: re-opening a saved new initiative shows "Edit Initiative" title', async ({ page }) => {
    await createInitiativeViaDoubleClick(page);

    const bar = page.locator('[data-initiative-id]').filter({ hasText: 'Test Bug Initiative' }).first();
    await bar.dblclick();

    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator('h2')).toHaveText('Edit Initiative');
  });

  test('AC2: re-opening a saved new initiative shows Delete button', async ({ page }) => {
    await createInitiativeViaDoubleClick(page);

    const bar = page.locator('[data-initiative-id]').filter({ hasText: 'Test Bug Initiative' }).first();
    await bar.dblclick();

    const panel = page.locator('[data-testid="initiative-panel"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.getByRole('button', { name: 'Delete Initiative' })).toBeVisible();
  });

  test('AC3: new initiative appears in Data Manager initiatives table', async ({ page }) => {
    await createInitiativeViaDoubleClick(page);

    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager')).toBeVisible();

    const tableWrapper = page.locator('[data-testid="initiatives-table-scroll-wrapper"]');
    await expect(tableWrapper).toBeVisible({ timeout: 10000 });
    await expect(tableWrapper.locator('input[value="Test Bug Initiative"]')).toBeVisible();
  });
});

test.describe('Initiative Deletion', () => {
  test('Delete initiative from visualiser', async ({ page }) => {
    await page.goto('/');

    const initiativeName = "Passkey Rollout";
    const initiative = page.locator(`div[title*="${initiativeName}"]`).first();
    await expect(initiative).toBeVisible();

    await initiative.click();
    await page.getByTestId('initiative-action-edit').click();

    const deleteBtn = page.getByRole('button', { name: 'Delete Initiative' });
    await expect(deleteBtn).toBeVisible();

    await deleteBtn.click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    await expect(page.locator(`div[title*="${initiativeName}"]`)).not.toBeVisible();
  });
});

test.describe('Initiative Interaction Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Move Initiative horizontally should update dates and persist', async ({ page }) => {
    const initiative = page.locator('div[title*="Passkey Rollout"]').first();
    const initialBox = await initiative.boundingBox();
    if (!initialBox) throw new Error("Could not find initiative");

    const centerX = initialBox.x + initialBox.width / 2;
    const centerY = initialBox.y + initialBox.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(centerX + 200, centerY, { steps: 50 });
    await page.waitForTimeout(200);
    await page.mouse.up();

    await page.waitForTimeout(1000);

    const newBox = await initiative.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox.x + 100);
    expect(Math.abs(newBox!.width - initialBox.width)).toBeLessThan(5);

    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForTimeout(1000);
    const persistedBox = await page.locator('div[title*="Passkey Rollout"]').first().boundingBox();
    expect(persistedBox!.x).toBeGreaterThan(initialBox.x + 100);
  });

  test('Draw relationship by dragging vertically between initiatives', async ({ page }) => {
    const sourceInit = page.locator('div[title*="Passkey Rollout"]').first();
    const targetInit = page.locator('div[title*="SSO Consolidation"]').first();

    const sourceBox = await sourceInit.boundingBox();
    const targetBox = await targetInit.boundingBox();

    if (!sourceBox || !targetBox) throw new Error("Could not find initiatives");

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();

    const dependencyGroup = page.locator('g.cursor-pointer.group');
    await expect(dependencyGroup.first()).toBeAttached();
  });
});

/**
 * US-01: Edit initiative interaction in programme/strategy/DTS phase grouping
 *
 * When grouped by programme, strategy, or DTS phase, single-clicking an
 * initiative should show the edit icon (top-right) and double-clicking should
 * open the Edit Initiative modal — matching the behaviour in group-by-asset.
 */
test.describe('Initiative edit interaction — swimlane groupings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  for (const groupBy of ['programme', 'strategy'] as const) {
    test(`single-click shows edit icon when grouped by ${groupBy}`, async ({ page }) => {
      await switchGrouping(page, groupBy);

      const bar = page.locator('[data-initiative-id]').first();
      await expect(bar).toBeVisible();

      await bar.click();

      const editBtn = page.getByTestId('initiative-action-edit');
      await expect(editBtn).toBeVisible();
    });

    test(`clicking edit icon opens Edit Initiative modal when grouped by ${groupBy}`, async ({ page }) => {
      await switchGrouping(page, groupBy);

      const bar = page.locator('[data-initiative-id]').first();
      await expect(bar).toBeVisible();

      await bar.click();
      await page.getByTestId('initiative-action-edit').click();

      await expect(page.getByTestId('initiative-panel')).toBeVisible();
    });

    test(`double-click opens Edit Initiative modal when grouped by ${groupBy}`, async ({ page }) => {
      await switchGrouping(page, groupBy);

      const bar = page.locator('[data-initiative-id]').first();
      await expect(bar).toBeVisible();

      await bar.dblclick();

      await expect(page.getByTestId('initiative-panel')).toBeVisible();
    });
  }
});

test.describe('Initiative Grouping', () => {
  test('should group connected initiatives and allow collapsing', async ({ page }) => {
    test.setTimeout(60000);
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const targetAssetId = 'a-ciam';
    const firstInitiativeName = 'Passkey Rollout'; 
    const secondInitiativeName = 'SSO Consolidation'; 

    const targetRow = page.locator(`[data-asset-id="${targetAssetId}"]`);
    const groupBox = targetRow.getByTestId('initiative-group-box');
    await expect(groupBox).toBeVisible({ timeout: 15000 });

    await targetRow.hover();
    const collapseBtn = groupBox.getByTestId('collapse-group-btn');
    await expect(collapseBtn).toBeVisible({ timeout: 5000 });
    await collapseBtn.click();

    const projectBar = page.getByTestId('project-group-bar');
    await expect(projectBar).toBeVisible({ timeout: 15000 });
    
    await expect(projectBar).toHaveCSS('border-style', 'dashed');
    await expect(projectBar).toHaveCSS('color', 'rgb(15, 23, 42)');
    
    await expect(page.locator(`text="${firstInitiativeName}"`)).not.toBeVisible();
    await expect(page.locator(`text="${secondInitiativeName}"`)).not.toBeVisible();

    await projectBar.hover();
    const ungroupBtn = projectBar.getByTestId('expand-group-btn');
    await expect(ungroupBtn).toBeVisible();
    await expect(ungroupBtn).toHaveCSS('opacity', '1');

    await ungroupBtn.click();
    await expect(page.locator(`text="${firstInitiativeName}"`)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`text="${secondInitiativeName}"`)).toBeVisible({ timeout: 15000 });
    
    await targetRow.hover();
    await collapseBtn.click({ force: true });
    await expect(page.getByTestId('project-group-bar')).toBeVisible({ timeout: 15000 });

    await page.waitForTimeout(1000);
    await page.reload();
    await expect(page.locator('[data-testid="project-group-bar"]')).toBeVisible();
    await expect(page.locator(`text="${firstInitiativeName}"`)).not.toBeVisible();
  });
});

test.describe('Initiative Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(async () => {
      const dbInfo = await window.indexedDB.databases();
      for (const db of dbInfo) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    });
    await page.goto('http://localhost:3000');
  });

  test('can open initiative panel, edit, and save changes', async ({ page }) => {
    await expect(page.locator('#timeline-visualiser')).toBeVisible();

    const initiative = page.locator('div[data-initiative-id]').filter({ hasText: 'Passkey Rollout' });
    await expect(initiative).toBeVisible();

    await initiative.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible();

    const budgetInput = panel.getByLabel('CapEx ($)');
    await expect(budgetInput).toHaveValue('350000');

    await budgetInput.fill('600000');

    const nameInput = panel.getByLabel('Initiative Name');
    await nameInput.fill('Passkey Rollout V2');

    const programmeSelect = panel.locator('select#programmeId');
    await programmeSelect.selectOption({ label: 'Regulatory Programme' });

    await panel.getByRole('button', { name: 'Save Changes' }).click();

    await expect(panel).not.toBeVisible();

    const updatedInitiative = page.locator('div[data-initiative-id]').filter({ hasText: 'Passkey Rollout V2' });
    await expect(updatedInitiative).toBeVisible();

    await expect(updatedInitiative.locator('text=Regulatory Programme')).toBeVisible();

    await updatedInitiative.click();
    await page.getByTestId('initiative-action-edit').click();
    await expect(panel).toBeVisible();
    await expect(panel.getByLabel('CapEx ($)')).toHaveValue('600000');
  });
});

/**
 * The Initiative panel must display a "Related Initiatives" section
 * listing any dependencies that involve the current initiative.
 */
test.describe('InitiativePanel — related initiatives', () => {
  test('shows related initiatives section when editing an initiative with dependencies', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const passkey = page.locator('[data-initiative-id="i-ciam-passkey"]').first();
    await expect(passkey).toBeVisible({ timeout: 10000 });
    await passkey.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const relatedSection = page.getByTestId('related-initiatives-section');
    await expect(relatedSection).toBeVisible();

    await expect(relatedSection).toContainText('SSO Consolidation');
  });

  test('shows no related initiatives section when initiative has no dependencies', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });

    const ztna = page.locator('[data-initiative-id="i-eiam-ztna"]').first();
    await expect(ztna).toBeVisible({ timeout: 10000 });
    await ztna.click();
    await page.getByTestId('initiative-action-edit').click();

    const panel = page.getByTestId('initiative-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const relatedSection = page.getByTestId('related-initiatives-section');
    await expect(relatedSection).not.toBeVisible();
  });
});

test.describe('Initiative Position Stability', () => {
  test('Initiative remains in same vertical row during drag', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');

    const init1 = page.locator('div[data-initiative-id="i-ciam-passkey"]').first();
    const init2 = page.locator('div[data-initiative-id="i-ciam-sso"]').first();

    await expect(init1).toBeVisible();
    await expect(init2).toBeVisible();

    const box1Initial = await init1.boundingBox();
    const box2Initial = await init2.boundingBox();

    if (!box1Initial || !box2Initial) throw new Error("Could not find initiatives");

    const top1Initial = parseFloat(await init1.evaluate(el => el.style.top));
    const top2Initial = parseFloat(await init2.evaluate(el => el.style.top));

    console.log(`Initial tops: init1=${top1Initial}, init2=${top2Initial}`);

    const centerX = box1Initial.x + box1Initial.width / 2;
    const centerY = box1Initial.y + box1Initial.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    
    for (let i = 1; i <= 5; i++) {
      await page.mouse.move(centerX + (i * 100), centerY, { steps: 5 });
      
      const top1During = parseFloat(await init1.evaluate(el => el.style.top));
      const top2During = parseFloat(await init2.evaluate(el => el.style.top));
      
      console.log(`Step ${i} tops: init1=${top1During}, init2=${top2During}`);
      
      expect(top1During).toBe(top1Initial);
      expect(top2During).toBe(top2Initial);
    }

    await page.mouse.up();
  });
});
