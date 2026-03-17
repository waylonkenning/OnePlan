import { test } from '@playwright/test';
import path from 'path';

const OUT = path.join(process.cwd(), 'test-results', 'mobile-screenshots');

test.describe('Mobile Screenshots', () => {
  test.use({ viewport: { width: 393, height: 852 } }); // iPhone 14 Pro

  test('capture all mobile views', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 15000 });

    // 1. Visualiser (default)
    await page.screenshot({ path: `${OUT}/1-visualiser.png`, fullPage: false });

    // 2. Visualiser — scrolled right to show timeline content
    await page.locator('#timeline-visualiser .overflow-auto').evaluate(el => { el.scrollLeft = 200; });
    await page.screenshot({ path: `${OUT}/2-visualiser-scrolled.png`, fullPage: false });
    await page.locator('#timeline-visualiser .overflow-auto').evaluate(el => { el.scrollLeft = 0; });

    // 3. Settings sheet open
    await page.locator('[data-testid="mobile-settings-btn"]').click();
    await page.waitForSelector('[data-testid="mobile-settings-sheet"]');
    await page.screenshot({ path: `${OUT}/3-settings-sheet.png`, fullPage: false });
    await page.keyboard.press('Escape');

    // 4. Initiative panel open
    const bar = page.locator('[data-testid^="initiative-bar"]').first();
    await bar.click();
    await page.waitForSelector('[data-testid="initiative-panel"]', { timeout: 5000 });
    await page.screenshot({ path: `${OUT}/4-initiative-panel.png`, fullPage: false });
    await page.keyboard.press('Escape');

    // 5. Data Manager
    await page.locator('[data-testid="mobile-tab-data"]').click();
    await page.waitForSelector('[data-testid="data-manager"]');
    await page.screenshot({ path: `${OUT}/5-data-manager.png`, fullPage: false });

    // 6. Reports
    await page.locator('[data-testid="mobile-tab-reports"]').click();
    await page.waitForSelector('[data-testid="reports-view"]');
    await page.screenshot({ path: `${OUT}/6-reports.png`, fullPage: false });

    // 7. Back to visualiser — bottom tab bar focus
    await page.locator('[data-testid="mobile-tab-visualiser"]').click();
    await page.waitForSelector('[data-testid="asset-row-content"]');
    // Scroll to bottom to show tab bar clearly
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.screenshot({ path: `${OUT}/7-tab-bar.png`, fullPage: false });
  });
});
