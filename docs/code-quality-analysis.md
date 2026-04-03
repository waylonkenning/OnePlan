# Code Quality Analysis — Scenia

> Generated: 2026-04-02

---

## Summary

The codebase is functional and well-tested (669 E2E tests passing), but `Timeline.tsx` has become a monolith under feature growth. The highest-value improvements are extracting the three duplicated initiative bar render sites into a shared component, tightening `any` types, and adding IndexedDB error handling.

---

## HIGH — Fix Soon

### 1. Initiative bar JSX duplicated across 3 render sites

`src/components/Timeline.tsx`

The initiative bar layout (restructured in US-IE-01–04) is copy-pasted across three separate render paths. Any future change to bar layout must be made in all three places or it will silently regress in some views.

| Location | Lines | Context |
|---|---|---|
| Site A | ~1640–1738 | Asset/category swimlane (simplified) |
| Site B | ~1768–1818 | DTS Phase swimlane (minimal) |
| Site C | ~2013–2195 | Full-featured with group handling, resize handles |

**What diverges today:** Sites A and B lack the resize handle `onMouseDown` wiring that Site C has. If a user is in DTS Phase grouping mode, resize-by-drag may be broken.

**Fix:** Extract a shared `<InitiativeBar>` component accepting the bar's data, selection state, and callbacks. Each render site becomes a single `<InitiativeBar ... />` line.

---

### 2. Timeline.tsx is 2,920 lines — far beyond maintainable

`src/components/Timeline.tsx`

The component owns too many responsibilities:

- Swimlane rendering for 3 grouping modes (asset, programme/strategy, DTS phase)
- Initiative bar layout and interaction
- Application segment rendering and drag handling
- Dependency SVG drawing with stagger logic
- Milestone rendering and movement
- Conflict detection and markers
- Category collapse/expand and reordering
- 6 concurrent drag gesture state machines

**Fix (sequenced):**
1. Extract `<InitiativeBar>` (eliminates duplication, ~350 lines)
2. Extract `<DependencySvgLayer>` (SVG arrow drawing, ~200 lines)
3. Extract `<AssetSwimlaneRow>` / `<DtsPhaseSwimlaneRow>` (~300 lines each)

Target: reduce Timeline.tsx to ~1,200 lines.

---

### 3. `any` types in layout engine

`src/components/Timeline.tsx`

```typescript
// Line 183
const lastStableLayouts = useRef<Map<string, { items: any[]; height: number }>>

// Lines 878, 931, 932
const entities: any[] = [];
const finalItems: any[] = [];
const placedRects: any[] = [];
```

These represent the layout items computed per swimlane. Without types, properties like `isGroup`, `groupIds`, `groupProgrammeNames` are accessed without compile-time safety.

**Fix:** Define explicit interfaces:

```typescript
interface LayoutEntity {
  init: Initiative;
  isGroup: boolean;
  groupIds?: string[];
  groupProgrammeNames?: string;
  groupStrategyNames?: string;
}

interface PlacedRect {
  top: number;
  height: number;
  left: number;
  width: number;
}

interface LayoutItem extends LayoutEntity, PlacedRect {}
```

---

### 4. useEffect with 23 dependencies — stale closure risk

`src/components/Timeline.tsx`, ~line 846

The main mouse event registration effect lists 23 dependencies, meaning it tears down and re-registers all global `mousemove`/`mouseup` listeners on nearly every state change. During an active drag, if any dependency changes, the listeners are replaced mid-gesture — a potential source of dropped or doubled events.

```typescript
// Current — fragile
useEffect(() => {
  const handleMouseMove = (e) => { /* closes over localInitiatives, etc. */ };
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, [resizing, moving, movingMilestone, drawingDependency, /* ...20 more */]);
```

**Fix:** Store mutable drag state in a `useRef` rather than depending on re-registration. Register listeners once on mount, read gesture state from refs inside the handlers.

---

## MEDIUM — Address in Next Refactor Sprint

### 5. Optional fields used inconsistently

`src/types.ts`, `src/components/Timeline.tsx`

Several fields are typed as optional but accessed with inconsistent defensive coding:

