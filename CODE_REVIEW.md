# Scenia Code Review

**Date:** 2026-04-04
**Reviewer:** AI Code Review
**Codebase Version:** Scenia (latest commit)
**Lines Reviewed:** ~6,308 source lines + ~13,101 E2E test lines

---

## Summary

Scenia is a well-structured React + TypeScript application for IT initiative planning and roadmap visualization. The codebase demonstrates good practices in some areas (TDD with E2E tests, IndexedDB persistence, comprehensive type definitions) but has significant room for improvement in others (monolithic components, state management, performance).

**Overall Assessment:** The code is functional and well-tested but would benefit from refactoring to improve maintainability and performance.

| Category | Rating | Notes |
|----------|--------|-------|
| Functionality | Good | Works as intended, good test coverage |
| Code Quality | Medium | Monolithic components, some code smells |
| Performance | Medium | Large bundle, some re-render issues |
| Maintainability | Medium | Hard to navigate large files |
| Security | Good | No obvious vulnerabilities |

---

## Bugs Found

### HIGH Priority

#### 1. Potential Race Condition in Undo/Redo (App.tsx:305-331)

```typescript
const handleUndo = () => {
  if (undoStack.length === 0) return;
  const previousState = undoStack[undoStack.length - 1];
  // ...
  handleUpdate(previousState, true);
};
```

**Issue:** The undo/redo implementation captures `getCurrentStateRef.current()` which is a snapshot of React state. Due to React's batching, the state captured may be stale if multiple `handleUpdate` calls are queued.

**Recommendation:** Use a functional update pattern or implement immutable state snapshots that don't depend on ref capturing.

---

#### 2. Memory Leak Risk in Timeline.tsx Event Listeners (Timeline.tsx:492-579)

```typescript
const handleGestureUp = () => {
  gestureDecided = true;
  window.removeEventListener('mousemove', handleGestureMove);
  window.removeEventListener('mouseup', handleGestureUp); // Removes 'mouseup' but NOT 'handleGestureMove' if gestureDecided was already true
};
```

**Issue:** If `gestureDecided` is true and `handleGestureUp` is called, `handleGestureMove` is removed. However, if the component unmounts while a gesture is in progress, listeners may not be cleaned up properly.

**Recommendation:** Add cleanup in `useEffect` return or use AbortController for listener cleanup.

---

#### 3. IndexedDB Transaction Failure Risk (db.ts:257-304)

```typescript
const tx = db.transaction(stores, 'readwrite');
// ... queue operations
await Promise.all(allPromises); // Operations queued but not committed
await tx.done;
```

**Issue:** If `Promise.all(allPromises)` rejects, `tx.done` is never awaited, potentially leaving the transaction in an inconsistent state. The `saveAppData` function does a full clear + rewrite, so failure mid-transaction could result in data loss.

**Recommendation:** Wrap in try-catch and implement rollback logic or use a single atomic operation approach.

---

### MEDIUM Priority

#### 4. Date Parsing Without Validation (criticalPath.ts:27-29)

```typescript
const start = new Date(init.startDate).getTime();
const end = new Date(init.endDate).getTime();
const days = Math.max(1, Math.round((end - start) / 86_400_000));
```

**Issue:** If `startDate` or `endDate` is invalid (e.g., empty string, malformed ISO), `new Date()` returns `Invalid Date` which is `NaN` when converted. This could cause unexpected behavior in critical path calculation.

**Recommendation:** Add validation before parsing dates.

#### 5. Type Assertion to `any` in App.tsx

Throughout App.tsx, there are casts like:
```typescript
setApplicationSegments((dbData as any).applicationSegments || []);
```

**Issue:** This bypasses TypeScript's type checking and could mask bugs if the database schema changes.

**Recommendation:** Update `getAppData` return type to include all optional fields properly.

#### 6. Missing Error Boundary in Some Modal Flows

**Issue:** If a modal (e.g., `InitiativePanel`, `DependencyPanel`) throws an error during render, only the error boundary at the top level catches it, potentially losing user's unsaved work in the main view.

**Recommendation:** Wrap individual modals in their own error boundaries.

---

### LOW Priority

#### 7. Magic Strings for ID Prefixes

```typescript
const newId = `init-new-${initIdCounter.current}`; // Timeline.tsx:463
const appId = `app-migrated-${assetId}-${counter++}`; // db.ts:125
const savedSeg = { ...seg, id: `seg-${Date.now()}` }; // App.tsx:377
```

**Issue:** Hardcoded string prefixes are scattered throughout. If format needs to change, all locations must be updated.

**Recommendation:** Create a centralized ID generation utility.

---

## Optimization Opportunities

### HIGH Priority

#### 1. Large Bundle Size (1.8MB Main Chunk)

