# OnePlan Feature Backlog

Tasks to be worked on one by one, following the CLAUDE.md process (User Story → Test → Code → Full Suite → Docs → Commit).

---

## Visualiser — Dependency Arrows

- [x] **Arrow selection when arrows are adjacent** *(completed)*
  Arrows in the same routing corridor are automatically staggered 16px apart. When a click lands near multiple overlapping arrows, a disambiguation popover lists the relationships by name so the user can pick the correct one.

- [x] **Default relationship type when drawing an arrow should be "Requires"** *(completed)*
  Dragging vertically from one initiative to another now creates a `requires` relationship by default.

- [x] **Arrow z-index: arrows must always render above initiative bars** *(completed)*
  The dependency SVG is now at z-[25], above the hover:z-20 applied to initiative bars.

- [x] **Arrow label tooltip on click** *(completed)*
  Clicking the dependency label pill shows a fixed tooltip with the full sentence (e.g. "Passkey Rollout must finish before SSO Consolidation can start"). Auto-dismisses after 3 seconds or on click. Does not open the edit panel.

---

## Visualiser — Grouped Initiatives

- [x] **Too much vertical padding inside a grouped initiative bar** *(completed)*
  Grouped initiative bars have excess vertical padding. Tightened the internal spacing (`py-0.5`) so the bar height better matches its content.

- [x] **Grouped initiative description: one bullet point per initiative name** *(completed)*
  Initiative names in a collapsed group description are now each on their own line as bullet points (e.g. • Passkey Rollout), replacing the old " + " separator.

---

## Panels & Modals

- [x] **Edit Relationship modal: show full initiative names without truncation** *(completed)*
  Removed `truncate` from the Source and Target labels in `DependencyPanel`. Names now use `break-words` so long names wrap rather than being cut off.

- [x] **Create Initiative modal: show related initiatives at the bottom** *(completed)*
  Added a "Related Initiatives" section at the bottom of the Initiative panel, listing each dependency with a directional label (e.g. "Blocks", "Required by"). Hidden when no dependencies exist. Body already scrolls; footer is already fixed.

---

## Header Display Settings

- [x] **Replace Display popover with inline icon toggles in the header** *(completed)*
  Replaced the Display popover with four inline icon toggle buttons: Conflict Detection (AlertTriangle), Relationships (GitBranch), Descriptions (AlignLeft), Budget (DollarSign). Budget cycles off → label → bar-height. A small "⋯" overflow button retains Snap to Month and Empty Rows. Active state shown via blue colour; inactive via grey.

---

## Browser Dialogs

- [x] **Replace all browser window.confirm dialogs with in-app modals** *(completed)*

---

## Reports Mode

- [x] **Add a "Reports" mode alongside Visualiser and Data Manager** *(completed)*
  Added a third navigation tab (BarChart2 icon). Clicking Reports shows a `ReportsView` scaffold. Nav button highlights when active; switching away and back retains the view.

- [x] **Report: History Differences** *(completed)*
  The History Differences section is now a first-class report in the Reports view. It loads saved versions, shows a dropdown selector, and renders the diff inline (added/removed/changed initiatives, dependencies, milestones) without requiring the History modal.

- [x] **Report: Initiatives and their Dependencies** *(completed)*
  Reports view now shows an "Initiatives & Dependencies" report grouped by asset. Each initiative lists its dependencies as plain-language sentences (e.g. "Passkey Rollout blocks SSO Consolidation — must finish before it can start."). Initiatives with no dependencies show "No dependencies".

---

## Code Quality — Bugs & Defects

- [x] **Fix dangling dependency references in demo data** *(completed)*
  Removed `dep-4` from `demoData.ts`, which referenced the non-existent initiatives `i-k8s-multi` and `i-k8s-mesh`. Added a regression test that reads IndexedDB directly and asserts no dependency references a missing initiative ID.

- [x] **Add React Error Boundary** *(completed)*
  Added `ErrorBoundary` class component wrapping the app in `main.tsx`. If any child throws during render, a friendly "Something went wrong" screen with a Reload button is shown instead of a blank page. Includes a `TestErrorThrower` hook for E2E verification.

- [x] **Replace `JSON.parse(JSON.stringify(...))` deep clone with `structuredClone`** *(completed)*
  Replaced `JSON.parse(JSON.stringify(currentData))` in `VersionManager.tsx` with `structuredClone(currentData)`. Handles non-JSON-serialisable values safely. Tests verify snapshot immutability and that saved data is stored in IndexedDB with all fields intact.

- [x] **Fix stale demo data dates** *(completed)*
  All initiatives in `demoData.ts` are hardcoded to 2026–2028. Once those dates pass, new users see a timeline set entirely in the past. Generate dates dynamically relative to `new Date()` so the demo is always set in the near future.

- [x] **Add error handling to `getAllVersions` call in ReportsView** *(completed)*
  The `useEffect` in `ReportsView.tsx` that calls `getAllVersions()` has no `.catch()`. If IndexedDB fails, the component silently stays in the empty state with no feedback to the user.

---

## Code Quality — Performance

- [x] **Fix keyboard shortcut `useEffect` dependency array** *(completed)*
  In `App.tsx` the Cmd+Z / Cmd+Shift+Z handler lists every piece of state as a dependency, causing the event listener to be removed and re-added on every state change. Refactor to use a `useRef` holding the latest undo/redo callbacks, with a stable empty dependency array.

- [x] **Wrap update handler props in `useCallback`** *(completed)*
  Large handler functions in `App.tsx` (`handleUpdateInitiative`, `handleSaveAppData`, etc.) are recreated on every render and passed as props to `Timeline`, `DataManager`, and others. Wrap these with `useCallback` to prevent unnecessary child re-renders.

---

## Code Quality — Refactoring

- [x] **Extract shared diff logic to `src/lib/diff.ts`** *(completed)*
  The `compareEntities` function and full diff computation is copy-pasted between `VersionManager.tsx` and `ReportsView.tsx` (~70 lines each). Extract to a shared `src/lib/diff.ts` module and import it in both components, so a bug fix or enhancement only needs to happen once.

- [x] **Replace `alert()` calls with in-app feedback** *(completed)*
  `DataControls.tsx` uses `alert()` for some error conditions (blocking, unstyled, inconsistent with the rest of the UI). Replace with inline error state or a non-blocking toast notification consistent with the existing `ConfirmModal` pattern.

- [ ] **Consolidate cascading delete handlers in DataManager**
  `DataManager.tsx` has five near-identical handler functions (`handleDeleteAsset`, `handleDeleteProgramme`, `handleDeleteStrategy`, etc.) that all follow the same pattern. Extract a single generic helper to reduce duplication and ensure cascade logic stays consistent.

---

## Accessibility

- [ ] **Add `aria-pressed` and `aria-label` to header toggle buttons**
  The four header toggles (Conflict Detection, Relationships, Descriptions, Budget) convey their active state via colour only. Add `aria-pressed={isActive}` and a descriptive `aria-label` to each so screen readers can announce their purpose and state.

- [ ] **Add focus trap and Escape key handling to panels**
  `InitiativePanel`, `DependencyPanel`, and `VersionManager` don't trap focus or respond to the Escape key. Keyboard-only users must Tab through the entire app to dismiss them. Add focus trapping on open and close on Escape.

- [ ] **Add `aria-label` to editable table cell inputs**
  Inputs in `EditableTable.tsx` use placeholder text only — screen readers won't announce which column an input belongs to. Add `aria-label={column.label}` to each cell input.
