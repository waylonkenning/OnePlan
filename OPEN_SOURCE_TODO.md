# Open Source Readiness Checklist

This document tracks the tasks required to transition **OnePlan** from a private repository to a public open-source project.

## 1. Legal & Compliance
- [x] **Add LICENSE file:** Choose and add a standard license (e.g., Apache-2.0 or MIT).
- [x] **Add CONTRIBUTING.md:** Define the process for external contributions.
- [x] **Security Audit:** Ran `gitleaks detect` against 149 commits — no leaks found (2026-03-17).
- [x] **Dependency Audit:** All 421 packages use permissive licences (MIT, Apache-2.0, ISC, BSD, BlueOak, MPL-2.0). MPL-2.0 packages (`dompurify`, `lightningcss`) are transitive deps of jspdf/tailwind; MPL is compatible with Apache-2.0 for linking. One known vulnerability in `xlsx` (prototype pollution / ReDoS, GHSA-4r6h-8v6p-xvw6 / GHSA-5pgg-2g8v-p4x9) — no upstream fix available; risk is limited to user-supplied files (self-import scenario). Monitor for a patched release.

## 2. Project Metadata
- [x] **Update `package.json`:**
    - [x] Rename package from `react-example` to `oneplan`.
    - [x] Set `"private": false`.
    - [x] Add `"license": "Apache-2.0"`.
    - [x] Add `author`, `repository`, and `bugs` fields.
    - [x] Tag version `1.0.0`.

## 3. Engineering & Contributor Guardrails
- [x] **Standardise Code Style:** 
    - [x] Add basic ESLint/Prettier config so external PRs match existing style.
- [x] **Automated PR Testing:**
    - [x] Create a GitHub Action to run existing Playwright tests on every Pull Request to protect `main`.
- [x] **Methodology Preservation:**
    - [x] Reviewed `GEMINI.md` — contains only the development workflow (CI/CD lifecycle, tech stack, deployment targets). No private info, API keys, or internal identifiers. Safe to publish as-is.
    - [x] `PLAYWRIGHT_TODO.md` is up-to-date and serves as a clear contributor roadmap.

## 4. Documentation
- [x] **Update README.md:**
    - [x] Add a "Getting Started" guide (`npm install`, `npm run dev`).
    - [x] Add a "Architecture" section explaining the SVG engine and IndexedDB usage.
    - [x] Explicitly link the Live Demo URL.
- [x] **Add API/Type Docs:** Ensure `src/types.ts` is well-commented as it serves as the data contract.

---
*Note: This checklist follows standard open-source best practices.*
