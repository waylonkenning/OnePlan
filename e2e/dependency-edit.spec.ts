import { test, expect } from '@playwright/test';

test.describe('Dependency Edit Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#timeline-visualiser');
  });

  test('Clicking a dependency arrow should open the edit modal', async ({ page }) => {
    // Wait for a dependency label to be visible
    const dependencyLabel = page.locator('text=blocks').first();
    await expect(dependencyLabel).toBeVisible();

    // Click the label/arrow (which is wrapped in a group with onClick)
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    // Verify the edit modal is open
    const modal = page.locator('[data-testid="dependency-panel"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Edit Relationship');
    
    // Verify essential buttons are present
    const deleteBtn = modal.getByRole('button', { name: 'Delete Relationship' });
    await expect(deleteBtn).toBeVisible();
    
    const reverseBtn = modal.getByRole('button', { name: 'Reverse Direction' });
    await expect(reverseBtn).toBeVisible();
  });

  test('Should be able to delete a dependency from the modal', async ({ page }) => {
    // Wait for data
    await page.waitForSelector('g.cursor-pointer.group');
    const countBefore = await page.locator('g.cursor-pointer.group').count();
    console.log(`Count before: ${countBefore}`);

    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    const deleteBtn = modal.getByRole('button', { name: 'Delete Relationship' });
    
    await deleteBtn.click();
    await page.locator('[data-testid="confirm-modal-confirm"]').click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
    
    // Verify that the count decreased
    await expect(page.locator('g.cursor-pointer.group')).toHaveCount(countBefore - 1);
    console.log(`Count after: ${await page.locator('g.cursor-pointer.group').count()}`);
  });

  test('Should be able to reverse dependency direction', async ({ page }) => {
    // Wait for data
    await page.waitForSelector('g.cursor-pointer.group');
    
    const dependencyGroup = page.locator('g.cursor-pointer.group').first();
    await dependencyGroup.click({ force: true });

    const modal = page.locator('[data-testid="dependency-panel"]');
    
    // Get initial source and target names
    const sourceName = await modal.locator('p.text-sm.font-semibold.text-slate-800').nth(0).textContent();
    const targetName = await modal.locator('p.text-sm.font-semibold.text-slate-800').nth(1).textContent();
    
    console.log(`Initial: Source=${sourceName}, Target=${targetName}`);

    const reverseBtn = modal.getByRole('button', { name: 'Reverse Direction' });
    await reverseBtn.click();

    // Verify they are swapped
    const newSourceName = await modal.locator('p.text-sm.font-semibold.text-slate-800').nth(0).textContent();
    const newTargetName = await modal.locator('p.text-sm.font-semibold.text-slate-800').nth(1).textContent();
    
    console.log(`After reverse: Source=${newSourceName}, Target=${newTargetName}`);
    
    expect(newSourceName).toBe(targetName);
    expect(newTargetName).toBe(sourceName);

    // Save changes
    await modal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(modal).not.toBeVisible();
  });
});
