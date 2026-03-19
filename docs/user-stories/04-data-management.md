# User Stories — Data Management

## US-DA-01: Manage Portfolio Data in Tabular Tables

**As an** IT portfolio manager,
**I want** to view and edit all portfolio data in structured tables,
**so that** I can make bulk changes without interacting with the timeline canvas.

**Acceptance Criteria:**
- The Data Manager has tabs for: Initiatives, Dependencies, Assets, Asset Categories, Programmes, Strategies, Milestones, Resources, Applications
- Each tab shows a row count badge
- All tabs are reachable without horizontal scrolling on tablet/narrow viewports
- Switching tabs does not lose unsaved changes on the current tab

---

## US-DA-02: Add, Edit, and Delete Rows

**As an** IT portfolio manager,
**I want** to add, inline-edit, and delete rows in any Data Manager table,
**so that** I can maintain accurate portfolio data.

**Acceptance Criteria:**
- "Add Row" creates a new row with a unique auto-generated ID
- Double-clicking a cell opens it for inline editing (text, number, select, checkbox)
- Inline edits are saved immediately and reflected in the timeline
- Deleting a row shows a confirmation modal before removal
- Cascading deletes are applied where appropriate (e.g. deleting an asset removes its initiatives)
- All inputs in the table carry an `aria-label` matching their column label

---

## US-DA-03: Reset Data

**As an** IT portfolio manager,
**I want** to reset all data to the demo dataset or clear everything,
**so that** I can start fresh or explore the demo without manual cleanup.

**Acceptance Criteria:**
- A "Reset — delete all data" button clears all tables (with confirmation modal)
- A "Reset — use demo data" button replaces all data with the demo dataset (with confirmation modal)
- Both actions use an in-app ConfirmModal — no browser `window.confirm`

---

## US-DA-04: Paste CSV to Import Data

**As an** IT portfolio manager,
**I want** to paste CSV data into any Data Manager table,
**so that** I can bulk-import or update records without manually entering each row.

**Acceptance Criteria:**
- A "Paste CSV" button opens a CSV input area
- Pasting a CSV string with headers adds the rows to the table
- Pasting a CSV string without headers is also handled correctly
- If a pasted row has an `id` matching an existing record, the record is updated (not duplicated)
- Multi-word values (e.g. "Security Services") are parsed correctly and not truncated
- Quoted values containing commas are handled correctly
- Rows with missing optional columns import without errors
- Missing `id` fields are auto-generated

---

## US-DA-05: Import Data from Excel

**As an** IT portfolio manager,
**I want** to upload an Excel file to import portfolio data,
**so that** I can bring in data maintained outside the tool.

**Acceptance Criteria:**
- Uploading a `.xlsx` file opens an Import Preview modal
- The preview shows the data before committing
- "Merge Data" updates existing items by ID, adds new items, and retains unreferenced existing items; shows an inline success notification
- "Overwrite All Data" completely replaces all application state; shows an inline success notification
- Uploading a file with no data shows an inline error notification (no browser `alert()`)
- A "Schema warnings" panel is shown in the preview if required fields (e.g. `startDate`) are missing
- A valid file shows no schema warnings
- Importing data with a missing `startDate` does not crash the timeline

---

## US-DA-06: Export Data to Excel

**As an** IT portfolio manager,
**I want** to export all portfolio data to an Excel file,
**so that** I can share it with stakeholders or maintain offline backups.

**Acceptance Criteria:**
- Triggering "Export Excel" generates a `.xlsx` file containing sheets for: Initiatives, Assets, Programmes, Strategies, Milestones
- The file is downloaded automatically

---

## US-DA-07: Export the Timeline as PDF or SVG

**As an** IT portfolio manager,
**I want** to export the timeline as a PDF or SVG,
**so that** I can include it in presentations or documents.

**Acceptance Criteria:**
- Triggering "Export PDF" while in the Visualiser view generates and downloads a PDF file
- Triggering "Export SVG" while in the Visualiser view generates and downloads a `.svg` file with valid SVG content

---

## US-DA-08: Search and Filter Across All Data

**As an** IT portfolio manager,
**I want** to search by keyword and have it filter both the timeline and all Data Manager tables simultaneously,
**so that** I can quickly find specific initiatives, assets, or programmes.

**Acceptance Criteria:**
- A global search input filters initiative bars in the Visualiser to only matching items
- The same search query filters all Data Manager table rows in real time
- Clearing the search restores all items
