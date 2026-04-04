# E2E Test Suite Consolidation

## Why

The suite grew to 144 files / 706 tests via TDD (one spec per user story). GitHub Actions runs on
`ubuntu-latest` (2-core) with `workers: 2`, making the full suite take ~14 minutes — over our
10-minute target. The root problem is too many files testing near-identical setups, not the tests
themselves being slow individually.

## Approach

Consolidate ~144 files → ~26 files grouped by feature area. **Do not shard.** Do not skip
meaningful tests. Reduce redundancy and lower timeouts.

### Rules

1. **Merge files by feature area** — one spec per logical feature (see groups below)
2. **Merge near-identical tests** — if two tests assert the same behaviour from slightly different
   angles, keep the more robust one
3. **Drop narrow UI-detail tests** — tests that only assert exact pixel positions, CSS class names,
   or single-element presence with no interaction. Replace with behavioural equivalents where
   possible
4. **Lower timeouts** — `waitForSelector` default drops from 20000ms → 10000ms; post-load
   interaction waits drop to 5000ms. The global `expect.timeout` is already 10000ms in
   playwright.config.ts
5. **Add DataManager waitForSelector** — DataManager is lazy-loaded; always wait for a real
   element after clicking the Data tab before calling `.count()` or reading values
6. **Extract shared helpers** where the same multi-step setup appears in 3+ files (e.g.
   `loadDtsTemplate`, `loadGeanzTemplate`)
7. **Keep all persistence tests** — "persists after reload" tests catch a whole class of bugs that
   non-reload tests can't. Do not drop these
8. **Keep all DTS tests** — DTS is a core workspace type; coverage reduction there is not acceptable

## Groups & Status

| # | Group | Source files | Target file | Status |
|---|-------|-------------|-------------|--------|
| 1 | accessibility | accessibility-focus-trap, accessibility-table-aria-labels, accessibility-toggles | accessibility.spec.ts | ✅ PR #12 |
| 2 | arrows | arrow-z-index, arrow-selection, arrow-label-tooltip | arrows.spec.ts | 🔲 |
| 3 | assets | asset-categories, asset-reordering, category-reordering | assets.spec.ts | 🔲 |
| 4 | budget | budget-summary, budget-visualisation, capex-opex, grouped-budget | budget.spec.ts | 🔲 |
| 5 | conflicts | conflict-boundary, conflict-detection-toggle | conflicts.spec.ts | 🔲 |
| 6 | core | navigation, confirm-modal, keyboard-shortcuts, search-filter, landing-page, help-guide, error-boundary, modal-error-boundary | core.spec.ts | 🔲 |
| 7 | data | data-manager, data-manager-layout, data-controls, data-validation, db-error-handling, demo-data-dates | data.spec.ts | 🔲 |
| 8 | dependencies | dependencies-core, dependencies-data, dependencies-display | dependencies.spec.ts | 🔲 |
| 9 | display | display-mode, display-mode-empty-rows, display-toggles, description-display, colour-by-status, collapsible-rows, visualiser-only-controls | display.spec.ts | 🔲 |
| 10 | dts | dts-phase-field, dts-demo-data, dts-phases-configurable, dts-adoption-status, dts-customer-layer, dts-phase-colour-mode, dts-alignment-report, dts-cluster-field, dts-label-attribution, dts-segment-labels, dts-geanz-crossmap, dts-excel-export | dts.spec.ts | 🔲 |
| 11 | features | features-modal, features-modal-cards, validate-feature-animations | features.spec.ts | 🔲 |
| 12 | geanz | geanz-demo-data, geanz-catalogue | geanz.spec.ts | 🔲 |
| 13 | grouped | grouped_initiative_description, grouped-description-narrow-bar, grouped-description-legacy-data, grouped-description-no-truncation, grouped-bullet-description, initiative-edit-grouping, initiative-grouping | grouped.spec.ts | 🔲 |
| 14 | import-export | import-merge, import-schema-validation, excel-import-validation, import-error-paths, export-all-entities, import-export-notifications, jpg-export, pdf-legend, data-controls | import-export.spec.ts | 🔲 |
| 15 | initiatives | initiative-panel, initiative-panel-related, initiative-panel-date-fields-mobile, initiative-create-edit, initiative-deletion, initiative-drag, initiative-bar-parity, initiative-bar-layout, initiative-bar-ux, initiative-position-stability, duplicate-initiative-id, entity-id-uniqueness, intra-asset-spacing | initiatives.spec.ts | 🔲 |
| 16 | milestones | milestone-drag, milestone-label-side, milestone-swimlane-span | milestones.spec.ts | 🔲 |
| 17 | mobile | mobile-card-view, mobile-card-toggles, mobile-layout, initiative-panel-date-fields-mobile | mobile.spec.ts | 🔲 |
| 18 | reports | reports-mode, reports-home, capacity-report, maturity-heatmap, rag-status, report-history-diff, reports-versions-error | reports.spec.ts | 🔲 |
| 19 | segments | segment-delete-button, segment-vertical-drag-stability, segment-drag-improvements, segment-vertical-resize, segment-label-clamp, segment-application-selector, segment-conflict-resolution, segment-delete-confirm | segments.spec.ts | 🔲 |
| 20 | swimlanes | swimlane-grouping, swimlane-height-collapse, swimlane-padding | swimlanes.spec.ts | 🔲 |
| 21 | timeline | timeline-create, timeline-settings, timeline-start-date, timeline-weekly-columns-monday, snap-to-month, today-indicator, zoom-control, floating-legend, critical-path, view-options-popover | timeline.spec.ts | 🔲 |
| 22 | tutorial | tutorial-content, tutorial-modal | tutorial.spec.ts | 🔲 |
| 23 | undo-redo | undo-redo, undo-redo-edge-cases, undo-depth | undo-redo.spec.ts | 🔲 |
| 24 | version-history | version-history, version-snapshot-integrity | version-history.spec.ts | 🔲 |
| 25 | visualiser | visualiser, visualiser-only-controls | visualiser.spec.ts | 🔲 |
| 26 | workspace | workspace-templates, template-demo-toggle, large-dataset, cascading-deletes, security-headers, owner-assignee, progress-tracking, resources, labels, tap-to-select, table-sorting | workspace.spec.ts | 🔲 |

## Per-group PR naming

`test: consolidate <group> specs (N files → 1)`

## Verification checklist per group

- [ ] New consolidated file passes all its tests locally
- [ ] Old source files deleted
- [ ] Test count in commit message: `N files → 1, X tests → Y`
- [ ] No 20000ms timeouts remaining in the new file (max 10000ms for initial page load)
- [ ] Branch: `test/consolidate-<group>`
