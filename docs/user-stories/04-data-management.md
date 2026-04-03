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


---

## US-DA-09: Import Error Path Handling (Safety)

**As an** IT portfolio manager,
**I want** import failures to show inline error notifications,
**so that** I always receive clear feedback when an upload goes wrong.

**Acceptance Criteria:**
- AC1: Uploading a non-Excel file (e.g. `.txt`, `.csv`) shows an inline error notification — no browser `alert()` dialog
- AC2: Uploading a corrupted or truncated `.xlsx` file shows an inline error notification — no browser `alert()` dialog
- AC3: Both error conditions leave the existing portfolio data intact

---

## US-DA-10: Toggle Demo Data When Selecting a Template

**As an** IT portfolio manager setting up a new workspace,
**I want** to choose whether to load example data alongside the template structure,
**so that** I can explore the app with realistic data or start with a clean slate.

**Acceptance Criteria:**
- The template picker offers two buttons per template: "With demo data" and "Without demo data" (or equivalent labelling)
- Selecting "With demo data" loads the template structure plus pre-built initiatives, segments, milestones, and dependencies representative of that template
- Selecting "Without demo data" loads only the taxonomy (assets and categories) with no initiatives, segments, milestones, or dependencies
- Both options are available for the DTS and GEANZ templates
- The blank template always loads without demo data

---

## US-DA-11: Include a DTS Summary Tab in Excel Exports

**As an** IT portfolio manager in a DTS or Mixed workspace,
**I want** the Excel export to include a dedicated DTS Summary sheet,
**so that** I can share adoption status and investment data per DTS asset without manual compilation.

**Acceptance Criteria:**
- Exporting to Excel from a DTS or Mixed workspace produces a workbook with a "DTS Summary" sheet
- The DTS Summary sheet contains one row per DTS asset with: asset name, adoption status, initiative count, total budget (CapEx + OpEx), lead owner, and target adoption date
- If a Cluster name is set in workspace settings, it appears in the DTS Summary sheet
- Exporting from a non-DTS workspace does not include the DTS Summary sheet

---

## US-DA-12: Export the Timeline as a JPG Image

**As an** IT portfolio manager,
**I want** to export the current timeline view as a JPG image,
**so that** I can embed it in documents, slide decks, or emails that don't support PDF.

**Acceptance Criteria:**
- An **Export JPG** button is available in the Visualiser alongside the PDF export button
- Clicking the button downloads a `.jpg` file capturing the current visible canvas
- The export reflects the active zoom level, grouping, display settings, and scroll position at the time of export
- The export completes without a browser `alert()` dialog or page reload
