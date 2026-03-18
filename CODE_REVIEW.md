# OnePlan Code Review

Generated 2026-03-19. Issues are ordered by recommended fix priority.

---

## 🔴 High Priority

| # | File | Issue |
|---|------|-------|
| 1 | `Timeline.tsx:299` | `timeColumns[0]` accessed without checking array is non-empty — will throw if `monthsToShow` is invalid |
| 2 | `lib/criticalPath.ts` | No cycle detection — circular dependencies (A→B→C→A) cause infinite recursion or wrong results |
| 3 | `lib/db.ts:138` | `saveAppData` has no rollback — if the IndexedDB transaction fails mid-write, UI state and DB diverge silently |

---

## 🟠 Medium Priority

| # | File | Issue |
|---|------|-------|
| 4 | `DataControls.tsx:144,178` | Import merge/overwrite passes `resources: data.resources` (existing data) instead of `importPreviewData.resources` — imported resources silently dropped |
| 5 | `App.tsx:136` | Legacy migration deletes `startYear` via `delete (mergedSettings as any).startYear` — unsafe cast, mutates in place |
| 6 | `App.tsx:129` | `Number(i.budget) \|\| 0` on load implies budget can arrive as non-number from DB, but `Initiative.budget` is typed as `number` |
| 7 | `DataManager.tsx` | `updateData(key, newData: any[])` — `any[]` defeats generic type safety |
| 8 | `DataManager.tsx` | Asset/Programme/Strategy/Milestone delete handlers each hand-implement cascading delete — risk of inconsistency |
| 9 | `ArrowDisambiguator.tsx` | Dependency type indicated by colour only (red/blue) — fails for colour-blind users; no text label |

---

## 🟡 Low Priority — Dead Code & Cleanup

| # | File | Issue |
|---|------|-------|
| 10 | `ErrorBoundary.tsx` | `TestErrorThrower` exported but never imported in production code |
| 11 | `App.tsx:100,127,191` | `console.log` calls left in production ("Initializing DB", "Loaded data from DB", "Data saved to DB") |
| 12 | `Timeline.tsx` | `sessionStorage` key uses hyphens (`oneplan-collapsed-categories`) while other keys use underscores (`oneplan_has_seen_landing`) |

---

## 🟡 Low Priority — Performance

| # | File | Issue |
|---|------|-------|
| 13 | `EditableTable.tsx` | `COLORS` array defined inline in component body — new array instance every render |
| 14 | `App.tsx` | All `useCallback` hooks depend on full 9-item state tuple — recreated on any state change |
| 15 | `Timeline.tsx` | `localInitiatives`/`localMilestones` sync effect depends on full filtered arrays — can cause cascading re-renders |

---

## 🟡 Low Priority — Type Safety

| # | File | Issue |
|---|------|-------|
| 16 | `EditableTable.tsx:188` | `parseFloat(aValue as any)` — casts column value to `any` for numeric sort |
| 17 | `types.ts` | `TimelineSettings` fields use inconsistent patterns — mix of `'on' \| 'off'` and `'show' \| 'hide'` |
| 18 | `KeyboardShortcutsModal.tsx` | Shortcuts display "Cmd" hardcoded — Windows/Linux users see incorrect key name |

---

## 🟡 Low Priority — Accessibility

| # | File | Issue |
|---|------|-------|
| 19 | `InitiativePanel.tsx`, `VersionManager.tsx`, `TutorialModal.tsx` | Close (×) buttons have no `aria-label` |
| 20 | `EditableTable.tsx` | Table inputs have no `aria-labelledby` connecting them to column headers |

---

## Status

| # | Status |
|---|--------|
| 1 | ✅ Fixed |
| 2 | ✅ Fixed |
| 3 | ℹ️ N/A — idb transactions auto-rollback; architectural divergence risk is by-design for UI responsiveness |
| 4 | ✅ Fixed |
| 5 | ✅ Fixed |
| 6 | ℹ️ N/A — defensive coercion for old DB data; harmless |
| 7 | ✅ Fixed — updateData now generic |
| 8 | ℹ️ N/A — cascadeDelete helper already refactored in codebase |
| 9 | ℹ️ N/A — text label (blocks/requires/related) IS shown alongside colour |
| 10 | ℹ️ N/A — TestErrorThrower IS used in main.tsx |
| 11 | ✅ Fixed |
| 12 | ✅ Fixed — renamed to oneplan_collapsed_categories |
| 13 | ✅ Fixed |
| 14 | ⬜ Open — deferred (minor perf, no bugs) |
| 15 | ⬜ Open — deferred (minor perf, no bugs) |
| 16 | ✅ Fixed — String(aValue) instead of as any |
| 17 | ⬜ Open — deferred (no bugs; cosmetic inconsistency) |
| 18 | ✅ Fixed — platform-aware Cmd/Ctrl |
| 19 | ✅ Fixed — aria-label="Close" on all icon-only close buttons |
| 20 | ⬜ Open — deferred (low-impact a11y) |
