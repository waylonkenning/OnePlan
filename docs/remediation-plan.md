# Scenia — Code Remediation Plan

**Date:** 2026-03-20
**Scope:** Issues identified in open-source codebase review
**Priority order:** High → Medium → Low

---

## 1. Fix Active Lint Errors (High Priority)

**10 ESLint errors currently blocking clean builds.**

### 1a. `setState` called inside `useEffect` without cleanup

**Files:** `ApplicationSegmentPanel.tsx`, `DependencyPanel.tsx`

**Problem:** Setting state synchronously inside a `useEffect` triggers cascading renders, causing unnecessary re-renders on every parent update.

**Fix:** Move the state derivation to `useMemo` or compute the value during render instead of in an effect.

```tsx
// Before (causes cascade)
useEffect(() => {
  setDerivedValue(computeFrom(props));
}, [props]);

// After (compute during render, no extra render cycle)
const derivedValue = useMemo(() => computeFrom(props), [props]);
```

---

### 1b. Impure functions called during render

**File:** `EditableTable.tsx`

**Problem:** `Date.now()` and `Math.random()` are called directly during render, producing a new value every render cycle and breaking referential stability.

**Fix:** Move calls into `useRef` (for stable IDs) or `useMemo`/`useCallback` (for values derived once).

```tsx
// Before
const id = Math.random(); // new every render

// After
const id = useRef(Math.random()).current; // stable across renders
```

---

### 1c. Unused variables in test files (9 instances)

**Fix:** Either remove the unused imports/variables, or prefix with `_` if intentionally unused (ESLint convention).

---

### 1d. Missing `resources` dependency in `useCallback` (App.tsx)

**Fix:** Add `resources` to the dependency array, or if the callback is intentionally not reactive to `resources`, document the reasoning with an `eslint-disable` comment explaining why.

---

## 2. Decompose `Timeline.tsx` (High Priority)

**Current state:** 3,076 lines mixing three distinct responsibilities.

**Problem:** The file is unmaintainable at this size. Any change risks unintended side effects across unrelated logic.

**Proposed split into 4 modules:**

| New File | Responsibility | Approx Lines |
|----------|---------------|-------------|
| `Timeline.tsx` | Entry point, state wiring, renders sub-components | ~300 |
| `TimelineLayout.ts` | Layout algorithm — row assignment, column calculation, positioning | ~800 |
| `TimelineRenderer.tsx` | SVG and DOM rendering — bars, labels, grid, milestones | ~1,200 |
| `TimelineInteractions.ts` | Drag, resize, click, keyboard event handlers | ~600 |

**Migration approach:**
1. Extract `TimelineLayout.ts` first (pure functions, easiest to test in isolation)
2. Extract `TimelineInteractions.ts` (event handlers, no JSX)
3. Extract `TimelineRenderer.tsx` (pure rendering, props-in JSX-out)
4. Leave `Timeline.tsx` as the orchestrator

Each extraction should be accompanied by a Playwright E2E test confirming existing behaviour is unchanged.

---

## 3. Slice State Out of `App.tsx` (Medium Priority)

**Current state:** 11 `useState` calls in a single 953-line component, all passed as props throughout the tree (prop drilling).

**Problem:** Any state change in `App.tsx` triggers re-evaluation of all children. Adding new features compounds this.

**Proposed approach — domain-scoped reducers:**

Split state into 4 logical domains using `useReducer`:

| Domain | Entities |
|--------|----------|
| `planReducer` | initiatives, assets, milestones, dependencies |
| `uiReducer` | activeView, selectedInitiativeId, timelineSettings |
| `dataReducer` | resources, tags, programmes, lifecycleSegments |
| `historyReducer` | undoStack, redoStack |

Each reducer lives in `src/reducers/` and is consumed via React Context so deeply nested components can access only what they need without prop drilling.

**Example:**

```tsx
// src/reducers/planReducer.ts
type PlanAction =
  | { type: 'ADD_INITIATIVE'; payload: Initiative }
  | { type: 'UPDATE_INITIATIVE'; payload: Initiative }
  | { type: 'DELETE_INITIATIVE'; payload: string };

function planReducer(state: PlanState, action: PlanAction): PlanState { ... }
```

