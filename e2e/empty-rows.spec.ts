import { test, expect } from '@playwright/test';

test.describe('Data Entry with Empty Rows', () => {
  test('Should show one blank row and spawn another when typed in', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="nav-data-manager"]');
    await page.waitForSelector('table tbody', { timeout: 10000 });

    const allRows = page.locator('table tbody tr');
    const initialCount = await allRows.count();
    
    const blankRow = allRows.last();
    const nameInput = blankRow.locator('input[type="text"]').first();
    
    await nameInput.fill('Dynamic Row Spawning');
    await page.waitForTimeout(1000);

    await expect(allRows).toHaveCount(initialCount + 1);
    
    await page.reload();
    await page.waitForTimeout(1000);
    await page.click('[data-testid="nav-data-manager"]');
    await page.waitForSelector('table tbody', { timeout: 10000 });
    await expect(page.locator('table tbody')).toContainText('Dynamic Row Spawning');
  });

  test('Should not lose focus when typing in a blank row', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="nav-data-manager"]');
    await page.waitForSelector('table tbody', { timeout: 10000 });

    const nameInput = page.locator('input[data-testid="ghost-input-name"]');
    await nameInput.click();
    await page.keyboard.type('server');

    const realInput = page.locator('tr[data-real="true"] input[value="server"]');
    await expect(realInput).toBeFocused();
    await expect(realInput).toHaveValue('server');
  });

  test('Should maintain focus in current row when tabbing across a new row', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="nav-data-manager"]');
    await page.waitForSelector('table tbody', { timeout: 10000 });

    const nameInput = page.locator('input[data-testid="ghost-input-name"]');
    await nameInput.click();
    await nameInput.fill('Tabbing Test');
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);

    const realRow = page.locator('tr[data-real="true"]').filter({ hasText: 'Tabbing Test' });
    await expect(realRow).toBeVisible();

    const focusedElement = page.locator(':focus');
    const focusedRow = focusedElement.locator('xpath=./ancestor::tr');
    await expect(focusedRow).toHaveAttribute('data-real', 'true');
    await expect(focusedRow).toContainText('Tabbing Test');
  });
});