The build output shows:
```
dist/assets/index-CYvelM16.js  1,807.88 kB │ gzip: 552.33 kB
```

**Recommendation:**
- Implement code splitting using dynamic `import()`
- Split by route: timeline, data-manager, reports, help
- Lazy load heavy components like `ReportsView` and `DataManager`
- Consider using `React.lazy` for modals

#### 2. React Re-render Issues in Timeline.tsx

**Issue:** `localInitiatives`, `localMilestones`, `localSegments` are managed with `useState` but updated via `useEffect` watching parent props. This creates double-render cycles during drag operations.

**Recommendation:** Use `useRef` for drag state or implement `useDeferredValue` for non-critical updates.

#### 3. Prop Drilling in App.tsx

The `Timeline` component receives 20+ props. Similar prop counts exist for `MobileCardView`, `DataManager`, and `ReportsView`.

**Recommendation:**
- Use React Context for global state (settings, theme)
- Use a state management library (Zustand, Jotai) for complex state
- Break App.tsx into smaller feature components with their own context

---

### MEDIUM Priority

#### 4. Missing Memoization in filteredInitiatives (Timeline.tsx:235-253)

```typescript
const filteredInitiatives = useMemo(() => {
  // ... filter logic
}, [initiatives, searchQuery, assets, programmes, strategies]);
```

**Issue:** This filters on every render even though `assets`, `programmes`, `strategies` are rarely used in the filter logic.

**Recommendation:** Memoize more granularly or restructure to avoid recalculation.

#### 5. Multiple `useEffect` Hooks with Similar Dependencies

There are 10+ `useEffect` hooks in Timeline.tsx that all depend on state changes during drag operations. This can cause cascading re-renders.

**Recommendation:** Consolidate related effects or use a single effect with combined logic.

#### 6. Excel Import Not Validating Data Types

```typescript
result.initiatives = getSheetData<Initiative>('Initiatives').map((init: any) => ({
  ...init,
  capex: Number(init.capex) || Number(init.budget) || 0,
  // No validation of required fields
}));
```

**Issue:** Malformed Excel data could corrupt application state.

**Recommendation:** Add schema validation using Zod or Valibot before import.

---

### LOW Priority

#### 7. No Virtualization for Large Lists

**Issue:** If a user has 100+ initiatives or assets, all are rendered to the DOM even if off-screen.

**Recommendation:** Implement virtual scrolling for the timeline rows if dataset grows large.

#### 8. Unnecessary Object Creation in Render

```typescript
const programmeMap = useMemo(() => new Map(programmes.map(p => [p.id, p])), [programmes]);
```

This is good, but similar patterns could be applied to other lookups that currently use `.find()`.

---

## Refactoring Suggestions

### HIGH Priority

#### 1. Break Down Timeline.tsx (2,706 lines)

**Current Structure:** Single monolithic component handling:
- Timeline grid rendering
- Drag-and-drop interactions
- Dependency arrow drawing
- Asset grouping
- GEANZ catalogue
- Milestone handling
- Segment layout

**Proposed Structure:**
```
components/
  Timeline/
    Timeline.tsx           # Main container
    TimelineGrid.tsx      # Grid rendering
    TimelineRow.tsx       # Single asset row
    InitiativeBar.tsx     # Initiative rendering (already exists)
    DependencyArrows.tsx  # SVG arrow layer
    DragContext.tsx       # Shared drag state
    hooks/
      useTimelineDrag.ts
      useTimelineLayout.ts
```

**Recommendation:** This is a significant undertaking (2-4 weeks). Consider doing it incrementally per feature freeze.

#### 2. Break Down App.tsx (1,361 lines)

**Current Structure:** Central state manager with UI.

**Proposed Structure:**
```
components/
  App/
    App.tsx                    # Root component
    contexts/
      WorkspaceContext.tsx      # All workspace state
      ViewContext.tsx           # UI state (view, modals)
    Header/
      Header.tsx
      ViewToggle.tsx
      SearchBar.tsx
      SettingsPanels/
    modals/
      TemplatePickerModal/
      TutorialModal/
      ...
```

#### 3. Extract State Management to Zustand/Jotai

**Current:** 15+ `useState` hooks + prop drilling

**Proposed:** Single store with slices:
```typescript
// stores/workspaceStore.ts
const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  assets: [],
  initiatives: [],
  // ...
  updateInitiative: (id, data) => set(state => ({
    initiatives: state.initiatives.map(i => i.id === id ? data : i)
  })),
  // ...
}));
```

---

### MEDIUM Priority

#### 4. Extract Conflict Resolution to Separate Module

`resolveSegmentConflicts` in `timelineLayout.ts` handles complex row/rowspan calculations. This should have:
- Unit tests (currently no tests for layout algorithms)
- Extracted type definitions for conflict resolution results

