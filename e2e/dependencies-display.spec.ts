import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function openReportsDependencies(page: Page) {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  await page.getByTestId('nav-reports').click();
  await expect(page.getByTestId('reports-view')).toBeVisible();
  await page.getByTestId('report-card-initiatives-dependencies').click();
}

async function openInitiativePanelById(page: Page, initiativeId: string) {
  await page.evaluate((id) => {
    const bar = document.querySelector(`[data-initiative-id="${id}"]`);
    bar?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, initiativeId);
  await expect(page.locator('[data-testid="initiative-action-edit"]')).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="initiative-action-edit"]') as HTMLElement;
    btn?.click();
  });
}

// ─── Visual Enhancements ─────────────────────────────────────────────────────

test.describe('Dependency Visual Enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('increased vertical gap for intra-asset dependencies', async ({ page }) => {
    const c1 = page.getByText('Passkey Rollout').first();
    const c2 = page.getByText('SSO Consolidation').first();

    await expect(c1).toBeVisible();
    await expect(c2).toBeVisible();

    const box1 = await c1.boundingBox();
    const box2 = await c2.boundingBox();

    const topBar = box1!.y < box2!.y ? box1! : box2!;
    const bottomBar = box1!.y > box2!.y ? box1! : box2!;
    const gap = bottomBar.y - (topBar.y + topBar.height);
    expect(gap).toBeGreaterThan(30);
  });

  test('dependency labels are offset and not covering the arrow segment', async ({ page }) => {
    const dependencyLabel = page.locator('text=blocks').first();
    await expect(dependencyLabel).toBeVisible();

    const labelBox = await dependencyLabel.boundingBox();
    expect(labelBox).not.toBeNull();

    const box1 = await page.getByText('Passkey Rollout').first().boundingBox();
    const box2 = await page.getByText('SSO Consolidation').first().boundingBox();

    const midX = (box1!.x + box1!.width + box2!.x) / 2;
    const labelMidX = labelBox!.x + labelBox!.width / 2;
    expect(Math.abs(labelMidX - midX)).toBeGreaterThan(15);
  });
});

// ─── Arrow Colours & Panel Names ─────────────────────────────────────────────

test.describe('Dependency relationship display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('g.cursor-pointer.group');
  });

  test('edit modal shows initiative names in description sentence', async ({ page }) => {
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await expect(modal).toBeVisible();

    const sourceName = await modal.locator('[data-testid="dep-source-name"]').textContent();
    const targetName = await modal.locator('[data-testid="dep-target-name"]').textContent();
    expect(sourceName).toBeTruthy();
    expect(targetName).toBeTruthy();

    const desc = modal.locator('[data-testid="dep-description"]');
    await expect(desc).toBeVisible();
    const descText = await desc.textContent();

    expect(descText).not.toContain('The source initiative');
    expect(descText).not.toContain('The target initiative');
    expect(descText).not.toContain('There is a general connection between these initiatives');
    expect(descText?.includes(sourceName!) || descText?.includes(targetName!)).toBe(true);
  });

  test('blocks arrow is red', async ({ page }) => {
    const blocksLabel = page.locator('g.cursor-pointer.group').filter({ hasText: 'blocks' }).first();
    await expect(blocksLabel).toBeVisible();
    await expect(blocksLabel.locator('path[stroke]').nth(1)).toHaveAttribute('stroke', '#ef4444');
  });

  test('requires arrow is blue', async ({ page }) => {
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.locator('#depType').selectOption('requires');
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();

    const requiresGroup = page.locator('g.cursor-pointer.group').filter({ hasText: 'requires' }).first();
    await expect(requiresGroup).toBeVisible();
    await expect(requiresGroup.locator('path[stroke]').nth(1)).toHaveAttribute('stroke', '#3b82f6');
  });

  test('related arrow is dark and has no arrowhead marker', async ({ page }) => {
    await page.locator('g.cursor-pointer.group').first().click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.locator('#depType').selectOption('related');
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();

    const relatedGroup = page.locator('g.cursor-pointer.group').filter({ hasText: 'related' }).first();
    await expect(relatedGroup).toBeVisible();

    const visiblePath = relatedGroup.locator('path[stroke]').nth(1);
    await expect(visiblePath).toHaveAttribute('stroke', '#475569');
    expect(await visiblePath.getAttribute('marker-end')).toBeFalsy();
  });

  test('source and target names in panel are not truncated', async ({ page }) => {
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

    const depArrow = page.locator('g[data-dep-id]').first();
    await expect(depArrow).toBeVisible({ timeout: 10000 });
    await depArrow.click();

    const panel = page.getByTestId('dependency-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const sourceClasses = await page.getByTestId('dep-source-name').getAttribute('class');
    const targetClasses = await page.getByTestId('dep-target-name').getAttribute('class');
    expect(sourceClasses).not.toContain('truncate');
    expect(targetClasses).not.toContain('truncate');
  });
});

