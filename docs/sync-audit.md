# Scenia Sync Audit: User Stories, Code, E2E Tests, User Guide

> **Date:** 2026-04-03
> **Purpose:** Quality review to identify gaps and misalignments across the four pillars — no new features, polish only.

---

## 1. User Stories — Inventory

All story files live in `docs/user-stories/`. **79 total stories** across 11 numbered domains plus informal IDs (US-01..28, US-BUG-01, US-IE-01..04, US-DTS-02) referenced only in E2E tests.

### Formal Story Domains

| Domain | Story IDs | Count |
|--------|-----------|-------|
| Timeline Visualiser | US-TV-01..11 | 11 |
| Initiative Management | US-IM-01..07 | 7 |
| Dependency Mapping | US-DM-01..09 | 9 |
| Data Management | US-DA-01..09 | 9 |
| Version History | US-VH-01..04 | 4 |
| Reports | US-RP-01..05 | 5 |
| Resources & Capacity | US-RC-01..03 | 3 |
| Applications & Segments | US-AL-01..09, US-30 | 10 |
| Display Settings | US-DS-01..07 | 7 |
| Mobile | US-MB-01..06 | 6 |
| Navigation, UX & Accessibility | US-UX-01..10 | 10 |
| Security | US-SEC-01 | 1 |
| GEANZ & DTS standalone | Story 13..17 | 5 |

### Informal Stories (E2E-only, no story file)

The following features have E2E tests and code but **no story file in `docs/user-stories/`**:

| Informal ID | Feature |
|-------------|---------|
| US-01 | Edit initiative in programme/strategy grouping |
| US-02 | DB error handling |
| US-03 | CapEx/OpEx budget split |
| US-04 | Export includes all entity types |
| US-05 | Segment dependency relationships |
| US-06 | Entity key uniqueness enforcement |
| US-07 | Legend expanded in PDF export |
| US-18 | Template demo data toggle |
| US-19 | DTS Adoption Status per asset |
| US-20 | DTS Alignment Coverage report |
| US-21 | DTS Phase field on initiatives |
| US-22 | Pre-drawn DTS dependencies |
| US-23 | DTS Summary tab in Excel export |
| US-24 | Customer Layer canonical touchpoints |
| US-25 | DTS Cluster field |
| US-26 | GEANZ-to-DTS cross-mapping |
| US-27 | DTS fields on mobile cards |
| US-28 | DTS segment application names |
| US-BUG-01 | New initiative editable immediately after creation |
| US-IE-01..04 | Initiative bar UX improvements (content layout, toolbar) |
| US-DTS-02 | DTS Phase colour mode |
| _(none)_ | Maturity Heatmap report |
| _(none)_ | JPG export |
| _(none)_ | Vertical segment resize (rowSpan) |
| _(none)_ | Tap-to-select (segments and initiatives) |

---

## 2. Source Code — Major Components

| Component | Key Features Implemented |
|-----------|--------------------------|
| `Timeline.tsx` | Swimlanes, initiative bars, segments, milestones, SVG dependencies, conflict detection, GEANZ catalogue, DTS features, display modes (initiatives/applications/both), groupBy, colorBy (5 modes incl. DTS Phase), zoom, drag/resize, search/filter, sidebar column resize |
| `InitiativePanel.tsx` | All fields: name, dates, capex, opex, status, ragStatus, progress, owner, resources, application link, dtsPhase, description, related dependencies |
| `DataManager.tsx` | 9 tabs: Initiatives, Dependencies, Assets, Categories, Programmes, Strategies, Milestones, Resources, Applications, App Statuses |
| `InitiativeBar.tsx` | Title, description, budget pill, owner badge, progress overlay, selection highlight, action toolbar, resize handles |
| `ReportsView.tsx` | Home screen, Initiatives & Dependencies, Budget Summary, Capacity, **Maturity Heatmap**, **DTS Alignment**, History Diff |
| `EditableTable.tsx` | Inline edit, add/delete rows, CSV paste, sorting, aria-labels |
| `DataControls.tsx` | Export: Excel, PDF, SVG, **JPG**; Import: Excel |
| `MobileCardView.tsx` | Asset cards, bucket modes, DTS fields on cards |
| `VersionManager.tsx` | Save, restore, delete, deep-clone snapshots |
| `HelpView.tsx` | In-app user guide (sidebar nav + content) |
| `criticalPath.ts` | Critical path computation across dependency graph |
| `timelineLayout.ts` | Greedy bar placement algorithm for overlapping initiatives |

