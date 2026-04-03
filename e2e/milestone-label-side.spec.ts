import { test, expect } from '@playwright/test';

/**
 * Milestone label side preference
 *
 * A milestone label should appear to the LEFT of the badge when there are no
 * initiative bars in the immediate window to the left of the milestone position.
 * It should remain on the RIGHT when initiative bars occupy that space.
 */

async function clearInitiatives(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    const req = indexedDB.open('it-initiative-visualiser');
    await new Promise<void>((resolve, reject) => {
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('initiatives', 'readwrite');
        tx.objectStore('initiatives').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  });
  await page.reload();
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
}

test.describe('Milestone label side preference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  test('label appears to the RIGHT of the badge when initiative bars are present to the left', async ({ page }) => {
    // Default demo data has initiatives spanning most of the timeline window,
    // so milestones among them should keep their labels on the right.
    const containers = page.locator('.group\\/marker');
    const count = await containers.count();
    expect(count).toBeGreaterThan(0);

    let foundRight = false;
    for (let i = 0; i < count; i++) {
      const label = containers.nth(i).locator('[data-testid="milestone-label"]');
      if (!await label.isVisible()) continue;
      if ((await label.getAttribute('data-label-side')) === 'right') {
        foundRight = true;
        break;
      }
    }
    expect(foundRight).toBe(true);
  });

  test('label appears to the LEFT of the badge when no initiatives are present', async ({ page }) => {
    // Clear all initiatives — milestones remain but have nothing to their left.
    await clearInitiatives(page);

    const containers = page.locator('.group\\/marker');
    const count = await containers.count();
    expect(count).toBeGreaterThan(0);

    // Every visible milestone should now prefer the left side.
    let foundLeft = false;
    for (let i = 0; i < count; i++) {
      const container = containers.nth(i);
      const badge = container.locator('[data-testid="milestone-dep-handle"]');
      const label = container.locator('[data-testid="milestone-label"]');
      if (!await label.isVisible()) continue;

      expect(await label.getAttribute('data-label-side')).toBe('left');

      // Also verify pixel positioning: label right edge < badge left edge
      const badgeBox = await badge.boundingBox();
      const labelBox = await label.boundingBox();
      if (badgeBox && labelBox) {
        expect(labelBox.x + labelBox.width).toBeLessThan(badgeBox.x + 4); // 4px tolerance
        foundLeft = true;
      }
    }
    expect(foundLeft).toBe(true);
  });
});