// ─── Initiatives & Dependencies Report ───────────────────────────────────────

test.describe('Initiatives & Dependencies report', () => {
  test.beforeEach(async ({ page }) => {
    await openReportsDependencies(page);
  });

  test('report is grouped by asset with asset headings', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toBeVisible();
    await expect(report).toContainText('Customer IAM (CIAM)');
  });

  test('lists initiatives under their asset', async ({ page }) => {
    const report = page.getByTestId('report-dependencies');
    await expect(report).toContainText('Passkey Rollout');
    await expect(report).toContainText('SSO Consolidation');
  });

  test('shows plain-language dependency sentences', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    expect(text).not.toMatch(/blocks .+ —/);
    expect(text).not.toContain('general connection');
    expect(text).toMatch(/must finish before .+ can start\.|requires .+ to finish first\.|are related\./i);
  });

  test('blocks sentence reads "A must finish before B can start"', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    if (text?.match(/must finish before/)) {
      expect(text).toMatch(/\w.+ must finish before \w.+ can start\./);
      expect(text).not.toMatch(/\w.+ blocks \w.+ —/);
    }
  });

  test('requires sentence reads "A requires B to finish first"', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    if (text?.match(/requires .+ to finish first/)) {
      expect(text).toMatch(/\w.+ requires \w.+ to finish first\./);
      expect(text).not.toMatch(/requires .+ to be complete/);
    }
  });
});

// ─── Perspective-Aware Sentences ─────────────────────────────────────────────

test.describe('Perspective-aware dependency sentences in Reports', () => {
  test.beforeEach(async ({ page }) => {
    await openReportsDependencies(page);
  });

  test('blocked initiative shows "Blocked:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      "Blocked: Developer Portal Launch can't start until API Gateway v2 Migration has finished."
    );
  });

  test('blocking initiative shows "Blocking:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      'Blocking: API Gateway v2 Migration must finish before Developer Portal Launch can start.'
    );
  });

  test('requiring initiative shows "Required:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      'Required: Real-Time Payments Gateway requires Transaction Fraud ML to start first.'
    );
  });

  test('required initiative shows "Required by:" sentence', async ({ page }) => {
    await expect(page.getByTestId('report-dependencies')).toContainText(
      'Required by: Transaction Fraud ML must start first before Real-Time Payments Gateway.'
    );
  });

  test('no legacy wording remains', async ({ page }) => {
    const text = await page.getByTestId('report-dependencies').textContent();
    expect(text).not.toMatch(/blocks .+ —/);
    expect(text).not.toContain('general connection');
    expect(text).not.toMatch(/requires .+ to finish first/);
  });
});

// ─── Perspective-Aware Labels in InitiativePanel ─────────────────────────────

test.describe('Perspective-aware labels in InitiativePanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('blocked initiative panel shows "Blocked:" label', async ({ page }) => {
    await openInitiativePanelById(page, 'i-apigw-portal');
    const section = page.getByTestId('related-initiatives-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Blocked');
  });

  test('blocking initiative panel shows "Blocking:" label', async ({ page }) => {
    await openInitiativePanelById(page, 'i-apigw-v2');
    const section = page.getByTestId('related-initiatives-section');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Blocking');
  });
});

// ─── Mobile layout ────────────────────────────────────────────────────────────

test.describe('Reports mobile layout', () => {
  test('mobile tab bar has only Visualiser and Reports tabs', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-tab-bar"]');
    await expect(page.locator('[data-testid="mobile-tab-visualiser"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-reports"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-data"]')).not.toBeVisible();
  });

  test('footer is hidden on mobile', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="mobile-card-view"]', { timeout: 15000 });
    await expect(page.locator('footer')).toBeHidden();
  });
});
