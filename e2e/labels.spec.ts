import { test, expect } from '@playwright/test';

test.describe('Labels for Milestones and Dependencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Milestones should display their name as a text label', async ({ page }) => {
    // DR Failover Test is on a-k8s, which is type 'warning' -> .bg-amber-100
    const milestoneLabel = page.getByText('DR Failover Test').first();
    await expect(milestoneLabel).toBeVisible();
    
    // Find the icon that is in the same vertical stack/vicinity
    // We can look for the container that has both the icon and the label
    const milestoneContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const icon = milestoneContainer.locator('[data-testid="milestone-dep-handle"]');
    
    const iconBox = await icon.boundingBox();
    const labelBox = await milestoneLabel.boundingBox();
    
    if (!iconBox || !labelBox) throw new Error("Missing boxes");
    
    // Label should be roughly at same X as icon (centered)
    expect(Math.abs(iconBox.x + iconBox.width/2 - (labelBox.x + labelBox.width/2))).toBeLessThan(100);
  });

  test('Dependency arrows should display relationship labels', async ({ page }) => {
    // i-ciam-passkey and i-ciam-sso have a dependency 'blocks'
    const dependencyLabel = page.locator('text:has-text("blocks")').first();
    await expect(dependencyLabel).toBeAttached();
  });
});