---

## 4. Memoize Critical Path Computation (Medium Priority)

**File:** `src/lib/criticalPath.ts` (called from `App.tsx` / `ReportsView.tsx`)

**Problem:** Critical path is recomputed on every render even when `initiatives` and `dependencies` have not changed.

**Fix:** Wrap the call in `useMemo` with stable dependencies:

```tsx
const criticalPath = useMemo(
  () => computeCriticalPath(initiatives, dependencies),
  [initiatives, dependencies]
);
```

Also consider memoizing intermediate values within `criticalPath.ts` itself (e.g., adjacency list construction) if the dataset grows large.

---

## 5. Replace `any` Types in Data Layer (Medium Priority)

**File:** `DataManager.tsx`

**Problem:** `updateData(key, newData: any[])` accepts any array, bypassing TypeScript's type safety entirely.

**Fix:** Use a discriminated union or generic constraint tied to the entity map:

```tsx
type EntityKey = keyof AppData; // 'initiatives' | 'assets' | 'milestones' | ...

function updateData<K extends EntityKey>(key: K, newData: AppData[K]): void {
  // now typed correctly per key
}
```

Also audit `EditableTable.tsx` for `parseFloat(aValue as any)` — replace with a typed parse helper:

```tsx
function parseNumeric(value: unknown): number {
  return typeof value === 'string' ? parseFloat(value) : Number(value);
}
```

---

## 6. Add Virtual Scrolling for Large Datasets (Low Priority)

**Problem:** No pagination or virtualisation means rendering 100+ initiatives will degrade performance noticeably (DOM node count, layout recalculation).

**Recommended library:** `@tanstack/react-virtual` (lightweight, headless, compatible with existing table structure)

**Scope:** `EditableTable.tsx` row rendering. The timeline bars in `Timeline.tsx` are already canvas/SVG-positioned so they're less affected.

---

## 7. Normalise TimelineSettings Type Inconsistency (Low Priority)

**Problem:** Some settings use `'on' | 'off'`, others use `'show' | 'hide'` for the same boolean concept. This causes confusion when reading conditional logic.

**Fix:** Standardise on `boolean` for all toggle settings in `types.ts`:

```tsx
// Before
showDependencies: 'on' | 'off';
showMilestones: 'show' | 'hide';

// After
showDependencies: boolean;
showMilestones: boolean;
```

This is a breaking change to persisted IndexedDB data — include a schema migration in `db.ts` (increment schema version, add `onupgradeneeded` handler to transform old values).

---

## 8. Fix UX Layout Issues (Low Priority)

Issues documented in `UX_OBSERVATIONS.md`:

| Issue | Proposed Fix |
|-------|-------------|
| iPad header wraps to 3 lines | Reduce header padding, abbreviate labels at `md` breakpoint |
| Legend too large | Collapse legend into a popover/tooltip triggered by an icon |
| Progress/Owner column header overlap in Data Manager | Fix column min-width constraint in `EditableTable.tsx` |
| Settings controls visible in irrelevant views | Gate settings panel render on `activeView === 'timeline'` |
| Reports view stacks all 4 reports | Replace stacked layout with card-based report selector |
| Features modal has placeholder images | Replace with actual screenshots (already captured in `public/features/`) |

---

## Suggested Implementation Order

| Step | Change | Rationale |
|------|--------|-----------|
| 1 | Fix lint errors (§1) | Immediate correctness wins, no architecture changes |
| 2 | Memoize critical path (§4) | Low-risk, high performance gain |
| 3 | Replace `any` types (§5) | Contained to data layer, low regression risk |
| 4 | Decompose Timeline.tsx (§2) | Biggest maintainability win, do before adding features |
| 5 | Slice App.tsx state (§3) | Required before Timeline decomposition is fully clean |
| 6 | Virtual scrolling (§6) | Only needed once dataset size is confirmed as a real pain point |
| 7 | Normalise settings types (§7) | Requires DB migration, do in a dedicated release |
| 8 | UX fixes (§8) | Parallel track with dev work |

Each step should follow the existing TDD process: write a failing Playwright test first, implement the fix, confirm the full suite passes before committing.
