import { test, expect } from '@playwright/test';

/**
 * Regression test: demo initiative dates must be relative to the current date,
 * not hardcoded. When the app loads fresh, the timeline should show the current
 * year (or the next year) in its column headers.
 */
test('demo data timeline shows the current or next year, not a hardcoded past year', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser', { timeout: 20000 });

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // The timeline column headers should contain either the current or next year
  const timelineHeader = page.locator('#timeline-visualiser');
  const headerText = await timelineHeader.textContent();

  const hasCurrentYear = headerText?.includes(String(currentYear));
  const hasNextYear = headerText?.includes(String(nextYear));

  expect(
    hasCurrentYear || hasNextYear,
    `Timeline should show ${currentYear} or ${nextYear}, but got: ${headerText?.slice(0, 200)}`
  ).toBe(true);
});

test('demo initiative start dates are within 2 years of today', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });

  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const twoYearsAhead = new Date(today);
  twoYearsAhead.setFullYear(today.getFullYear() + 4);

  const outOfRangeDates = await page.evaluate(
    ({ twoYearsAgoISO, twoYearsAheadISO }: { twoYearsAgoISO: string; twoYearsAheadISO: string }): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('it-initiative-visualiser');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('initiatives', 'readonly');
          const req = tx.objectStore('initiatives').getAll();
          req.onsuccess = () => {
            const outOfRange: string[] = [];
            req.result.forEach((i: { id: string; name: string; startDate: string; isPlaceholder?: boolean }) => {
              if (i.isPlaceholder) return;
              if (!i.startDate) return;
              if (i.startDate < twoYearsAgoISO || i.startDate > twoYearsAheadISO) {
                outOfRange.push(`${i.name}: ${i.startDate}`);
              }
            });
            resolve(outOfRange);
          };
        };
      });
    },
    { twoYearsAgoISO: twoYearsAgo.toISOString().slice(0, 10), twoYearsAheadISO: twoYearsAhead.toISOString().slice(0, 10) }
  );

  expect(
    outOfRangeDates,
    `These initiatives have dates too far from today: ${outOfRangeDates.join(', ')}`
  ).toHaveLength(0);
});
