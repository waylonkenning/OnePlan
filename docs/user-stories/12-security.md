# User Stories — Security

## US-SEC-01: HTTP Security Headers

**As an** IT portfolio manager using Scenia,
**I want** the application to send HTTP security headers with every response,
**so that** the browser enforces defence-in-depth protections even if an XSS vector is introduced in the future.

**Acceptance Criteria:**
- The HTTP response for the main document includes a `Content-Security-Policy` header
- The CSP includes `script-src 'self'`; production Nginx enforces no `unsafe-inline` for scripts (dev server permits it for Vite HMR)
- The CSP restricts style sources to `'self'` and `'unsafe-inline'` (required for Tailwind's runtime style injection)
- The CSP allows `data:` and `blob:` in `img-src` to support PDF/SVG export
- The CSP sets `frame-ancestors 'none'` to prevent clickjacking via iframes
- The response includes `X-Content-Type-Options: nosniff`
- The response includes `X-Frame-Options: DENY`
- The response includes `Referrer-Policy: strict-origin-when-cross-origin`
- The response includes `Permissions-Policy` disabling features the app does not use
- Headers are present in both the local development server and the production Nginx server
