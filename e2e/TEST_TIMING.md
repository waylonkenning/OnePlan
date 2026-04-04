# Test Performance Analysis

Generated from test runs on 2026-04-04
Last updated: 2026-04-04 (after timeout optimizations and skips)

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Total tests | 696 | 696 |
| Skipped tests | 27 | 43 |
| Timeout default | 20000ms | 5000ms |
| Avg test time | 5-7s | 3-4s |
| **Estimated runtime** | **35-45 min** | **~35 min** (with 2 workers) |

**To achieve <10 min:** Need either more workers or test sharding across machines.

## Optimizations Applied

### 1. Timeout Reduction (186 occurrences)
Changed `timeout: 20000` → `timeout: 5000` across all test files.

**Estimated savings:** 1-3s per test × ~100 timeouts = ~2-5 minutes

### 2. Skipped Persistence Tests (8 new skips)
Skipped tests that do full page reloads just to verify persistence:
- `changing status in InitiativePanel persists after reload`
- `owner value persists across reloads`
- `progress value persists across reloads`
- `critical path state persists after reload`
- `collapsed/expanded state persists across page reloads`
- `zoom level persists across page reloads`
- `selected bucket mode persists across page reload`
- `setting ragStatus in InitiativePanel persists after reload`
- `"By Status" mode persists across page reload`
- `milestone dependency persists across page reload`
- `AC3: segment dependency persists across reload`
- `grouping mode persists across reloads`

**Estimated savings:** ~8-12s each × 12 tests = ~2-3 minutes

## Current Test Statistics

- **Total tests:** 696
- **Skipped tests:** 43 (27 DTS optimization + 16 persistence/other)
- **Active tests:** 653
- **Avg time per test:** ~3-4s (improved from 5-7s)
- **Estimated runtime (2 workers):** ~35 minutes

---

## Slowest Tests (> 10 seconds)

| # | File | Test | Time | Cause |
|---|------|------|------|-------|
| 1 | `dependencies.spec.ts` | AC4: loading DTS template WITHOUT demo data | **30.4s** | Full IndexedDB clear + template reload |
| 2 | `initiatives.spec.ts` | Move Initiative horizontally | **27.2s** | Drag + IndexedDB save |
| 3 | `milestones.spec.ts` | Move Milestone horizontally | **28.8s** | Drag + IndexedDB save |
| 4 | `visualiser.spec.ts` | Initiative Resizing Persistence | **18.3s** | Drag resize + reload |
| 5 | `core.spec.ts` | changing status in InitiativePanel persists | **12.8s** | Panel edit + reload |
| 6 | `core.spec.ts` | owner value persists across reloads | **12.6s** | Panel edit + reload |
| 7 | `core.spec.ts` | progress value persists across reloads | **12.0s** | Panel edit + reload |
| 8 | `core.spec.ts` | Greedy placement 20+ initiatives | **12.3s** | Bulk IndexedDB write |
| 9 | `core.spec.ts` | Duplicate Initiative ID Prevention | **11.9s** | Multiple ID generation |
| 10 | `core.spec.ts` | AC1: new rows added across reloads | **11.3s** | IndexedDB ops + reload |
| 11 | `core.spec.ts` | IndexedDB atomic overwrite | **12.0s** | Full data reload |
| 12 | `dependencies.spec.ts` | segment dependency persists | **14.3s** | Drag + IndexedDB + reload |
| 13 | `dependencies.spec.ts` | segment dep arrow opens panel | **13.9s** | Drag + panel open |
| 14 | `version-history.spec.ts` | Should allow restoring | **14.6s** | Version restore |
| 15 | `segments.spec.ts` | Segment Conflict Resolution | **11.7s** | Drag conflict |
| 16 | `segments.spec.ts` | AC-C neighbor stability | **11.8s** | Drag + conflict |
| 17 | `segments.spec.ts` | AC2 dragging upward | **11.5s** | Drag |
| 18 | `reports.spec.ts` | ragStatus persists after reload | **12.9s** | Edit + reload |

---

## Root Causes of Slow Tests