| Field | Type | Risk |
|---|---|---|
| `Initiative.resourceIds` | `string[] \| undefined` | `(init.resourceIds \|\| []).map(...)` — correct, but not uniform |
| `Initiative.dtsPhase` | `string \| undefined` | Filtered at line ~2005 without `?` guard in one path |
| `ApplicationSegment.row` | `number \| undefined` | Most paths use `?? 0` correctly; one path accesses directly |
| `Initiative.owner` | `string \| undefined` | Mixed fallback patterns (`init.owner \|\| ''` vs `init.owner ?? undefined`) |

**Fix:** Add a lint rule for `@typescript-eslint/no-non-null-assertion` and audit the 4 fields above.

---

### 6. IndexedDB error handling incomplete

`src/lib/db.ts`, ~line 270

```typescript
await Promise.all(allPromises);
await tx.done; // no try-catch; silent failure on quota exceeded or corrupt store
```

If `tx.done` rejects (storage quota exceeded, browser private mode), the UI shows no error and the user loses their changes silently. The `db-error-banner` E2E test covers the `put` failure path, but the `tx.done` rejection path is untested.

**Fix:** Wrap in `try/catch`, surface the error via the existing `db-error-banner` mechanism.

---

### 7. 20-prop interface — prop-drilling through Timeline

`src/components/Timeline.tsx`, lines ~60–84

The component accepts 20 props. Most are passed directly into inline render functions via closure, meaning any prop change triggers re-evaluation of all three swimlane views. The `useMemo` on `timeColumns` and `assetsByCategory` partially mitigates this, but a component split (see item 2) would colocate data with the renderers that need it.

---

## LOW — Housekeeping

### 8. Repeated Tailwind class strings (8 occurrences)

`src/components/Timeline.tsx`

The action toolbar button style appears 8 times verbatim:

```
"w-5 h-5 bg-white hover:bg-slate-100 rounded shadow-sm text-slate-700 text-[10px] flex items-center justify-center leading-none"
```

**Fix:** Extract to a module-level const:

```typescript
const ICON_BTN = "w-5 h-5 bg-white hover:bg-slate-100 rounded shadow-sm text-slate-700 text-[10px] flex items-center justify-center leading-none";
```

Similarly for the sticky sidebar header style (appears 3 times) and the `shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]` sticky shadow (appears 5+ times).

---

### 9. `legendExpanded` state may be dead code

`src/components/Timeline.tsx`, lines ~152–153

`legendExpanded` is set to state but it's unclear if the toggle UI is still rendered after recent legend changes. If the legend is now always expanded, this state variable and its `localStorage` sync are unused.

**Action:** Search for `legendExpanded` usages. Remove if the toggle is gone.

---

### 10. MobileCardView not receiving new bar features

`src/components/MobileCardView.tsx`

Mobile intentionally uses a simplified card layout, but it currently:
- Does not show the owner avatar badge (added in US-IE-04)
- Does not show the budget pill on the title row (US-IE-04)
- Does not show the selection highlight / action toolbar (US-IE-01/02)

This is an intentional simplification, but should be documented as a known divergence so future bar features prompt a mobile parity check.

---

### 11. Verify resize handles present in all swimlane modes

`src/components/Timeline.tsx`

The resize handle divs (`cursor-ew-resize`, `handleResizeStart`) appear in the full Site C render (lines ~2065–2066) but their presence in Sites A and B (DTS phase and asset swimlane simplified views) should be confirmed. If missing, drag-to-resize is silently broken for those groupBy modes.

**Action:** Grep for `handleResizeStart` — confirm it appears in all 3 bar render sites.

---

## Recommended Execution Order

| # | Work | Effort | Risk |
|---|---|---|---|
| 1 | Verify resize handles in all 3 bar render sites | 30 min | Low |
| 2 | Extract `<InitiativeBar>` component | 1 day | Medium |
| 3 | Define `LayoutItem`/`PlacedRect` types, remove `any` | 2 hrs | Low |
| 4 | Add `try/catch` to `tx.done` in db.ts | 30 min | Low |
| 5 | Extract repeated Tailwind class consts | 1 hr | Low |
| 6 | Refactor useEffect to use refs for drag state | 1 day | High — needs thorough E2E regression |
| 7 | Extract `<DependencySvgLayer>`, swimlane components | 2 days | Medium |
| 8 | Remove dead `legendExpanded` code | 30 min | Low |
