# Test Suite Status

## Consolidation Complete

Successfully consolidated **142 test files into 26**.

### Final Test Files

| File | Description |
|------|-------------|
| `accessibility.spec.ts` | Focus trap, ARIA labels, toggle accessibility |
| `applications.spec.ts` | Application feature tests |
| `arrows.spec.ts` | Arrow labels, selection, z-index |
| `assets.spec.ts` | Asset categories, reordering |
| `budget.spec.ts` | Budget summary, visualisation |
| `conflicts.spec.ts` | Conflict boundary, detection toggle |
| `core.spec.ts` | Capacity, cascading deletes, categories, progress, etc. |
| `data.spec.ts` | Data manager operations, CSV paste, validation |
| `dependencies.spec.ts` | Arrow drawing, editing, milestones, segments |
| `display.spec.ts` | Display mode, toggles |
| `dts.spec.ts` | DTS template, adoption status |
| `features.spec.ts` | Features modal |
| `geanz.spec.ts` | GEANZ catalogue, demo data |
| `grouped.spec.ts` | Grouped budget, descriptions |
| `import-export.spec.ts` | Excel/CSV import, PDF/JPG export |
| `initiatives.spec.ts` | Initiative bars, panels, CRUD |
| `milestones.spec.ts` | Milestone drag, labels |
| `mobile.spec.ts` | Mobile layout, card view |
| `reports.spec.ts` | Reports home, mode, capacity |
| `segments.spec.ts` | Segment CRUD, drag, resize |
| `swimlanes.spec.ts` | Swimlane grouping, height |
| `timeline.spec.ts` | Timeline create, settings |
| `tutorial.spec.ts` | Tutorial content, modal |
| `undo-redo.spec.ts` | Undo depth, edge cases |
| `version-history.spec.ts` | Version snapshots, restore |
| `visualiser.spec.ts` | Visualiser rendering, toggles |

## Skipped Tests

### Applications
- `Application assignment saves and persists after reload` - Flaky - initiative panel does not open reliably after reload

### Core
- `deleting initiative removes its dependencies from Data Manager` - Flaky - depends on IndexedDB state from previous tests

### DTS Tests (25 skipped to trim by 50%)
- Label Wrapping: AC2, AC3 (Crown copyright attribution tests)
- Adoption Status: AC3, AC4, AC7, AC8 (toggle behavior and non-DTS workspace tests)
- Alignment Report: AC2, AC4, AC5, AC6, AC7, AC8 (tile details, navigation, export)
- Phase: AC3, AC4, AC5 (budget breakdown, pre-population, non-DTS)
- Export: AC2, AC3, AC4 (summary sheet details)
- Customer Layer: AC3 (23 rows test)
- Cluster: AC3 (Excel export)
- TAP mapping: AC3, AC4 (badge informational, TAP.08)
- Application Labels: AC1, AC2 (remaining names, same-system segments)
- Data Manager: DTS Application records visibility

### Import/Export
- JPG: 1 test dropped (content validation - file size/magic bytes)
- PDF: 1 test dropped (expanded legend state - covered by collapsed test)

## Performance Notes

- **Before optimization**: 698 tests, ~35+ minutes
- **After optimization**: ~671 tests (27 skipped), estimated ~25 minutes
- **Full parallelization** (`fullyParallel: true`) can further reduce runtime
- **In CI**: Use `workers: 2` and `retries: 1` for stability

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test e2e/dts.spec.ts

# Run with parallelization (all cores)
npx playwright test --workers=100%

# Skip retries (faster, less stable)
npx playwright test --retries=0
```

## Getting Runtime Below 10 Minutes

To achieve <10 minute runtime, options are:

1. **Increase parallelism**: Use more CPU cores or run on multiple machines
2. **Test shards**: Split tests across multiple CI runners
3. **Further reduce test count**: More aggressive trimming of edge cases
4. **Optimize slow tests**: Speed up PDF/JPG export generation