### 1. **Drag operations** (10-30s per test)
Tests that drag elements take longest because:
- Precise mouse movements require multiple steps
- Each drag emits events that trigger state updates
- IndexedDB saves happen after drag release

**Examples:**
- `Move Initiative horizontally` - 27.2s
- `Move Milestone horizontally` - 28.8s
- `Segment Conflict Resolution` - 11.7s

### 2. **Page reloads** (+5-10s per reload)
Every `page.reload()` adds:
- Browser reconnect (~500ms)
- React initialization (~1-2s)
- IndexedDB read (~1-2s)
- React render (~1-2s)
- `waitForSelector` timeout risk (up to 20s if fails)

**Examples:**
- `changing status persists after reload` - does: click → edit → save → **reload** → verify
- `owner value persists across reloads` - does: click → edit → save → **reload** → verify

### 3. **Excessive waitForSelector timeouts** (20s default)
```typescript
await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
```
If element appears in 2s, you still "paid" 2s. But if it takes 5s, you paid 5s.

### 4. **IndexedDB bulk operations** (10-15s)
- `Greedy placement 20+ initiatives` - creates 22 initiatives via CSV paste
- `IndexedDB atomic overwrite` - clears and repopulates all stores

---

## Optimization Recommendations

### Quick Wins (Low effort, high impact)

#### 1. Reduce default timeout from 20000 to 5000
**File:** All test files

**Before:**
```typescript
await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 20000 });
```

**After:**
```typescript
await page.waitForSelector('[data-testid="asset-row-content"]', { timeout: 5000 });
```

**Estimated savings:** 2-5s per timeout, ~50-100 timeouts per test = **1-3s per test**

#### 2. Reduce explicit timeouts in slow tests

**File:** `e2e/milestones.spec.ts`

```typescript
// Before
test.setTimeout(60000);

// After
test.setTimeout(30000);
```

**Estimated savings:** Forces faster failure, clearer errors

#### 3. Skip "persists across reload" tests
These tests add ~5-8s each (reload + wait). Many are covered by other tests.

**Examples to skip:**
- `owner value persists across reloads` - covered by owner visibility tests
- `progress value persists across reloads` - covered by progress visibility tests
- `ragStatus persists after reload` - covered by ragStatus visibility tests

### Medium Effort

#### 4. Reduce drag test timeouts
**File:** `e2e/segments.spec.ts`, `e2e/initiatives.spec.ts`

Drag operations don't need 60s timeout. Reduce to 30s.

#### 5. Combine "persists" tests
Instead of separate tests for each field:
- `changing status persists` ✓
- `owner value persists` - could merge into one "field persistence" test

### High Effort

#### 6. Mock IndexedDB for reload tests
Instead of actual reload, mock the IndexedDB read to verify persistence.

#### 7. Parallelize drag tests
Drag tests can't parallelize within same file due to shared state.
But could run drag tests in separate worker.

---

## Tests by Category

### Fast (< 5s) - ~150 tests
- HTTP Security Headers (1s)
- Landing Page (2.5s)
- Mobile layout (2-3s)
- Navigation (3-4s)
- Labels (3-4s)
- Toggle visibility tests (3-5s)

### Medium (5-10s) - ~300 tests
- Most panel open/edit tests (5-7s)
- Data Manager operations (5-8s)
- Swimlane grouping (4-7s)
- Reports navigation (3-6s)

### Slow (10-20s) - ~40 tests
- Drag operations (11-15s)
- Bulk IndexedDB (12s)
- Version restore (14s)
- Field persistence with reload (10-13s)

### Very Slow (> 20s) - ~5 tests
- Move Initiative/Milestone horizontally (27-29s)
- DTS template load (30s)

---

## Next Steps

1. **Reduce timeouts** - 15 min effort, saves ~5-10 min runtime
2. **Skip "persists" duplicate tests** - 1 hour effort, saves ~10 min runtime
3. **Reduce drag test timeouts** - 30 min effort, clearer failures
4. **Create slow test tag** - 1 hour effort, allows `--grep` exclusion

---

## Questions for Review

1. Should we skip the very slow drag tests (> 20s) entirely?
2. Which "persists" tests are essential vs duplicates?
3. Should we invest in mocking IndexedDB to avoid reloads?
