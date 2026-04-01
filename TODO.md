# TODO

## Feature Enhancements

### Initiative Bar UX Improvements

- [ ] **US-IE-01: Selection highlight** — Replace invisible white ring with a 2px dashed high-contrast border when an initiative is selected; must be visually distinct from the conflict solid border
  - AC1: Single-click shows a 2px dashed `#1e293b` (slate-800) border on the bar
  - AC2: Clicking elsewhere removes the border
  - AC3: Border style is visually distinct from the solid conflict-detection border

- [ ] **US-IE-02: Floating action toolbar** — Show Edit and Link icon buttons in a strip above the selected bar on single-click; replaces the invisible white corner pencil button
  - AC1: Single-click reveals a floating strip above the bar with Edit (pencil) and Link (chain) icons
  - AC2: Edit icon opens InitiativePanel (same as current double-click)
  - AC3: Link icon initiates the drag-to-relate flow
  - AC4: Strip disappears when clicking elsewhere or pressing Escape

- [ ] **US-IE-03: Relationship drag discoverability** — Replace orange circle drag handle with a chain-link icon and add a descriptive tooltip
  - AC1: Drag handle uses a chain/link icon
  - AC2: Hovering shows tooltip: "Drag to another initiative to create a dependency"
  - AC3: Handle only visible when bar is selected (not always-on)

- [ ] **US-IE-04: Bar content layout** — Restructure initiative bar to give description its own full-width row; move budget to title row; pin owner avatar to corner
  - AC1: Budget label renders as a small pill right-aligned on the title row
  - AC2: Description occupies a full-width row (not shared with budget or owner)
  - AC3: Owner avatar is absolutely positioned in the top-right corner, not inline
  - AC4: Description is capped at 2 lines with ellipsis (`line-clamp-2`)

- [x] Rename "Colour by Status" to "Colour by Progress"
- [x] Add new "Colour by Status" — RAG traffic light (Green / Amber / Red) stored as a field on initiatives, with Colour by Status display mode
- [x] Add "Viewer mode" to templates modal — replaces Mixed template; triggers Excel import flow so users can upload and view a shared file; final four choices: Viewer, NZ Digital Target State, GEANZ Technology Catalogue, Blank

## E2E Test Suite Improvements

### Completed
- [x] Delete `capture-*.spec.ts` screenshot tests
- [x] Add form input validation tests
- [x] Add cascading delete state consistency tests

### Pending

#### P0 — Safety Net
- [x] Add dependency constraint validation tests
- [x] Add import error path tests
- [x] Add undo/redo edge case tests

#### P1 — Fragility
- [x] Replace CSS class assertions with computed style checks
- [x] Replace `waitForTimeout()` with deterministic waits

#### P2 — Organisation
- [x] Consolidate 15 dependency spec files into 3
- [x] Consolidate 17 mobile spec files into 2–3
- [x] Consolidate Data Manager spec files

## Bug Fixes

### Completed
- [x] Fix newly-created initiative showing "Create Initiative" title and no Delete button when re-opened (US-BUG-01)
- [x] Fix Data Manager initiatives table not scrollable with many rows (missing min-h-0)

#### P2 — Coverage
- [x] Add search & filter edge case tests
