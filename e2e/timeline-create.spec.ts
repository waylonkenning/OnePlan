import { test, expect } from '@playwright/test';

test.describe('Timeline Create Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Reset DB just in case
        await page.goto('/');
        await page.evaluate(async () => {
            const databases = await window.indexedDB.databases();
            for (const db of databases) {
                if (db.name) window.indexedDB.deleteDatabase(db.name);
            }
        });
        await page.reload();
    });

    test('can double click empty timeline row to open creation panel pre-filled', async ({ page }) => {
        // Debug: Log all class names on the page
        const allDivs = await page.locator('div').all();
        console.log(`Found ${allDivs.length} divs`);

        // Make sure we are in the visualiser view 
        const timelineRows = page.locator('.group.relative');
        const count = await timelineRows.count();
        console.log(`Found ${count} timeline rows with .group.relative`);

        // Make sure we are in the visualiser view 
        // const timelineRows = page.locator('.group.relative').filter({ hasText: 'Initiatives' });
        await expect(timelineRows.first()).toBeVisible();

        // Find the first row's initiative content area (has the double-click handler for creating initiatives).
        const firstRowContent = timelineRows.first().locator('[data-testid="asset-row-content"]');
        await expect(firstRowContent).toBeVisible();

        // In a real scenario, we double click in an empty spot on the right side of the timeline
        // The width is around 256px for the header, so clicking at x=600 should hit Q3 or Q4 of 2026.
        await firstRowContent.dblclick({ position: { x: 300, y: 20 } }); // x=300 relative to the content area

        // Wait for the side panel to open
        const panel = page.getByTestId('initiative-panel');
        await expect(panel).toBeVisible();
        await expect(panel.locator('h2')).toContainText('Initiative');


        // Check pre-filled values
        // Name should be empty
        const nameInput = panel.locator('input[type="text"]').first();
        await expect(nameInput).toHaveValue('');

        // Start date should be populated (since we clicked x=300, it should be somewhere in 2027 roughly)
        const startDateInput = panel.locator('input[type="date"]').first();
        const startDateValue = await startDateInput.inputValue();
        expect(startDateValue).not.toBe('');

        // End date should be populated
        const endDateInput = panel.locator('input[type="date"]').nth(1);
        const endDateValue = await endDateInput.inputValue();
        expect(endDateValue).not.toBe('');

        // Just save it
        await nameInput.fill('Timeline Click Built Initiative');
        await panel.getByRole('button', { name: 'Save Changes' }).click();

        // Panel should close
        await expect(panel).toBeHidden();

        // Let's verify it rendered on the timeline
        const newBar = page.locator('div[title*="Timeline Click Built Initiative"]');
        await expect(newBar).toBeVisible();
    });
});
