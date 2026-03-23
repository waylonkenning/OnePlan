# Security Review — IndexedDB & XSS

**Date:** 2026-03-23
**Scope:** Client-side data storage (IndexedDB) and XSS attack surface
**Status:** Review complete — one gap identified, fix recommended

---

## Threat 1 — Another website reading the database

**Risk: None.**

IndexedDB is governed by the browser's same-origin policy. A page served from `evil.com` cannot read, write, or enumerate data stored under `scenia.website`. This is a hard browser-enforced guarantee that applies regardless of how the app is built. No action required.

---

## Threat 2 — Cross-Site Scripting (XSS)

XSS is the relevant threat: if an attacker can inject a malicious script into the Scenia page, that script runs in the same origin and has full read/write access to IndexedDB.

### Code audit result — Clean

| Check | Result |
|-------|--------|
| `dangerouslySetInnerHTML` usage | None found |
| `innerHTML` / `document.write` / `eval` | None found |
| User data rendered via React JSX | ✅ React escapes all strings by default |

No direct XSS vectors exist in the current codebase. User-supplied content (initiative names, descriptions, asset names, etc.) is rendered through React's standard JSX path, which HTML-encodes all values before insertion into the DOM.

### Gap identified — No HTTP security headers

The Nginx configuration in `Dockerfile` is bare. The app is served with no security headers:

```
server {
    listen 8080;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

This means that if an XSS vector were ever introduced — through a future code change, a compromised npm dependency, or a supply chain attack — there is no browser-level backstop to contain it. An injected script would have unrestricted access to IndexedDB and could silently exfiltrate all portfolio data.

The missing headers and their purpose:

| Header | Purpose | Priority |
|--------|---------|----------|
| `Content-Security-Policy` | Restricts which scripts, styles, and resources the browser will execute. The most important XSS defence at the HTTP layer. | High |
| `X-Frame-Options` | Prevents the app being embedded in a third-party iframe (clickjacking). | Medium |
| `X-Content-Type-Options: nosniff` | Prevents the browser from MIME-sniffing responses, which can allow content to be executed as a different type. | Medium |
| `Referrer-Policy` | Controls how much URL information is included in the `Referer` header when navigating away from the app. | Low |
| `Permissions-Policy` | Explicitly disables browser features the app doesn't use (camera, microphone, geolocation, etc.). | Low |

---

## Recommended fix

Add the headers to the Nginx config block inside `Dockerfile`.

A Content Security Policy appropriate for Scenia (a React SPA with no inline scripts, no external CDN resources, no iframes):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self'
```

Notes on the policy:
- `'unsafe-inline'` is required for styles because Tailwind injects some styles at runtime. Scripts do **not** need `unsafe-inline`.
- `data:` and `blob:` are needed in `img-src` for the PDF/SVG export pipeline which generates blob URLs.
- `frame-ancestors 'none'` replaces `X-Frame-Options: DENY` and is the modern equivalent.

---

## Summary

| Threat | Exploitable now? | Action |
|--------|-----------------|--------|
| Another site reading IndexedDB | No — same-origin policy | None needed |
| XSS in current code | No — no injection vectors found | None needed |
| XSS via future change or supply chain | Possible — no HTTP headers to contain it | Add security headers to Nginx config |

The app has a good baseline: no `dangerouslySetInnerHTML`, React's automatic escaping, and all data stays local. The only recommended action is adding HTTP security headers as a defence-in-depth measure.
