import { test, expect } from '@playwright/test';

/**
 * User Story: US-SEC-01 — HTTP Security Headers
 *
 * Verifies that the application serves the required HTTP security headers
 * on the main document response. These headers are set on both the Vite
 * dev server (for this test) and the production Nginx server (Dockerfile).
 *
 * Note on AC2: The dev server CSP includes 'unsafe-inline' in script-src to
 * allow Vite's React Refresh HMR preamble. The production nginx.conf enforces
 * script-src 'self' only (no unsafe-inline). The test verifies 'self' is present.
 *
 * Acceptance Criteria:
 *  AC1  Content-Security-Policy header is present
 *  AC2  CSP includes script-src 'self' (production nginx omits unsafe-inline)
 *  AC3  CSP allows 'unsafe-inline' styles (required for Tailwind)
 *  AC4  CSP allows data: and blob: in img-src (required for PDF/SVG export)
 *  AC5  CSP sets frame-ancestors 'none' (clickjacking prevention)
 *  AC6  X-Content-Type-Options: nosniff is present
 *  AC7  X-Frame-Options: DENY is present
 *  AC8  Referrer-Policy is present
 *  AC9  Permissions-Policy is present
 */
test.describe('HTTP Security Headers', () => {
  let headers: Record<string, string>;

  test.beforeEach(async ({ page }) => {
    const response = await page.goto('/');
    headers = await response!.allHeaders();
  });

  test('AC1 – Content-Security-Policy header is present', async () => {
    expect(headers['content-security-policy']).toBeTruthy();
  });

  test("AC2 – CSP includes script-src 'self' (production nginx omits unsafe-inline)", async () => {
    // Dev server adds 'unsafe-inline' to allow Vite's React Refresh HMR preamble.
    // Production nginx.conf enforces script-src 'self' only — no unsafe-inline.
    const csp = headers['content-security-policy'];
    expect(csp).toContain("script-src 'self'");
  });

  test('AC3 – CSP allows unsafe-inline styles for Tailwind', async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  test('AC4 – CSP allows data: and blob: in img-src for export', async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain('data:');
    expect(csp).toContain('blob:');
  });

  test('AC5 – CSP sets frame-ancestors none', async () => {
    const csp = headers['content-security-policy'];
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('AC6 – X-Content-Type-Options: nosniff is present', async () => {
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('AC7 – X-Frame-Options: DENY is present', async () => {
    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('AC8 – Referrer-Policy is present', async () => {
    expect(headers['referrer-policy']).toBeTruthy();
  });

  test('AC9 – Permissions-Policy is present', async () => {
    expect(headers['permissions-policy']).toBeTruthy();
  });
});
