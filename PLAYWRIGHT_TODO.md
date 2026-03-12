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
- [x] **View Switching:** Verify that clicking "Visualiser" and "Data Manager" correctly swaps the main view and retains current data.
- [x] **Data Persistence (IndexedDB):**
    - [x] Load the app, make a change (e.g., rename an initiative), refresh the page, and verify the change persists.
    - [x] Verify that if the database is empty, the default data from `demoData.ts` is correctly initialized.

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
    - [x] Configure the timeline start year and duration via the Settings modal.
    - [x] Verify that timeline settings are persisted and correctly change the visible columns.
    - [x] Verify dynamic timeline scaling: if an initiative extends beyond the selected "Months" duration, columns automatically extend to fit.
- [x] **Initiative Panel:**
    - [x] Click on an initiative in the timeline to open the edit panel.
    - [x] Modify initiative details and save, verifying changes persist and update the UI.
- [x] **Coloring Logic:**
    - [x] **Toggle Color Mode:** Switch between "By Programme" and "By Strategy" and verify initiative bar colors change according to the legend.
    - [x] **Legend Sync:** Verify the legend updates its labels and colors when the mode is toggled.
- [x] **Initiative Resizing:**
    - [x] Drag the start handle of an initiative to change its `startDate`.
    - [x] Drag the end handle of an initiative to change its `endDate`.
    - [x] **Persistence:** Ensure resized initiatives don't "snap back" after the mouse is released or the page is refreshed.
- [x] **Initiative Interaction:**
    - [x] **Horizontal Move:** Drag an initiative left or right to change start/end dates while maintaining duration.
    - [x] **Relationship Drawing:** Drag vertically from one initiative to another to create a dependency.
        - [x] Verify the dashed arrow starts from the center of the source initiative.
- [x] **Milestone Interaction:**
    - [x] **Horizontal Move:** Drag a milestone left or right to change its date.
- [x] **Visualization Labels:**
    - [x] **Milestone Labels:** Display milestone names as text next to icons.
    - [x] **Dependency Labels:** Display dependency type along the connection arrows.
    - [x] **Category Labels:** Verify that the category row labels remain sticky and visible when scrolling horizontally.
- [ ] **Drag-and-Drop Reordering:**
    - [ ] **Category Reordering:** Drag a category (e.g., "Data Assets") above another and verify the vertical order changes.
    - [x] Asset Reordering: Drag an asset within its category and verify it moves correctly.
- [x] **Conflict Detection:** Create two initiatives on the same asset that overlap in time and verify the red "Conflict Detected" marker appears at the start of the overlap.
    - [x] Verify that conflict markers appear behind sticky asset swimlane labels when scrolling.
- [x] **Milestones:** Verify milestones are rendered at the correct horizontal position based on their date.

## 4. Data Controls (Import/Export)
- [x] **Excel Export:** Trigger "Export Excel" and verify a `.xlsx` file is generated containing all sheets (Initiatives, Assets, Programmes, Strategies, Milestones).
- [x] **Excel Import:** Upload a valid Excel file and verify the Import Preview modal appears.
    - [x] **Merge Data:** Verify that clicking 'Merge Data' updates existing items, adds new items, and retains existing unreferenced items.
    - [x] **Overwrite All Data:** Verify backwards compatibility where 'Overwrite All Data' completely replaces the application state.
- [x] **PDF Export:** Trigger "Export PDF" while in Visualiser view and verify a PDF file is generated (checking for reasonable file size/optimization).

## 5. Edge Cases & Safety
- [ ] **Invalid Dates:** Verify that entering an invalid date string in the Data Manager doesn't crash the Visualiser.
- [ ] **Missing IDs:** Ensure that adding rows via CSV without IDs automatically generates them.
- [ ] **Large Data Sets:** (Optional) Verify that the layout algorithm (Greedy Placement) handles 20+ overlapping initiatives on a single asset without infinite loops or UI breakage.