---

## 3. E2E Tests — Coverage Map

**139 spec files** across `e2e/`. Coverage against formal stories:

| Domain | Formal Stories | E2E Files | Gap |
|--------|---------------|-----------|-----|
| US-TV-* | 11 | 19 | None |
| US-IM-* | 7 | 13 | None |
| US-DM-* | 9 | 10 | None |
| US-DA-* | 9 | 12 | None |
| US-VH-* | 4 | 4 | None |
| US-RP-* | 5 | 6 | None |
| US-RC-* | 3 | 1 | None |
| US-AL-* | 10 | 16 | None |
| US-DS-* | 7 | 7 | **US-DS-05 (sidebar resize)** has no test |
| US-MB-* | 6 | 3 | None |
| US-UX-* | 10 | 16 | None |
| US-SEC-* | 1 | 1 | None |

**Only one formal story with zero E2E coverage: US-DS-05 (Resize Sidebar Column).**

---

## 4. User Guide — Inventory

`docs/user-guide/` contains 12 sections with approximately 45 pages.

| Section | Pages | Notable Gaps |
|---------|-------|-------------|
| 01 Getting Started | what-is-scenia, first-launch, navigating-the-app | None |
| 02 Timeline | reading, configuring, creating, moving/resizing, conflicts, today-indicator | None |
| 03 Initiatives | editing, initiative-fields, deleting | CapEx/OpEx split not clearly documented |
| 04 Dependencies | drawing, types, editing, milestones, critical-path | Segment-to-initiative dependencies not covered |
| 05 Applications | adding, lifecycle-segments, managing-segments, display-mode | Vertical segment resize (rowSpan) not covered |
| 06 Display Settings | colour-modes, grouping-modes, inline-toggles, zoom-and-columns, legend | DTS Phase colour mode and DTS Phase grouping not documented |
| 07 Data Manager | overview, inline-editing, csv-paste, search-and-filter | None |
| 08 Resources | resource-roster, assigning-resources | None |
| 09 Reports | overview (6 types), each report has a page | Overview still says "five" cards; should be six |
| 10 Version History | saving, comparing, restoring | None |
| 11 Import & Export | excel-import, excel-export, geanz-catalogue, dts-template, pdf-svg-export | JPG export not mentioned in pdf-svg-export.md |
| 12 Mobile | card-view, mobile-settings | DTS fields on mobile cards not documented |

---

## 5. Gap Analysis

### 5.1 Content That Is Actively Misleading (Fix First)

These are factual errors in existing documentation — the described behaviour does not match the shipped code.

| # | Location | Issue |
|---|----------|-------|
| **M-1** | `docs/user-stories/06-reports.md` (US-RP-01) | States the home screen has **"four"** report cards. Code renders **six** (Maturity Heatmap and DTS Alignment were added). |
| **M-2** | `docs/user-guide/09-reports/overview.md` | Opening sentence says **"five"** report cards. Actual count is six. |
| **M-3** | `docs/user-stories/02-initiative-management.md` (US-IM-06) | References a single `budget` field. Code has been split into **`capex` and `opex`** (US-03). Story is stale. |
| **M-4** | `docs/user-guide/09-reports/budget-report.md` | Describes "initiative budgets" generically. Does not reflect the CapEx/OpEx split. |
| **M-5** | `docs/user-stories/09-display-settings.md` (US-DS-01) | Lists **three** colour modes (Programme, Strategy, Progress). Code supports **five**: Programme, Strategy, Progress, RAG Status, and DTS Phase. |
| **M-6** | `docs/user-stories/09-display-settings.md` (US-DS-02) | Lists **three** grouping modes (Asset, Programme, Strategy). Code supports **four** — also DTS Phase grouping. |

