# OnePlan — Product Feature Reference

Internal reference document. Plain-language master list of everything OnePlan can do, grouped by product area. Use this to audit tutorial and help content.

---

## Timeline / Visualiser

- Displays all initiatives as horizontal bars on a scrollable time grid, with assets (rows) grouped by category.
- Shows the current date as a vertical "Today" line running the full height of the canvas.
- Timeline start date is configurable using an exact date picker.
- Timeline duration is configurable — show 3, 6, 12, 24, or 36 months at a time.
- Zoom in and out using dedicated controls to make columns wider or narrower.
- Sticky category headers and asset row labels remain visible while scrolling horizontally.
- Empty asset rows can be hidden to reduce clutter, or shown to keep the layout consistent.
- Double-clicking anywhere on the timeline canvas creates a new initiative at that position.
- Clicking an initiative bar opens an edit panel to view and modify its details.
- Initiatives can be dragged left and right to change their start and end dates.
- Initiatives can be resized by dragging their left or right edges.
- Dragging and resizing can snap to month boundaries for clean alignment.
- Initiative bars are prevented from moving during a resize, avoiding accidental repositioning.
- Conflicting initiatives on the same asset row are highlighted automatically; this detection can be turned off.
- Conflict duration is shown as a label on the overlap area.
- A custom colour picker lets you set the highlight colour for conflict zones.
- Initiative bar height can be scaled to reflect budget size, shown as a label, or kept uniform.
- Initiative descriptions can be expanded inline inside the bar on the canvas.
- A tooltip appears when hovering over an initiative bar showing its key details.
- Critical path is highlighted across the plan when the Critical Path toggle is on.
- The visualiser renders dependency arrows as an SVG layer on top of the canvas.
- A full-screen interactive tutorial walks through the main features when first opening the app.
- A feature highlights modal showcases key capabilities with screenshots and animations.

---

## Initiatives

- Each initiative has a name, start date, end date, budget, and description.
- Initiatives are linked to an asset (which system or team owns the work) and a programme (which delivery programme it belongs to).
- Initiatives can optionally be associated with a strategic goal (strategy).
- Each initiative has a status field: Planned, Active, Done, or Cancelled.
- Status is shown on the timeline bar and can be used to colour the entire plan.
- Each initiative has a progress field (0–100%) to track percentage complete.
- Each initiative has an owner or assignee field to record who is responsible.
- The initiative edit panel shows all related initiatives that share dependencies.
- Initiatives can be deleted from the edit panel on the visualiser, not just from the Data Manager.
- Initiative names appear on the bars; longer names wrap or scroll within the bar.
- Grouped initiatives (when grouping is active) show a combined budget total and a bullet list of the names they contain.

---

## Dependencies / Relationships

- Dependencies can be drawn between any two initiatives by dragging from one bar to another on the timeline.
- Three relationship types are supported: **Blocks** (one must finish before the other starts), **Requires** (one needs the other to start first), and **Related** (a softer association).
- Dependency arrows are drawn as orthogonal (right-angle) lines with smart port anchors for accurate positioning.
- Parallel arrows between the same pair of initiatives are automatically staggered to avoid overlapping.
- When multiple arrows overlap, a disambiguation popover lets you select which relationship you want to interact with.
- Arrow labels are masked so they float cleanly over the canvas without obscuring the bars.
- Clicking an arrow label shows a plain-language tooltip describing the relationship in plain English.
- The relationship tooltip is written from the perspective of the initiative you clicked on (e.g. "Blocking: X must finish before Y can start" vs "Blocked: Y can't start until X has finished").
- Dependency arrows can be dragged horizontally to reposition the vertical segment and avoid visual clutter.
- An edit panel for each relationship lets you change its type, reverse the direction, or delete it.
- Full initiative names are shown in the Edit Relationship panel, not truncated.
- Relationship arrow visibility can be toggled on or off across the whole timeline.
- Arrow colours are distinct per relationship type.
- Milestone-to-initiative dependencies can be created by dragging down from a milestone marker.
- Deleting an initiative or asset automatically removes all orphaned dependencies (cascading delete).
- The Reports view lists every initiative's dependencies in plain-language sentences.
- Milestone dependencies are listed in their own section in the Reports view.

---

## Milestones

- Milestones mark a significant point in time for a specific asset row.
- Each milestone has a name, date, and type: Info, Warning, or Critical.
- Milestones are displayed as vertical markers on the timeline at their asset row.
- Milestone text labels are shown next to each marker.
- Milestones can be dragged horizontally to change their date.
- Milestones can create dependencies to initiatives (link a milestone to an initiative that requires it).
- Deleting an asset cascades to delete all milestones belonging to it.

---

## Grouping and Display

- The timeline can be grouped by asset (default), by programme, or by strategy — selectable from the header.
- Swimlane grouping visually separates rows into labelled swimlanes with a dashed border and shaded background.
- Asset categories can be collapsed to hide all rows in that category; the toggle persists across sessions.
- Individual swimlanes adjust their height when a group is collapsed or expanded.
- Initiatives can be coloured by programme, by strategy, or by status — selectable from the header.
- A global search and filter lets you narrow the timeline to matching initiatives by name or description.
- Header toggle buttons control dependency visibility, description display, empty row display, conflict detection, critical path, budget visualisation, and colour mode — all inline, no buried menus.
- Display settings are accessible from a popover in the header for a clean, uncluttered toolbar.

