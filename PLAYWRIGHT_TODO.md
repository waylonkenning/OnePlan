# Playwright Test Development Todo List

This document outlines the critical functionality of **OnePlan** that should be covered by automated end-to-end tests using Playwright.

## 1. Navigation & State Management
- [x] **Timeline Click Creation:**
    - [x] Verify double-clicking an empty space opens the creation panel.
    - [x] Verify asset and start date are pre-filled based on click coordinates.
- [x] **Budget Visualisation:**
    - [x] Verify bar height mode increases height for items with budget.
    - [x] Verify label mode displays concise budget text.
- [x] **Undo & Redo Functionality:**
    - [x] Verify buttons handle UI state reversions correctly.
    - [x] Verify Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z shortcuts work.
    - [x] Verify history stack limits correctly at 10 operations.
- [x] **Global Search & Filter:** 
    - [x] Verify that searching filters both the Visualiser timeline and the Data Manager tables simultaneously.
- [x] **View Switching:** Verify that clicking "Visualiser", "Data Manager", "Reports", and "History" correctly swaps the main view/modal and retains current data.
- [x] **Version Snapshot Integrity:** Verify saved versions are deep clones (mutations after saving don't affect the snapshot); verify snapshot data is persisted in full to IndexedDB.
- [x] **Version History & Snapshotting:**
    - [x] Verify that a user can save a named snapshot of the current state.
    - [x] Verify that saved versions appear in the history sidebar.
    - [x] Verify that a Difference Report can be generated between a baseline and the current state.
    - [x] Verify that a previous version can be restored, overwriting the current state.
- [x] **Data Persistence (IndexedDB):**
    - [x] Load the app, make a change (e.g., rename an initiative), refresh the page, and verify the change persists.
    - [x] Verify that if the database is empty, the default data from `demoData.ts` is correctly initialized.
- [x] **Column Resizing:**
    - [x] Drag the boundary between column headers to resize.
    - [x] Verify that resized column widths are persisted across page reloads.

## 2. Data Manager (EditableTable)
- [x] **Tab Switching:** Verify all tabs (Initiatives, Assets, Programmes, Strategies, Milestones) display correctly with their respective counts.
- [x] **Row Operations:**
    - [x] **Add Row:** Click "Add Row" and verify a new row with a unique ID is created.
    - [x] **Delete Row:** Delete a row and verify it's removed from both the UI and the state/DB.
    - [x] **Inline Editing:** Update text, number, and select fields in any table and verify the changes are saved.
- [x] **Clear All:** Click "Clear All", verify the confirmation dialog appears, and ensure the table is empty after confirmation.
- [x] **CSV Paste Functionality:**
    - [x] **Import New:** Paste a valid CSV string (with and without headers) and verify rows are added.
    - [x] **Update Existing:** Paste a CSV string containing an existing `id` and verify the row's other fields are updated instead of creating a duplicate.
    - [x] **Multi-word Values:** Verify values like "Security Services" are parsed correctly and not truncated.
    - [x] **Quoted Values:** Verify quoted CSV values containing commas are handled correctly.

## 3. Visualiser (Timeline)
- [x] **Timeline Configuration:**
    - [x] Configure the timeline start date and duration via the header settings.
    - [x] Verify that timeline settings are persisted and correctly change the visible columns.
    - [x] Verify dynamic timeline scaling: if an initiative extends beyond the selected "Months" duration, columns automatically extend to fit.
- [x] **Initiative Panel:**
    - [x] Click on an initiative in the timeline to open the edit panel.
    - [x] Support initiative deletion from visualiser edit panel
    - [x] Modify initiative details and save, verifying changes persist and update the UI.
    - [x] Verify a "Related Initiatives" section appears listing dependencies when the initiative has dependencies.
    - [x] Verify the section is hidden when the initiative has no dependencies.
- [x] **Coloring Logic:**
    - [x] **Toggle Color Mode:** Switch between "By Programme" and "By Strategy" and verify initiative bar colors change according to the legend.
    - [x] **Legend Sync:** Verify the legend updates its labels and colors when the mode is toggled.
- [x] **Initiative Resizing:**
    - [x] Drag the start handle of an initiative to change its `startDate`.
    - [x] Drag the end handle of an initiative to change its `endDate`.
    - [x] **Persistence:** Ensure resized initiatives don't "snap back" after the mouse is released or the page is refreshed.
- [x] **Initiative Interaction:**
    - [x] **Horizontal Move:** Drag an initiative left or right to change start/end dates while maintaining duration.
    - [x] **Vertical Stability:** Verify initiatives maintain their vertical row during drag and resize operations.
    - [x] **Relationship Drawing:** Drag vertically from one initiative to another to create a dependency.
        - [x] Verify the dashed arrow starts from the center of the source initiative.
        - [x] Verify new arrows default to `requires` type (blue).
    - [x] **Dependency Edit Modal:**
        - [x] Verify that clicking a dependency arrow opens the edit modal.
        - [x] Verify that dependencies can be deleted from the modal.
        - [x] Verify that dependency direction can be reversed in the modal.
        - [x] Verify that source and target initiative names display in full without truncation (no `truncate` CSS class).
    - [x] **Arrow z-index:** Verify that the dependency SVG layer is always above initiative bars (z-index > 20), including when bars raise their z-index on hover.
    - [x] **Arrow label tooltip:** Verify clicking a dependency label shows a plain-language tooltip sentence; verify clicking the tooltip dismisses it; verify the label click does not open the edit panel.
- [x] **Grouped Initiative Description:** Verify each initiative name appears as a `•` bullet on its own line (not joined with ` + `); verified on both standard and narrow bars.
        - [x] Verify that the description sentence uses actual initiative names (e.g. "X must finish before Y can start").
    - [x] **Dependency Visual Enhancements:**
        - [x] Verify increased vertical gap (32px) for intra-asset dependencies.
        - [x] Verify that dependency labels are offset to not cover the arrow.
        - [x] Verify blocks arrows are red, requires arrows are blue, related arrows are dark with no arrowhead.
    - [x] **Dependency Arrow Dragging:**
        - [x] Verify that dependency arrows can be dragged horizontally.
        - [x] Verify that dragged offsets are persisted across page reloads.
    - [x] **Dependency Arrow Selection:**
        - [x] Verify parallel arrows in the same routing corridor are automatically staggered (different midX values).
        - [x] Verify clicking near overlapping arrows shows a disambiguation popover or opens the dependency panel directly.
        - [x] Verify clicking a specific arrow (by data-dep-id) opens the correct dependency panel.
- [x] **Milestone Interaction:**
    - [x] **Horizontal Move:** Drag a milestone left or right to change its date.
- [x] **Visualization Labels:**
    - [x] **Milestone Labels:** Display milestone names as text next to icons.
    - [x] **Dependency Labels:** Display dependency type along the connection arrows.
    - [x] **Grouped Budgets:** Verify that collapsed groups show the sum of all initiative budgets in a dark-colored label.
    - [x] **Category Labels:** Verify that the category row labels remain sticky and visible when scrolling horizontally.
    - [x] **Description Display:** Verify that descriptions are correctly rendered without being cut off at the bottom.
    - [x] Grouped Descriptions: Verify that collapsed groups show initiative names concatenated with " + ".
    - [x] **Grouped Description on Narrow Bar:** Verify that group descriptions display even when the bar spans < 8% of the timeline width (regression for `width > 8` gate that was hiding descriptions on narrow bars).
    - [x] **Grouped Description No Truncation:** Verify that group bars expand to show the full joined description without CSS `line-clamp-3` or bar-height truncation, regardless of the number of initiatives in the group.
    - [x] **Dynamic Swimlane Height:** Verify that swimlane height shrinks when groups are collapsed and expands when ungrouped.
- [x] **Compact Layout:** Verify that swimlane height is minimal (60px) and vertical padding is reduced.
- [x] **Drag-and-Drop Reordering:**
    - [x] **Category Reordering:** Drag a category (e.g., "Data Assets") above another and verify the vertical order changes.
    - [x] Asset Reordering: Drag an asset within its category and verify it moves correctly.
- [x] **Inline Display Toggles:** Verify four icon toggles (conflict, relationships, descriptions, budget) replace the Display popover; verify active/inactive state and budget cycling; verify each has aria-label and aria-pressed reflecting current state.
- [x] **Zoom Control:** Verify zoom-in/zoom-out buttons widen/narrow timeline columns; verify disabled state at min/max zoom; verify zoom level persists across page reloads.
- [x] **Panel Focus Trap & Escape Key:** Verify InitiativePanel, DependencyPanel, and VersionManager all close on Escape; verify Tab cycles focus within InitiativePanel without escaping to the rest of the page.
- [x] **EditableTable aria-label:** Verify real-row text inputs, ghost-row text inputs, real-row selects, and real-row checkboxes all carry aria-label matching the column label.
- [x] **Reports Mode:** Verify Reports nav tab, view switching, active state highlighting.
- [x] **Initiatives & Dependencies Report:** Verify report is grouped by asset, lists initiatives, and shows plain-language dependency sentences using subject-verb-object form ("A must finish before B can start.", "A requires B to finish first.", "A and B are related."); verify no legacy "blocks X —" or "general connection" wording.
- [x] **History Differences Report:** Verify `report-history-diff` section in Reports view; empty state when no versions; version selector appears after saving; inline diff result shows changes after running; error message shown if versions fail to load.
- [x] **Conflict Detection:** Create two initiatives on the same asset that overlap in time and verify the red "Conflict Detected" marker appears at the start of the overlap.
    - [x] **Same-day Boundary:** Verify that initiatives touching on the same date (End A == Start B) are NOT marked as conflicts.
    - [x] Verify that conflict markers appear behind sticky asset swimlane labels when scrolling.
    - [x] Verify that initiatives do not overlap sticky asset swimlane labels on hover.
    - [x] Verify that conflict detection can be toggled on/off via the header setting.
    - [x] **Relationship Visibility:** Verify that dependency lines can be toggled on/off via the header setting.
- [x] **Milestones:** Verify milestones are rendered at the correct horizontal position based on their date.

## 4. Data Controls (Import/Export)
- [x] **Excel Export:** Trigger "Export Excel" and verify a `.xlsx` file is generated containing all sheets (Initiatives, Assets, Programmes, Strategies, Milestones).
- [x] **Excel Import:** Upload a valid Excel file and verify the Import Preview modal appears; verify merge/overwrite show inline success notifications; verify no-data upload shows inline error notification — no browser alert().
    - [x] **Merge Data:** Verify that clicking 'Merge Data' updates existing items, adds new items, and retains existing unreferenced items.
    - [x] **Overwrite All Data:** Verify backwards compatibility where 'Overwrite All Data' completely replaces the application state.
    - [x] **Schema Validation:** Verify that importing a file with missing required fields (e.g. `startDate`) shows a "Schema warnings" panel in the preview modal, and that a valid file shows no warnings.
    - [x] **Legacy Data Resilience:** Verify that importing data missing `startDate` does not crash the timeline (regression for TypeError in `localeCompare` on undefined).
- [x] **PDF Export:** Trigger "Export PDF" while in Visualiser view and verify a PDF file is generated (checking for reasonable file size/optimization).
- [x] **SVG Export:** Trigger "Export SVG" while in Visualiser view and verify a .svg file is generated with valid SVG content.

## 5. Edge Cases & Safety
- [x] **Invalid Dates:** Verify that entering an invalid date string in the Data Manager doesn't crash the Visualiser.
- [x] **Missing IDs:** Ensure that adding rows via CSV without IDs automatically generates them.
- [x] **Orphaned Dependency References:** Verify that no dependency in the loaded app data references a non-existent initiative ID (reads IndexedDB directly).
- [x] **Large Data Sets:** Verify that the layout algorithm (Greedy Placement) handles 20+ overlapping initiatives on a single asset without infinite loops or UI breakage.
- [x] **Demo Data Dates:** Verify that the timeline shows the current or next year (not a hardcoded past year); verify all initiative start dates are within a reasonable range of today.
## 5c. Mobile Viewport
- [x] **Mobile Phase 1 — Foundation:** Verify timeline sidebar narrows to 120px on mobile viewport (393px); verify outer padding reduces; verify content fits without excessive horizontal scroll.
- [x] **Mobile Phase 1b — Horizontal Scroll:** Verify header is overflow-x-auto on mobile; verify Import button reachable by scrolling; verify DataManager table has a scrollable container.
- [x] **Mobile Phase 2 — Mobile Header:** Verify desktop controls hidden on mobile; verify mobile header with settings icon; verify settings bottom sheet opens/closes (backdrop, Escape); verify bottom tab bar switches views; verify desktop unchanged.
- [x] **Mobile Phase 3 — Touch Optimisation:** Verify no drag cursor on initiative bars on mobile; verify no resize handles on mobile; verify panel inputs ≥44px tall; verify budget field has inputmode="numeric".
- [x] **Mobile Rendering Fixes:** Asset name sidebar truncates long names with ellipsis (no overflow); drag handle icons hidden on mobile (category and asset rows); legend items wrap correctly so all programme/strategy names are visible; tab bar active state uses border indicator for clear visual distinction.
- [x] **Mobile Phase 4 — Asset Card View:** On mobile the Visualiser tab renders `MobileCardView` instead of the timeline; one card per asset grouped by category; initiatives grouped by configurable bucket (Timeline/Quarter/Year/Programme/Strategy); bucket selector in settings sheet; tapping a row opens InitiativePanel; conflict badges; `mobileBucketMode` persists to IndexedDB; desktop unchanged.

## 5b. Error Handling
- [x] **Error Boundary:** Verify that a render error shows a friendly "Something went wrong" UI with a Reload button instead of a blank screen. Verify normal operation is unaffected.

## 6. Modals & Tutorials
- [x] **In-App Confirm Modal:**
    - [x] Verify all destructive actions use in-app ConfirmModal (no browser window.confirm dialogs).
    - [x] Verify cancel keeps data unchanged.
    - [x] Verify confirm executes the destructive action.
    - [x] Covers: EditableTable Clear All, DataManager Reset, DependencyPanel delete, InitiativePanel delete, VersionManager delete/restore.
- [x] **Features Modal:**
    - [x] Verify that the modal opens and displays all feature cards.
    - [x] Verify that feature animations are loading correctly (with valid recoridngs).
- [x] **In-App Tutorial:**
    - [x] Verify that the tutorial modal appears on first load.
    - [x] Verify that the tutorial can be manually triggered via the Help button.

## 7. Landing Page & Branding
- [x] **Open Source:**
    - [x] Verify the "Open Source · Apache 2.0" badge is displayed.
    - [x] Verify the GitHub nav link and "View on GitHub" CTA both link to the correct repository.
- [x] **Feature Cards:**
    - [x] Verify all six feature cards are present: Dependency Mapping, Intuitive Canvas, Conflict Detection, Version History, Excel & PDF Export, 100% Private.
- [x] **Kenning Corporation branding:**
    - [x] Verify the landing page footer links to kenning.co.nz.
    - [x] Verify the in-app footer reads "OnePlan IT Initiative Planner — an open source tool from Waylon Kenning" with correct links.