---

### 5.2 Missing User Guide Documentation (Shipped Features, No Docs)

Features that are fully coded and E2E-tested but have no or inadequate user guide coverage.

| # | Feature | Where in Code | Guide Gap |
|---|---------|--------------|-----------|
| **G-1** | **JPG export** | `DataControls.tsx`, `pdf.ts` | `pdf-svg-export.md` covers PDF and SVG only. JPG not mentioned. |
| **G-2** | **DTS Phase colour mode** | `Timeline.tsx` `colorBy: 'dts-phase'` | Not in `colour-modes.md`. Only obliquely mentioned in `dts-template.md`. |
| **G-3** | **DTS Phase grouping** | `Timeline.tsx` `groupBy: 'dts-phase'` | Not in `grouping-modes.md`. |
| **G-4** | **DTS Cluster field** | `TimelineSettings.clusterName`, `InitiativePanel.tsx` | Not in any user guide page. |
| **G-5** | **DTS Customer Layer assets** | `dtsCatalogue.ts` | Mentioned in `dts-template.md` obliquely; no dedicated explanation. |
| **G-6** | **GEANZ-to-DTS cross-mapping** | Badge on GEANZ area rows in Timeline | Not documented anywhere in the user guide. |
| **G-7** | **DTS fields on mobile cards** | `MobileCardView.tsx` | Not documented in `card-view.md` or `mobile-settings.md`. |
| **G-8** | **Vertical segment resize (rowSpan)** | Segment drag in `Timeline.tsx` | Not documented in `managing-segments.md`. |
| **G-9** | **CapEx/OpEx breakdown in budget report** | `ReportsView.tsx`, DTS Phase breakdown | `budget-report.md` refers to budgets generically; CapEx/OpEx split and DTS Phase breakdown not explained. |

---

### 5.3 Missing User Stories (Code + E2E Exist, No Story File)

These features are shipped and tested but have never had a formal User Story written. There are ~25 such features. For a quality polish pass, the recommended action is to write a User Story file for the most significant ones so the repo is self-documenting.

**Highest priority (user-facing, non-trivial features):**

| Informal ID | Feature | Recommended New Story ID |
|-------------|---------|--------------------------|
| US-03 | CapEx/OpEx budget split | US-IM-08 |
| US-18 | Template demo data toggle | US-DA-10 |
| US-19 | DTS Adoption Status per asset | US-AL-10 |
| US-20 | DTS Alignment Coverage report | US-RP-06 |
| US-21 | DTS Phase field on initiatives | US-IM-09 |
| US-23 | DTS Summary tab in Excel export | US-DA-11 |
| US-DTS-02 | DTS Phase colour mode | US-DS-08 |
| US-IE-01..04 | Initiative bar UX (toolbar, layout) | US-IM-10 |
| _(none)_ | Maturity Heatmap report | US-RP-07 |
| _(none)_ | JPG export | US-DA-12 |

**Lower priority (safety/technical features — brief story is sufficient):**

| Informal ID | Feature |
|-------------|---------|
| US-02 | DB error handling |
| US-04 | Export includes all entity types |
| US-05 | Segment dependency relationships |
| US-06 | Entity key uniqueness enforcement |
| US-07 | Legend expanded in PDF export |
| US-BUG-01 | New initiative immediately editable |

---

### 5.4 Missing E2E Test

| Story | Feature | Recommended Action |
|-------|---------|-------------------|
| **US-DS-05** | Sidebar column resize | Write `e2e/sidebar-resize.spec.ts` confirming column width persists to IndexedDB after drag. |

---

## 6. Recommended Actions (Priority Order)

### Phase 1 — Fix Misleading Content (30 min)

