# Rebrand: OnePlan → Scenia

**Old name:** OnePlan
**New name:** Scenia
**Old domain:** https://oneplan.website
**New domain:** https://scenia.website
**GitHub repo:** https://github.com/waylonkenning/Scenia (renamed ✓)

---

## Source Code

### `index.html`
- `<title>` — `OnePlan — IT Portfolio Planning, Visualised.` → `Scenia — IT Portfolio Planning, Visualised.`
- `<meta property="og:title">` — same
- `<meta property="og:url">` — `https://oneplan.website` → `https://scenia.website`
- `<meta name="twitter:title">` — same as title

### `package.json`
- `"name": "oneplan"` → `"name": "scenia"`

### `src/App.tsx`
- Footer text: `OnePlan IT Initiative Planner` → `Scenia IT Initiative Planner`
- `localStorage.getItem('oneplan_has_seen_landing')` → `scenia_has_seen_landing`
- `localStorage.getItem('oneplan-e2e')` → `scenia-e2e`
- GitHub link: `https://github.com/waylonkenning/OnePlan` → updated repo URL once renamed

### `src/components/Timeline.tsx`
- `localStorage.getItem('oneplan_legend_expanded')` → `scenia_legend_expanded`
- `sessionStorage.getItem('oneplan_collapsed_categories')` → `scenia_collapsed_categories`
- `sessionStorage.setItem('oneplan_collapsed_categories', ...)` → same key update
- `localStorage.setItem('oneplan_legend_expanded', ...)` → same key update

### `src/components/LandingPage.tsx`
- `<span>OnePlan</span>` (header logo text) → `Scenia`
- GitHub href: `https://github.com/waylonkenning/OnePlan` → updated repo URL
- `alt="OnePlan Visualiser"` → `alt="Scenia Visualiser"`
- Any `oneplan.website` links → `scenia.website`

### `src/components/TutorialModal.tsx`
- `'Welcome to OnePlan'` → `'Welcome to Scenia'`
- `'OnePlan is a complete initiative planning tool...'` → `'Scenia is a complete initiative planning tool...'`

### `src/components/FeaturesModal.tsx`
- Any `OnePlan Features & Capabilities` heading → `Scenia Features & Capabilities`
- Any other OnePlan brand references in modal content

### `src/components/ReportsView.tsx`
- `localStorage.getItem('oneplan-test-versions-fail')` → `scenia-test-versions-fail`

### `src/components/ErrorBoundary.tsx`
- `localStorage.getItem('oneplan-test-throw')` → `scenia-test-throw`

### `src/lib/db.ts`
- IndexedDB database name `'it-initiative-visualiser'` — no change needed (not brand-named)

---

## Deployment & Infrastructure

### `cloudbuild.yaml`
- `gcr.io/$PROJECT_ID/oneplan-app` → `gcr.io/$PROJECT_ID/scenia-app` (Docker image name, 4 occurrences)
- `'oneplan-service'` → `'scenia-service'` (Cloud Run service name)

### `playwright.config.ts`
- `name: 'oneplan-e2e'` (localStorage key injected for every test) → `'scenia-e2e'`

---

## E2E Test Files

All test files use `oneplan-e2e` and `oneplan_has_seen_landing` localStorage keys. These must be updated consistently with the source changes above.

### `e2e/landing-page.spec.ts`
- `'oneplan_has_seen_landing'` → `'scenia_has_seen_landing'`
- `'oneplan-e2e'` → `'scenia-e2e'`
- GitHub href assertions: update repo URL
- Footer text assertion: `'OnePlan IT Initiative Planner'` → `'Scenia IT Initiative Planner'`

### `e2e/tutorial-modal.spec.ts`
- `'oneplan-e2e'` → `'scenia-e2e'`
- `'oneplan_has_seen_landing'` → `'scenia_has_seen_landing'`
- Heading assertions: `'Welcome to OnePlan'` → `'Welcome to Scenia'`
- Body text assertions: `'OnePlan is a complete initiative planning tool'` → `'Scenia is a complete...'`

### `e2e/tutorial-content.spec.ts`
- Same localStorage key updates as above
- Heading assertion: `'Welcome to OnePlan'` → `'Welcome to Scenia'`

### `e2e/features-modal.spec.ts`
- `'oneplan-e2e'` → `'scenia-e2e'`
- Modal title assertion: `'OnePlan Features & Capabilities'` → `'Scenia Features & Capabilities'`

### `e2e/error-boundary.spec.ts`
- `'oneplan-test-throw'` → `'scenia-test-throw'`

### `e2e/reports-versions-error.spec.ts`
- `'oneplan-test-versions-fail'` → `'scenia-test-versions-fail'`

### All other e2e test files using `oneplan-e2e` or `oneplan_has_seen_landing`
- `e2e/capacity-report.spec.ts`
- `e2e/resources.spec.ts`
- `e2e/capture-screenshots.spec.ts`
- `e2e/validate-feature-animations.spec.ts`
- *(and any others — search for `oneplan` across `e2e/` to catch all)*

---

## Documentation

### `README.md`
- Title: `# OnePlan: Strategic Roadmap & Visualiser` → `# Scenia: Strategic Roadmap & Visualiser`
- All `OnePlan` references in body text
- Live demo link: `https://oneplan.website` → `https://scenia.website`
- Git clone URL: `https://github.com/waylonkenning/OnePlan.git` → updated repo URL

### `CLAUDE.md`
- `# OnePlan Development Standards` → `# Scenia Development Standards`
- All `OnePlan` references in body text
- Production URL: `https://oneplan.website` → `https://scenia.website`

### `PLAYWRIGHT_TODO.md`
- `**OnePlan**` → `**Scenia**`
- Footer text assertion reference

### `CONTRIBUTING.md`
- All `OnePlan` → `Scenia`

### Any other `.md` files referencing OnePlan (e.g. `FEATURES.md`, `CODE_REVIEW.md`)

---

## GitHub / Repository

- Rename repository from `OnePlan` → `Scenia` (or `scenia`) on GitHub
- Update all clone/href URLs from `https://github.com/waylonkenning/OnePlan` → new repo URL
- Update GCP Cloud Run service name `oneplan-service` → `scenia-service` (requires re-deploy)
- Update Docker image name `oneplan-app` → `scenia-app` in `cloudbuild.yaml`

---

## localStorage / sessionStorage Key Migration Note

Existing users will have old `oneplan_*` keys in their browser storage. These will simply be ignored after the rename (the app will fall back to defaults). If a migration path is needed, add a one-time migration script on app init that reads old keys and writes new ones before deleting the old ones.

---

## Storage Key Reference (old → new)

| Old key | New key | Storage |
|---|---|---|
| `oneplan_has_seen_landing` | `scenia_has_seen_landing` | localStorage |
| `oneplan-e2e` | `scenia-e2e` | localStorage |
| `oneplan_legend_expanded` | `scenia_legend_expanded` | localStorage |
| `oneplan_collapsed_categories` | `scenia_collapsed_categories` | sessionStorage |
| `oneplan-test-versions-fail` | `scenia-test-versions-fail` | localStorage |
| `oneplan-test-throw` | `scenia-test-throw` | localStorage |

---

## IndexedDB

The IndexedDB database is named `'it-initiative-visualiser'` — not brand-named, so no change required.

---

## Not Changing

- `https://kenning.co.nz` — author's personal site, stays as-is
- IndexedDB name `'it-initiative-visualiser'` — generic, no change needed
- Internal component names, file names, CSS class names — purely structural, no user-facing brand
