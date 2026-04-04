import { test, expect } from '@playwright/test';

test.describe('Asset Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data Manager' }).click();
  });

  test('should allow creating a category and using it in assets', async ({ page }) => {
    const categoriesTab = page.getByRole('button', { name: /Categories\s*\d*/ });
    await expect(categoriesTab).toBeVisible();
    await categoriesTab.click();

    const nameInput = page.locator('table tbody tr').last().locator('input[type="text"]').first();
    await nameInput.fill('New Test Category');
    await nameInput.blur();

    await page.getByRole('button', { name: /Assets\s*\d*/ }).click();
    const categoryDropdown = page.locator('table tbody tr').last().locator('select');
    await expect(categoryDropdown.locator('option:has-text("New Test Category")')).toBeAttached();
  });

  test('category labels remain sticky when scrolling horizontally', async ({ page }) => {
    await page.getByRole('button', { name: 'Visualiser' }).click();
    await page.waitForSelector('#timeline-visualiser');

    await page.getByLabel('Months').selectOption('36');

    const categoryLabel = page.getByText('Identity & Access Management').first();
    await expect(categoryLabel).toBeVisible();

    const scrollContainer = page.locator('.flex-1.overflow-auto.scroll-smooth').first();
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollBy({ left: 1000, behavior: 'instant' });
    });

    await expect(categoryLabel).toBeInViewport();
  });
});

test.describe('Asset & Category Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('assets swap positions when dragged', async ({ page }) => {
    const sidebarAssetNames = page.locator('.sticky.left-0.flex-shrink-0 .font-semibold');
    await expect(sidebarAssetNames.nth(0)).toHaveText('Customer IAM (CIAM)');
    await expect(sidebarAssetNames.nth(1)).toHaveText('Employee IAM');

    const ciamHandle = page.locator('.sticky.left-0.flex-shrink-0').filter({ hasText: 'Customer IAM (CIAM)' }).first();
    const eiamHandle = page.locator('.sticky.left-0.flex-shrink-0').filter({ hasText: 'Employee IAM' }).first();

    const ciamBox = await ciamHandle.boundingBox();
    const eiamBox = await eiamHandle.boundingBox();
    if (!ciamBox || !eiamBox) throw new Error('Could not find bounding boxes');

    await page.mouse.move(ciamBox.x + 20, ciamBox.y + ciamBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(eiamBox.x + 20, eiamBox.y + eiamBox.height / 2, { steps: 20 });
    await page.mouse.up();

    await expect(sidebarAssetNames.nth(0)).toHaveText('Employee IAM', { timeout: 3000 });
    await expect(sidebarAssetNames.nth(1)).toHaveText('Customer IAM (CIAM)');
  });

  test('dragging a category above another changes the vertical order', async ({ page }) => {
    const categoryLabels = page.locator('[data-testid^="category-drag-handle-"] button');
    await expect(categoryLabels.nth(0)).toContainText('Identity & Access Management');
    await expect(categoryLabels.nth(1)).toContainText('Data Platform');

    await page.evaluate(() => {
      const source = document.querySelector('[data-testid="category-drag-handle-cat-iam"]') as HTMLElement;
      if (!source) throw new Error('IAM drag handle not found');
      source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const target = document.querySelector('[data-testid="category-row-cat-data"]') as HTMLElement;
      if (!target) throw new Error('Data Platform category row not found');
      target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const source = document.querySelector('[data-testid="category-drag-handle-cat-iam"]') as HTMLElement;
      if (!source) throw new Error('IAM drag handle not found');
      source.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    await expect(categoryLabels.nth(0)).toContainText('Data Platform');
    await expect(categoryLabels.nth(1)).toContainText('Identity & Access Management');
  });
});
