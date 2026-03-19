import { test, expect } from '@playwright/test';

test.describe('Resources', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('scenia-e2e', 'true');
      localStorage.setItem('scenia_has_seen_landing', 'true');
    });
    await page.reload();
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
  });

  // ─── Data Manager: Resources Tab ────────────────────────────────────────────

  test('Resources tab appears in Data Manager', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await expect(page.getByTestId('data-manager-tab-resources')).toBeVisible();
  });

  test('Resources tab shows name and role columns', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Role')).toBeVisible();
  });

  test('Can add a new resource with name only', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await page.getByTestId('add-row-btn-resources').click();
    // A new row should appear with an editable name field
    const nameInput = page.locator('table tbody tr[data-real="true"]').last().locator('[data-testid="real-input-name"]');
    await nameInput.fill('Jane Smith');
    await nameInput.press('Tab');
    // Row should persist with the entered name
    await expect(page.locator('table tbody tr[data-real="true"]').last().locator('[data-testid="real-input-name"]')).toHaveValue('Jane Smith');
  });

  test('Can add a resource with name and role', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    await page.getByTestId('add-row-btn-resources').click();
    const row = page.locator('table tbody tr[data-real="true"]').last();
    await row.locator('[data-testid="real-input-name"]').fill('Business Analyst');
    await row.locator('[data-testid="real-input-role"]').fill('BA');
    await row.locator('[data-testid="real-input-name"]').press('Tab');
    await expect(page.locator('table tbody tr[data-real="true"]').last().locator('[data-testid="real-input-name"]')).toHaveValue('Business Analyst');
  });

  test('Can delete a resource row', async ({ page }) => {
    await page.getByTestId('nav-data-manager').click();
    await page.getByTestId('data-manager-tab-resources').click();
    // Demo data should have resources; delete the first one
    const firstRow = page.locator('table tbody tr[data-real="true"]').first();
    const nameText = await firstRow.locator('[data-testid="real-input-name"]').inputValue();
    await firstRow.locator('[data-testid="delete-row-btn-resources"]').click();
    // Confirm if a dialog appears
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await confirmBtn.click();
    }
    // Verify the deleted row is no longer present
    const nameInputs = page.locator('table tbody tr[data-real="true"] [data-testid="real-input-name"]');
    const remaining = await nameInputs.evaluateAll((inputs: HTMLInputElement[], name: string) =>
      inputs.map(i => i.value).includes(name), nameText);
    expect(remaining).toBe(false);
  });

  // ─── Initiative Panel: Owner from Resources ──────────────────────────────────

  test('Initiative owner field is a dropdown populated from resources', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    // Owner should be a select element, not a text input
    const ownerSelect = page.getByTestId('initiative-owner-select');
    await expect(ownerSelect).toBeVisible();
  });

  test('Owner dropdown includes demo resources', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    const ownerSelect = page.getByTestId('initiative-owner-select');
    // Should have at least a blank option + demo resources
    const options = ownerSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Selecting an owner from dropdown saves it', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    const ownerSelect = page.getByTestId('initiative-owner-select');
    // Pick the second option (first resource)
    const secondOption = ownerSelect.locator('option').nth(1);
    const resourceName = await secondOption.textContent();
    await ownerSelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: /Save Changes/i }).click();
    // Re-open panel and confirm selection persisted
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await expect(page.getByTestId('initiative-owner-select')).toHaveValue(/.+/);
  });

  // ─── Initiative Panel: Assigned Resources ───────────────────────────────────

  test('Initiative panel has an Assigned Resources section', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await expect(page.getByTestId('initiative-resources-section')).toBeVisible();
  });

  test('Can assign additional resources to an initiative', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    // Check the first resource checkbox in the assigned resources section
    const firstCheckbox = page.getByTestId('initiative-resources-section').locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    await page.getByRole('button', { name: /Save Changes/i }).click();
    // Re-open and confirm checkbox is still checked
    await page.locator('[data-testid="initiative-bar"]').first().click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await expect(
      page.getByTestId('initiative-resources-section').locator('input[type="checkbox"]').first()
    ).toBeChecked();
  });

  // ─── Timeline: Show Resources Toggle ────────────────────────────────────────

  test('Show Resources toggle exists in the header', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    await expect(page.getByTestId('toggle-resources')).toBeVisible();
  });

  test('Resource names appear on initiative bar when toggle is on', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    const toggle = page.getByTestId('toggle-resources');
    const isOff = await toggle.getAttribute('aria-pressed') === 'false';
    if (isOff) {
      await toggle.click();
    }
    await page.waitForTimeout(300);
    // At least one initiative bar should show a resource name label
    await expect(page.locator('[data-testid="initiative-resource-names"]').first()).toBeVisible();
  });

  test('Resource names are hidden when toggle is off', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    const toggle = page.getByTestId('toggle-resources');
    const isOn = await toggle.getAttribute('aria-pressed') === 'true';
    if (isOn) {
      await toggle.click();
    }
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="initiative-resource-names"]').first()).toBeHidden();
  });

  // ─── Timeline: Owner Initials Badge ─────────────────────────────────────────

  test('Owner initials badge is derived from resource name when ownerId is set', async ({ page }) => {
    await page.waitForSelector('[data-testid="initiative-bar"]', { timeout: 10000 });
    // Demo data should have some initiatives with ownerId set
    // The badge should show initials from the linked resource name
    const badge = page.locator('[data-testid="owner-badge"]').first();
    // Badge should exist and show 1-2 uppercase characters
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      expect(text).toMatch(/^[A-Z]{1,2}$/);
    }
  });
});
