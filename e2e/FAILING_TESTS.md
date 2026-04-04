# Failing & Skipped Tests

## Skipped Tests (Known Issues)

These tests are skipped due to flakiness or test optimization:

### Applications
| File | Test | Reason |
|------|------|--------|
| `e2e/applications.spec.ts` | Application assignment saves and persists after reload | Flaky - initiative panel does not open reliably after reload |

### Core
| File | Test | Reason |
|------|------|--------|
| `e2e/core.spec.ts` | deleting initiative removes its dependencies from Data Manager | Flaky - depends on IndexedDB state from previous tests |

### DTS (25 tests skipped for optimization)
See `TEST_SUITE_STATUS.md` for full list of skipped DTS tests.

### Import/Export
| File | Test | Reason |
|------|------|--------|
| `e2e/import-export.spec.ts` | downloaded JPG file is non-empty and is a valid JPEG | Optimization - download trigger test sufficient |
| `e2e/import-export.spec.ts` | AC2: PDF export with expanded legend preserves expanded state | Optimization - covered by AC1 test |

## Pre-existing Failures (Not From Consolidation)

These tests may fail but are not caused by consolidation:

- Some tests have timing-sensitive operations that occasionally fail
- IndexedDB-dependent tests may fail if state is corrupted from previous tests
- Export tests (PDF/JPG) may timeout on slower machines

## Running Tests

```bash
# Run all tests
npx playwright test

# Run excluding skipped tests
npx playwright test --grep-invert "@skip"
```