---

## Data Manager

- The Data Manager is a tabbed spreadsheet interface for editing all records directly.
- Tabs cover: Initiatives, Assets, Asset Categories, Programmes, Strategies, Milestones, and Dependencies.
- Rows behave like a spreadsheet: pressing Tab or Enter moves focus to the next cell.
- A ghost (blank) row always appears at the bottom of each table, ready for new data entry — a new blank row spawns automatically when you start typing.
- Internal ID columns are hidden to keep the view clean.
- All columns in the Data Manager are sortable by clicking the column header.
- Column widths in the Data Manager are resizable by dragging the column divider.
- Asset categories are a dedicated normalised table — not a free-text field on assets.
- Asset rows can be reordered by dragging within their category.
- Categories can be reordered by dragging the category header.
- A "Reset to demo data" button restores the built-in example dataset.
- Deleting an asset, category, programme, or strategy shows a confirmation dialog and cascades the deletion to all dependent records.
- Data validation checks date formats, budget values, and foreign key references, flagging invalid entries inline.
- An inline notification confirms or reports the outcome of import/export actions (no browser alert dialogs).
- CSV data can be pasted directly into the Data Manager, skipping headers and merging by ID.

---

## Reports

- A dedicated Reports view provides printable summaries separate from the live timeline.
- **Budget Summary report** shows total spend broken down by Programme, by Strategy, and by Asset Category, each with a proportional bar chart.
- A grand total budget figure is shown at the top of the Budget Summary.
- **Initiatives and Dependencies report** lists every initiative per asset with its plain-language dependency sentences.
- **Milestone Dependencies report** lists all milestone-to-initiative links with plain-language descriptions.
- **History Differences report** lets you compare the current state against any saved version, showing which initiatives were added, removed, or changed (with a field-level breakdown of what changed).

---

## Import and Export

- Export the full dataset as an Excel (.xlsx) file containing all entity types on separate sheets.
- Import an Excel file to update the dataset — a preview modal shows what records were found before committing.
- Import supports two modes: Merge (update existing records by ID and add new ones) or Overwrite (replace all data).
- The import preview warns about schema issues or missing required fields, flagged by severity.
- Export the timeline visualiser as a PDF using the browser's print pipeline for crisp, searchable output.
- Export the timeline visualiser as an SVG vector file for use in presentations or design tools.

---

## Version History

- Save a named snapshot of the entire plan at any point in time, with an optional description.
- All saved versions are listed in the Version History panel, sorted most-recent-first.
- Select any saved version and restore it to roll the entire plan back to that state.
- Delete individual saved versions, with a confirmation dialog to prevent accidental loss.
- Compare any saved version against the current state via the History Differences report.
- The comparison report shows added, removed, and modified initiatives, relationships, and milestones — with field-level detail on what changed.

---

## Mobile

- The layout responds to small screens, providing a dedicated mobile experience.
- A bottom tab bar gives quick access to the main views on mobile (Visualiser, Data, Reports, History).
- The header collapses on mobile and exposes settings through a slide-up sheet rather than inline toggles.
- The timeline header row scrolls horizontally independently on mobile to keep context visible.
- The mobile Visualiser shows a card-based view of initiatives instead of the full scrollable canvas.
- Cards can be bucketed (grouped) by: Timeline status (Now / Starting Soon / Upcoming / Completed), Quarter, Year, Programme, or Strategy.
- Buckets are collapsible — tap a bucket header to show or hide the initiatives inside.
- Initiative cards show the name, date range, budget, programme, and any dependency warnings.
- Tapping a card opens the initiative edit panel for full details and editing.
- Touch targets on all interactive elements meet recommended minimum sizes.
- Numeric and date input fields use the correct mobile keyboard mode (numeric keypad, date picker, etc.).
- The footer is hidden on mobile to prevent overlap with the card view.

---

## Accessibility and Keyboard

- All header toggle buttons have accessible labels for screen readers.
- Focus is trapped within any open panel or modal — Tab cycles through controls inside, and pressing Escape closes it.
- All cells, dropdowns, and checkboxes in the Data Manager table have accessible labels.
- A keyboard shortcuts reference modal lists all available shortcuts (accessible from the header).
- Keyboard shortcuts: Cmd+Z to undo, Cmd+Shift+Z to redo, Escape to close panels, Tab to cycle focus, and double-click on the canvas to create an initiative.

---

## General / App-wide

- All data is stored locally in the browser (IndexedDB) — no account or server required.
- The app loads with a built-in demo dataset so the timeline is never empty on first use.
- Undo and redo are available globally, supporting up to 50 operations in history.
- All destructive actions (delete, overwrite, restore, clear) require confirmation through an in-app modal — no browser alert dialogs.
- An error boundary catches unexpected crashes and shows a recovery message rather than a blank screen.
- Data saves are atomic — all related records are committed together to prevent partial or corrupt states.
- The app runs entirely in the browser and can be self-hosted; no backend dependencies are required.