#### 5. Create Validation Library

Currently validation is spread across components. Create a centralized validation module:
```typescript
// lib/validation/
  initiative.ts   # Initiative validation schemas
  asset.ts        # Asset validation
  import.ts       # Excel import validation
```

#### 6. Error Handling Improvements

**Current:** Errors logged to console with `console.error`.

**Proposed:**
- User-facing toast notifications for recoverable errors
- Sentry/logging service integration for production error tracking
- Structured error types with codes

---

## Security Concerns

### LOW Priority (Good Security Posture)

#### 1. No XSS Vulnerabilities Observed

The codebase uses React's default escaping and doesn't use `dangerouslySetInnerHTML` inappropriately.

#### 2. No SQL/NoSQL Injection (Client-Side Only)

IndexedDB queries use parameterized patterns; no raw query concatenation.

#### 3. Potential Improvement: CSP Headers

**Recommendation:** When deploying, ensure Content Security Policy headers are configured to prevent inline script execution if not already done in the hosting platform (Vercel/GCP).

#### 4. No Authentication/Authorization

**Note:** This is by design (client-side only app). If user authentication is added in the future:
- Ensure IndexedDB data is encrypted at rest
- Implement proper session management
- Add CSRF protection if backend is added

---

## Best Practices

### What's Done Well

1. **TDD with E2E Tests** - 141 test files with comprehensive coverage demonstrates commitment to quality.

2. **TypeScript Usage** - Strong typing throughout, though some `any` casts need addressing.

3. **IndexedDB Persistence** - Good migration system (version 13) with backward compatibility.

4. **Modular Component Structure** - Components are focused (mostly) and follow single responsibility.

5. **Accessibility** - Focus trapping, ARIA labels, keyboard shortcuts.

6. **Responsive Design** - Mobile-first approach with dedicated `MobileCardView`.

7. **Date Handling** - Uses `date-fns` library consistently.

8. **Error Boundaries** - Basic error boundary implemented.

### Areas for Improvement

1. **Comment Quality** - Few comments explaining complex logic.

2. **Naming Consistency** - Some inconsistent naming (e.g., `initiativeId` vs `initId`, `assetId` vs `id`).

3. **DRY Violations** - Repeated patterns for handleUpdate, state setting.

4. **No Unit Tests for Libraries** - Layout algorithms, critical path, validation have no unit tests.

5. **Bundle Size Monitoring** - No bundle analysis in CI/CD.

---

## Recommendations

### Immediate Actions (This Sprint)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| HIGH | Fix undo/redo race condition | 2h | Prevents data corruption |
| HIGH | Add try-catch to IndexedDB save | 1h | Prevents data loss |
| HIGH | Add validation to Excel import | 4h | Prevents bad data |
| MEDIUM | Add unit tests for criticalPath.ts | 2h | Catches edge cases |
| MEDIUM | Add date validation in criticalPath | 1h | Prevents NaN issues |
| LOW | Create ID generation utility | 2h | Maintainability |

### Short-term (Next Sprint)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| HIGH | Implement code splitting for bundle | 8h | 50%+ smaller initial load |
| HIGH | Add error boundaries to modals | 4h | Better UX on errors |
| MEDIUM | Extract validation library | 6h | Consistent validation |
| MEDIUM | Add bundle analysis to CI | 2h | Prevents regression |

### Long-term (Next Quarter)

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| HIGH | Break down Timeline.tsx | 40h | Maintainability |
| HIGH | Extract state management | 24h | Simpler components |
| MEDIUM | Virtual scrolling for large datasets | 16h | Performance |
| LOW | Add Sentry/logging | 8h | Debugging |

---

## Test Coverage Assessment

**E2E Tests:** 141 files, ~13,101 lines covering:
- Core CRUD operations
- Drag interactions
- Import/Export
- Views and navigation
- Accessibility

**Missing:**
- Unit tests for library functions (criticalPath, timelineLayout, validation)
- Unit tests for utility functions
- Performance tests for large datasets
- Bundle size regression tests

**Recommendation:** Add Jest/Vitest for unit tests alongside existing Playwright E2E tests.

---

## Appendix: File Complexity Rankings

| File | Lines | Complexity | Priority Refactor |
|------|-------|------------|-------------------|
| Timeline.tsx | 2,706 | High | Yes |
| App.tsx | 1,361 | High | Yes |
| EditableTable.tsx | 763 | Medium | Optional |
| ReportsView.tsx | 651 | Medium | Optional |
| MobileCardView.tsx | 644 | Medium | Optional |
| DataManager.tsx | 502 | Medium | Optional |
| db.ts | 321 | Low | Optional |

---

*Generated by AI Code Review - 2026-04-04*