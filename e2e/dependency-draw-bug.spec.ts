import { test, expect } from '@playwright/test';

test('Dependency live drawing start position', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#timeline-visualiser');

  // Wait for the initiatives to load from DB
  await page.waitForTimeout(2000);

  // Debug: see what initiatives are present
  const initiatives = page.locator('[data-initiative-id]');
  const count = await initiatives.count();
  console.log(`Found ${count} initiatives`);
  
  if (count === 0) {
    const content = await page.content();
    console.log('Page content snippet:', content.substring(0, 1000));
    throw new Error("No initiatives found in the DOM");
  }

  for (let i = 0; i < count; i++) {
    const id = await initiatives.nth(i).getAttribute('data-initiative-id');
    console.log(`Initiative ${i}: ${id}`);
  }

  // Find "Passkey Rollout" initiative specifically
  const targetId = 'i-ciam-passkey';
  const initiative = page.locator(`[data-initiative-id="${targetId}"]`).first();
  await expect(initiative).toBeVisible({ timeout: 10000 });

  const box = await initiative.boundingBox();
  if (!box) throw new Error("Could not find initiative box");

  // Move to center of initiative
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  
  console.log(`Dragging from ${centerX}, ${centerY}`);

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();

  // Drag down by 50px to trigger dependency drawing mode (threshold is 30px)
  // Use more steps to ensure the mouse move is registered correctly
  await page.mouse.move(centerX, centerY + 50, { steps: 20 });

  // Locate the live drawing path in the SVG
  const svg = page.locator('[data-testid="dependencies-svg"]');
  const livePath = svg.locator('path[stroke-dasharray="5 5"]');

  await expect(livePath).toBeVisible({ timeout: 5000 });

  const d = await livePath.getAttribute('d');
  console.log('Path d:', d);

  if (!d) throw new Error("Path d attribute is empty");

  // Format of d is "M startX startY L currentX currentY "
  const parts = d.trim().split(' ');
  const startX = parseFloat(parts[1]);
  
  console.log(`Live drawing startX: ${startX}`);

  const viewportWidth = await page.evaluate(() => window.innerWidth);
  console.log(`Viewport width: ${viewportWidth}`);
  
  // If the bug exists, startX will be > viewportWidth
  expect(startX).toBeLessThan(viewportWidth);
});