These are factual corrections — no new content needed, just update existing text.

1. **`docs/user-guide/09-reports/overview.md`** — Change "five" to "six" report cards; add Maturity Heatmap and DTS Alignment to the list.
2. **`docs/user-stories/06-reports.md` (US-RP-01)** — Update acceptance criteria: "four selectable report cards" → "six selectable report cards"; add the two missing report names.
3. **`docs/user-stories/02-initiative-management.md` (US-IM-06)** — Update budget AC to reflect CapEx + OpEx fields instead of a single budget field.
4. **`docs/user-guide/09-reports/budget-report.md`** — Add a section explaining the CapEx/OpEx split and the DTS Phase breakdown row in the table.
5. **`docs/user-stories/09-display-settings.md` (US-DS-01)** — Add RAG Status and DTS Phase to the list of colour modes.
6. **`docs/user-stories/09-display-settings.md` (US-DS-02)** — Add DTS Phase to the list of grouping modes.

### Phase 2 — Fill User Guide Gaps (2–3 hours)

New sections or additions to existing pages for shipped, undocumented features.

7. **`docs/user-guide/11-import-export/pdf-svg-export.md`** — Add a paragraph on JPG export: when to use it, how to trigger it, format differences.
8. **`docs/user-guide/06-display-settings/colour-modes.md`** — Add DTS Phase colour mode (how it works, which template enables it).
9. **`docs/user-guide/06-display-settings/grouping-modes.md`** — Add DTS Phase grouping mode.
10. **`docs/user-guide/05-applications/managing-segments.md`** — Add vertical resize (rowSpan drag) instruction.
11. **`docs/user-guide/11-import-export/dts-template.md`** — Add dedicated sections for: DTS Phase field on initiatives, DTS Cluster field, Customer Layer assets, GEANZ-to-DTS cross-mapping badges.
12. **`docs/user-guide/12-mobile/card-view.md`** — Add DTS fields displayed on mobile cards.
13. **`docs/user-guide/03-initiatives/initiative-fields.md`** — Update budget entry to describe CapEx and OpEx as separate fields.

### Phase 3 — Write Missing User Stories (1–2 hours)

Create story files for the 10 highest-priority undocumented features. Each story only needs an ID, title, and 3–5 acceptance criteria.

14. Write `US-IM-08` — CapEx/OpEx Budget Split
15. Write `US-IM-09` — DTS Phase Field on Initiatives
16. Write `US-IM-10` — Initiative Bar UX (toolbar, content layout)
17. Write `US-DS-08` — DTS Phase Colour Mode
18. Write `US-RP-06` — DTS Alignment Coverage Report
19. Write `US-RP-07` — Maturity Heatmap Report
20. Write `US-DA-10` — Template Demo Data Toggle
21. Write `US-DA-11` — DTS Summary Tab in Excel Export
22. Write `US-DA-12` — JPG Export
23. Write `US-AL-10` — DTS Adoption Status per Asset

### Phase 4 — Add Missing E2E Test (30 min)

24. Write `e2e/sidebar-resize.spec.ts` for **US-DS-05** — the only formal story with zero E2E coverage. Test: drag sidebar column divider → assert new width persists after page reload.

---

## 7. Sync Summary Table

| Area | Against Stories | Against Code | Against E2E | Against Guide |
|------|----------------|--------------|-------------|---------------|
| **User Stories** | — | 6 stale ACs | 1 story uncovered | 6 stale ACs |
| **Code** | ~25 features unstorified | — | 1 feature untested (US-DS-05) | 9 features undocumented |
| **E2E Tests** | ~25 informal IDs, no story | All tests match real code | — | n/a |
| **User Guide** | n/a | 9 gaps | n/a | — |

The app is in good shape overall — all code has E2E coverage except one story (US-DS-05), and there are no tests that reference non-existent features. The main work is **documentation catch-up**: ~25 stories that were shipped without a formal story file, 9 user guide gaps, and 6 stale acceptance criteria in existing stories.
