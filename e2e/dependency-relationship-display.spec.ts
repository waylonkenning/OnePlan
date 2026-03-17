import { test, expect } from '@playwright/test';

test.describe('Dependency relationship display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('g.cursor-pointer.group');
  });

  test('edit modal shows initiative names in description sentence', async ({ page }) => {
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await expect(modal).toBeVisible();

    // Read actual source/target names shown in the header
    const sourceName = await modal.locator('[data-testid="dep-source-name"]').textContent();
    const targetName = await modal.locator('[data-testid="dep-target-name"]').textContent();
    expect(sourceName).toBeTruthy();
    expect(targetName).toBeTruthy();

    // The description sentence should contain the initiative names, not generic text
    const desc = modal.locator('[data-testid="dep-description"]');
    await expect(desc).toBeVisible();
    const descText = await desc.textContent();

    // Generic fallback phrases must NOT appear
    expect(descText).not.toContain('The source initiative');
    expect(descText).not.toContain('The target initiative');
    expect(descText).not.toContain('There is a general connection between these initiatives');

    // At least one of the initiative names must appear in the sentence
    const containsSource = descText?.includes(sourceName!) ?? false;
    const containsTarget = descText?.includes(targetName!) ?? false;
    expect(containsSource || containsTarget).toBe(true);
  });

  test('blocks arrow is red', async ({ page }) => {
    // Find a blocks dependency group
    const blocksLabel = page.locator('g.cursor-pointer.group').filter({ hasText: 'blocks' }).first();
    await expect(blocksLabel).toBeVisible();

    // The visible path inside this group should be red
    const visiblePath = blocksLabel.locator('path[stroke]').nth(1);
    await expect(visiblePath).toHaveAttribute('stroke', '#ef4444');
  });

  test('requires arrow is blue', async ({ page }) => {
    // We need a requires dependency — change the first one to requires
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.locator('#depType').selectOption('requires');
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();

    // Find the requires group and check stroke
    const requiresGroup = page.locator('g.cursor-pointer.group').filter({ hasText: 'requires' }).first();
    await expect(requiresGroup).toBeVisible();
    const visiblePath = requiresGroup.locator('path[stroke]').nth(1);
    await expect(visiblePath).toHaveAttribute('stroke', '#3b82f6');
  });

  test('related arrow is dark and has no arrowhead marker', async ({ page }) => {
    // Change the first dependency to related
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    await modal.locator('#depType').selectOption('related');
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();

    // Find related group
    const relatedGroup = page.locator('g.cursor-pointer.group').filter({ hasText: 'related' }).first();
    await expect(relatedGroup).toBeVisible();

    const visiblePath = relatedGroup.locator('path[stroke]').nth(1);
    // Should be dark/black and have NO markerEnd
    await expect(visiblePath).toHaveAttribute('stroke', '#475569');
    const markerEnd = await visiblePath.getAttribute('marker-end');
    expect(markerEnd).toBeFalsy();
  });
});
