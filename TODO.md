# TODO

## Feature Enhancements

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
- [ ] Replace CSS class assertions with computed style checks
- [ ] Replace `waitForTimeout()` with deterministic waits

#### P2 — Organisation
- [ ] Consolidate 15 dependency spec files into 3
- [ ] Consolidate 17 mobile spec files into 2–3
- [ ] Consolidate Data Manager spec files

#### P2 — Coverage
- [ ] Add search & filter edge case tests
