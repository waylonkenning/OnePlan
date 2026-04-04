import { test, expect } from '@playwright/test';

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
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
}

test.describe('Milestone Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
        const dbInfo = await window.indexedDB.databases();
        for (const db of dbInfo) {
            if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
            }
        }
    });
    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Move Milestone horizontally should update its date and persist', async ({ page }) => {
    const milestoneContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const milestoneIcon = milestoneContainer.locator('[data-testid="milestone-dep-handle"]');
    
    await milestoneIcon.scrollIntoViewIfNeeded();
    const initialBox = await milestoneIcon.boundingBox();
    if (!initialBox) throw new Error("Could not find milestone icon");

    const centerX = initialBox.x + initialBox.width / 2;
    const centerY = initialBox.y + initialBox.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 300, centerY, { steps: 60 });
    await page.mouse.up();

    const newBox = await milestoneIcon.boundingBox();
    expect(newBox!.x).toBeGreaterThan(initialBox.x + 200);

    await page.reload();
    await page.waitForSelector('#timeline-visualiser');
    await page.waitForSelector('[data-testid="milestone-dep-handle"]');
    
    const persistedContainer = page.locator('.group\\/marker', { hasText: 'DR Failover Test' }).first();
    const persistedBox = await persistedContainer.locator('[data-testid="milestone-dep-handle"]').boundingBox();
    expect(persistedBox!.x).toBeGreaterThan(initialBox.x + 200);
  });
});

test.describe('Milestone label side preference', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('label appears to the RIGHT of the badge when initiative bars are present to the left', async ({ page }) => {
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
    await clearInitiatives(page);

    const containers = page.locator('.group\\/marker');
    const count = await containers.count();
    expect(count).toBeGreaterThan(0);

    let foundLeft = false;
    for (let i = 0; i < count; i++) {
      const container = containers.nth(i);
      const badge = container.locator('[data-testid="milestone-dep-handle"]');
      const label = container.locator('[data-testid="milestone-label"]');
      if (!await label.isVisible()) continue;

      expect(await label.getAttribute('data-label-side')).toBe('left');

      const badgeBox = await badge.boundingBox();
      const labelBox = await label.boundingBox();
      if (badgeBox && labelBox) {
        expect(labelBox.x + labelBox.width).toBeLessThan(badgeBox.x + 4);
        foundLeft = true;
      }
    }
    expect(foundLeft).toBe(true);
  });
});

test.describe('Milestone vertical line spans both swimlanes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
  });

  test('AC1 – milestone line extends to the bottom of the applications swimlane when display is both', async ({ page }) => {
    const milestone = page.locator('[data-milestone-id="ms-4"]');
    const appSwimlane = page.locator('[data-testid="application-swimlane-a-mobile"]');

    await expect(milestone).toBeVisible();
    await expect(appSwimlane).toBeVisible();

    const milestoneBox = await milestone.boundingBox();
    const appBox = await appSwimlane.boundingBox();

    expect(milestoneBox).not.toBeNull();
    expect(appBox).not.toBeNull();

    const milestoneBottom = milestoneBox!.y + milestoneBox!.height;
    const appBottom = appBox!.y + appBox!.height;

    expect(milestoneBottom).toBeGreaterThanOrEqual(appBottom - 2);
  });

  test('AC2 – milestone visible and scoped to initiatives swimlane when display is initiatives only', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-initiatives').click();
    await page.mouse.click(100, 100);

    await expect(page.locator('[data-testid^="application-swimlane-"]')).toHaveCount(0);

    const milestone = page.locator('[data-milestone-id]').first();
    await expect(milestone).toBeVisible();
  });

  test('AC3 – milestones visible and spanning applications swimlane when display is applications only', async ({ page }) => {
    await page.getByTestId('view-options-btn').click();
    await page.getByTestId('show-applications').click();
    await page.mouse.click(100, 100);

    await expect(page.locator('[data-testid="asset-row-content"]')).toHaveCount(0);

    const milestone = page.locator('[data-milestone-id="ms-4"]');
    const appSwimlane = page.locator('[data-testid="application-swimlane-a-mobile"]');

    await expect(appSwimlane).toBeVisible();
    await expect(milestone).toBeVisible();

    const milestoneBox = await milestone.boundingBox();
    const appBox = await appSwimlane.boundingBox();

    expect(milestoneBox).not.toBeNull();
    expect(appBox).not.toBeNull();

    expect(milestoneBox!.y).toBeLessThanOrEqual(appBox!.y + 2);
    expect(milestoneBox!.y + milestoneBox!.height).toBeGreaterThanOrEqual(appBox!.y + appBox!.height - 2);
  });

  test('AC4 – milestone badge is positioned above the applications swimlane top edge', async ({ page }) => {
    const milestone = page.locator('[data-milestone-id="ms-4"]');
    const appSwimlane = page.locator('[data-testid="application-swimlane-a-mobile"]');

    const badge = milestone.locator('[data-testid="milestone-dep-handle"]');
    await expect(badge).toBeVisible();

    const badgeBox = await badge.boundingBox();
    const appBox = await appSwimlane.boundingBox();

    expect(badgeBox).not.toBeNull();
    expect(appBox).not.toBeNull();

    expect(badgeBox!.y + badgeBox!.height).toBeLessThanOrEqual(appBox!.y + 2);
  });
});
