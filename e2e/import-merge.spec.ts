import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

test.describe('Import Preview & Merge', () => {
    const mockFilePath = path.join(process.cwd(), 'e2e', 'mock-import.xlsx');

    test.beforeAll(() => {
        // Generate a mock Excel file for the test
        const wb = XLSX.utils.book_new();

        // We expect the default data to have 'Enterprise CIAM' (id: init-2) and others.
        // Let's create an import file that Updates 'init-2' and adds a completely new one.
        const mockInitiatives = [
            {
                id: 'init-2',
                name: 'Enterprise CIAM v2', // Updated name
                programmeId: 'prog-2',
                strategyId: 'strat-3',
                assetId: 'asset-1',
                startDate: '2027-01-01',
                endDate: '2027-12-31',
                budget: 900000 // Updated budget
            },
            {
                id: 'init-100', // New item
                name: 'Brand New Initiative',
                programmeId: 'prog-1',
                strategyId: 'strat-1',
                assetId: 'asset-2',
                startDate: '2028-01-01',
                endDate: '2028-06-30',
                budget: 50000
            }
        ];

        const initiativesWs = XLSX.utils.json_to_sheet(mockInitiatives);
        XLSX.utils.book_append_sheet(wb, initiativesWs, 'Initiatives');

        // Write to disk
        XLSX.writeFile(wb, mockFilePath);
    });

    test.afterAll(() => {
        // Clean up
        if (fs.existsSync(mockFilePath)) {
            fs.unlinkSync(mockFilePath);
        }
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Shows preview modal and merges data correctly', async ({ page }) => {
        // Start with the default Data Manager view to count initial items
        await page.getByRole('button', { name: 'Data Manager' }).click();

        // Count initial rows (1 for new row + 6 default = 7 rows, but let's just make sure it's > 2)
        const initialRows = page.locator('tbody tr[data-real="true"]');
        expect(await initialRows.count()).toBeGreaterThan(2);

        // Trigger Import
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Import Excel' }).click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(mockFilePath);

        // Wait for the modal to appear
        const modal = page.locator('.import-preview-modal');
        await expect(modal).toBeVisible();

        // Verify modal contains summary text
        await expect(modal).toContainText('2 Initiatives');

        // Choose Merge
        await page.getByRole('button', { name: 'Merge Data' }).click();
        await expect(modal).toBeHidden();

        // Verify Data Manager is updated
        // Search for the updated item
        const searchInput = page.getByPlaceholder('Search initiatives...');
        await searchInput.fill('Enterprise CIAM v2');
        await expect(initialRows).toHaveCount(1); // Mapped properly

        // Search for the new item
        await searchInput.fill('Brand New');
        await expect(initialRows).toHaveCount(1);

        // Search for an old item that wasn't in the import file (e.g. 'Web Channel')
        // It should STILL exist because we used Merge, not Overwrite.
        await searchInput.fill('Web Channel');
        await expect(initialRows).toHaveCount(1);
    });
});
