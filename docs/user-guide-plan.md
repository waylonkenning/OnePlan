# User Guide — Build Plan

## Objective

Convert the existing user stories into a comprehensive, task-oriented user guide covering every
feature of Scenia. Each page should explain *how* a feature works in plain language, show a
screenshot where the feature is visual, and be written from the perspective of a working IT
portfolio manager — not a developer.

---

## Guiding Principles

- **Task-oriented, not feature-oriented.** Organise pages around what users *want to do*
  ("Track who owns each initiative") rather than what the system calls things ("Owner field").
- **One concept per page.** Short, focused pages are easier to link to than monolithic docs.
- **Screenshots for anything visual.** If a feature changes what's on screen, show it.
- **Derived from user stories.** Each page maps to one or more user story IDs so coverage
  can be verified against the test suite.

---

## Information Architecture

### Structure overview

```
docs/user-guide/
├── README.md                        # User guide home / navigation hub
├── 01-getting-started/
│   ├── what-is-scenia.md
│   ├── first-launch.md
│   └── navigating-the-app.md
├── 02-timeline/
│   ├── reading-the-timeline.md
│   ├── configuring-the-window.md
│   ├── creating-initiatives.md
│   ├── moving-and-resizing.md
│   ├── conflict-detection.md
│   └── today-indicator.md
├── 03-initiatives/
│   ├── editing-an-initiative.md
│   ├── initiative-fields.md
│   └── deleting-an-initiative.md
├── 04-dependencies/
│   ├── drawing-dependencies.md
│   ├── dependency-types.md
│   ├── editing-dependencies.md
│   ├── milestone-dependencies.md
│   └── critical-path.md
├── 05-applications/
│   ├── adding-applications.md
│   ├── lifecycle-segments.md
│   ├── managing-segments.md
│   └── display-mode.md
├── 06-display-settings/
│   ├── colour-modes.md
│   ├── grouping-modes.md
│   ├── inline-toggles.md
│   ├── zoom-and-columns.md
│   └── legend.md
├── 07-data-manager/
│   ├── overview.md
│   ├── inline-editing.md
│   ├── csv-paste.md
│   └── search-and-filter.md
├── 08-resources/
│   ├── resource-roster.md
│   └── assigning-resources.md
├── 09-reports/
│   ├── overview.md
│   ├── initiatives-dependencies-report.md
│   ├── budget-report.md
│   ├── capacity-report.md
│   └── history-diff-report.md
├── 10-version-history/
│   ├── saving-a-version.md
│   ├── comparing-versions.md
│   └── restoring-a-version.md
├── 11-import-export/
│   ├── excel-import.md
│   ├── excel-export.md
│   └── pdf-svg-export.md
└── 12-mobile/
    ├── card-view.md
    └── mobile-settings.md
```

---

## Page Specifications

Each page spec lists: the title, the user story IDs it covers, the prose to include, and
whether a screenshot is needed (and which one to use or capture).

---

### Section 01 — Getting Started

#### `what-is-scenia.md`
- **Covers:** Context only (no user story ID)
- **Content:** What Scenia is (IT portfolio planning tool), who it's for (IT portfolio managers),
  how data stays private (IndexedDB — never leaves the browser), open source (Apache 2.0).
- **Screenshot:** `public/tutorial/1-overview.png` (hero overview of the full UI)

#### `first-launch.md`
- **Covers:** US-UX-03, US-UX-05
- **Content:** What happens on first load (demo data initialised, tutorial modal appears),
  how to dismiss the tutorial, how to access it again via the Help button.
- **Screenshot:** Capture new — tutorial modal open on first load.

#### `navigating-the-app.md`
- **Covers:** US-UX-01, US-UX-02
- **Content:** The four main tabs (Visualiser, Data Manager, Reports, History), the global
  search bar, the Undo/Redo buttons, the keyboard shortcuts modal, the Help button.
- **Screenshot:** `public/features/view-switching.png`

---

### Section 02 — The Timeline

#### `reading-the-timeline.md`
- **Covers:** US-TV-01
- **Content:** How the timeline is laid out (categories → assets → swimlanes → bars), what
  the x-axis represents, how the floating legend maps colours to programmes/strategies/statuses,
  what the Today indicator line shows.
- **Screenshot:** `public/tutorial/2-visualiser.png`

#### `configuring-the-window.md`
- **Covers:** US-TV-02, US-TV-07
- **Content:** The Start Date and Months inputs in the header, how changing them shifts the
  visible window, auto-extension when an initiative falls outside the range, zoom in/out
  buttons, zoom persisting across reloads. Note on 3-month view: weekly columns snap to
  the Monday of the start week.
- **Screenshot:** Capture new — header controls with start date / months / zoom visible.

#### `creating-initiatives.md`
- **Covers:** US-TV-03
- **Content:** Double-click an empty area on any asset's content row to open the creation
  panel; the asset and approximate start date are pre-filled based on where you clicked;
  fill in the details and click "Add Initiative".
- **Screenshot:** Capture new — creation panel open after double-clicking the canvas.

#### `moving-and-resizing.md`
- **Covers:** US-TV-04, US-TV-05
- **Content:** Drag a bar left/right to shift dates while preserving duration; drag the left
  edge to change start date; drag the right edge to change end date. Tap once to select,
  then drag — prevents accidental moves. Changes persist without a Save button.
- **Screenshot:** `public/features/move-resize.png`

#### `conflict-detection.md`
- **Covers:** US-TV-08
- **Content:** When two initiatives on the same asset overlap in time a red "Conflict Detected"
  marker appears. Initiatives that only touch (end date == start date) are not flagged.
  The toggle in the header turns conflict detection on/off.
- **Screenshot:** `public/features/conflict.png`

#### `today-indicator.md`
- **Covers:** US-TV-06
- **Content:** A red vertical line marked "Today" is always rendered at the current date.
  It updates when you change the timeline window so you always know where you are relative
  to the plan.
- **Screenshot:** Capture new — today line clearly visible on the canvas.

---

### Section 03 — Initiative Details

#### `editing-an-initiative.md`
- **Covers:** US-IM-01
- **Content:** Click an initiative bar to open the slide-in panel; all fields are editable
  in place; save with "Save Changes"; close with X, Cancel, or Escape; Tab key stays
  inside the panel.
- **Screenshot:** `public/features/inline-editing.png` (or capture new of the panel open)

#### `initiative-fields.md`
- **Covers:** US-IM-01, US-IM-03, US-IM-04, US-IM-05, US-IM-06
- **Content:** Reference table covering every field:
  | Field | What it does | Where it appears |
  |-------|-------------|-----------------|
  | Name | Initiative title | Bar label, reports |
  | Asset | Which IT asset this belongs to | Grouping, swimlane |
  | Programme / Strategy | Portfolio alignment | Colour legend, reports |
  | Status | Planned / Active / Done / Cancelled | Colour-by-status mode |
  | Start / End Date | Timeline position | Bar position |
  | Progress % | Completion fill overlay on the bar | Bar |
  | Owner | Person responsible (from Resources) | Initials badge on bar |
  | Budget | Planned cost (NZD) | Budget labels, reports |
  | Description | Free-text notes | Bar tooltip, card view |
  | Application | Which application this work relates to | Metadata |
  | Resources | Assigned team members | Bar label (if toggle on) |
- **Screenshot:** None needed (table format)

#### `deleting-an-initiative.md`
- **Covers:** US-IM-02, US-UX-07
- **Content:** Open the edit panel, click the trash icon; a confirmation modal asks you to
  confirm before the initiative is permanently removed.
- **Screenshot:** Capture new — ConfirmModal visible.

---

### Section 04 — Dependencies

#### `drawing-dependencies.md`
- **Covers:** US-DM-01
- **Content:** Hover over an initiative bar until the drag handles appear; drag *vertically*
  from one bar to another to create a dependency arrow. The arrow starts from the centre
  of the source bar and defaults to `requires` type (blue).
- **Screenshot:** `public/features/dependency.png`

#### `dependency-types.md`
- **Covers:** US-DM-03
- **Content:** Three types of dependency with visual examples:
  - **Requires** (blue arrow + arrowhead) — "A requires B to start first"
  - **Blocks** (red arrow + arrowhead) — "A must finish before B can start"
  - **Related** (dark arrow, no arrowhead) — general informational connection
  Critical path arrows use a highlighted style when that toggle is on. Arrows can be
  toggled on/off via the Relationships toggle.
- **Screenshot:** Capture new — all three arrow types visible side by side.

#### `editing-dependencies.md`
- **Covers:** US-DM-02, US-DM-04, US-DM-05
- **Content:** Click an arrow to open the dependency panel; change type or reverse direction;
  delete with confirmation. Drag an arrow horizontally to reposition its routing midpoint.
  If two arrows overlap, a disambiguation popover appears — click the one you want.
- **Screenshot:** Capture new — dependency panel open.

#### `milestone-dependencies.md`
- **Covers:** US-DM-07
- **Content:** Milestones can be the *source* of a dependency — drag from a milestone to an
  initiative bar to model "this initiative cannot start until this milestone is reached".
  Milestone dependencies appear in the dependency report.
- **Screenshot:** `public/features/milestone-dependency.png`

#### `critical-path.md`
- **Covers:** US-DM-08
- **Content:** The critical path is the longest chain of sequenced work — the sequence that
  determines the earliest possible end date. Toggle it on in the header to highlight the
  relevant bars and arrows. The toggle state persists across reloads.
- **Screenshot:** Capture new — critical path highlighting active.

---

### Section 05 — Applications & Lifecycle

#### `adding-applications.md`
- **Covers:** US-AL-01
- **Content:** Go to Data Manager → Applications tab; add each software product that makes
  up an IT asset (e.g. Okta, Azure AD B2C under CIAM). Each application belongs to one
  asset. Applications appear as the swimlane labels once lifecycle segments are added.
- **Screenshot:** Capture new — Applications tab in Data Manager.

#### `lifecycle-segments.md`
- **Covers:** US-AL-02, US-AL-03, US-AL-08
- **Content:** Once an asset has applications, an "Applications" swimlane appears beneath
  its initiative row. Double-click the swimlane to open the segment creation panel; choose
  which application, pick a lifecycle status (Planned / Funded / In Production / Sunset /
  Out of Support / Retired), set the date range, and save. Each status has a distinct
  colour and stripe pattern. The application name or custom label is shown on the bar.
- **Screenshot:** Capture new — applications swimlane with multiple coloured segments.

#### `managing-segments.md`
- **Covers:** US-AL-04, US-AL-05, US-AL-06, US-AL-07
- **Content:** Single-click to select a segment; double-click to open the edit panel.
  Drag the bar horizontally to move dates; drag the left or right edge (look for the white
  indicator line) to resize; drag vertically to move to a different row. Overlapping
  segments stack automatically — the swimlane grows to accommodate them. Use ↑/↓ buttons
  (top-left of selected bar) to nudge a segment between rows. Delete via the trash icon
  in the edit panel.
- **Screenshot:** Capture new — swimlane with stacked segments and one segment selected
  showing the row buttons and edge indicators.

#### `display-mode.md`
- **Covers:** US-DS-06
- **Content:** Use the display mode picker in the header to choose what the timeline shows:
  - **Both** (default) — initiative bars and application swimlane together
  - **Initiatives Only** — hides all application swimlanes
  - **Applications Only** — hides initiative bars, shows only application lifecycle
  The selected mode persists across reloads.
- **Screenshot:** Capture new — "Applications Only" mode showing clean lifecycle view.

---

### Section 06 — Display Settings

#### `colour-modes.md`
- **Covers:** US-DS-01
- **Content:** Open the View popover in the header; choose By Programme, By Strategy, or
  By Status. The bar colours and floating legend update immediately. The setting persists.
- **Screenshot:** `public/features/colour-by-status.png`

#### `grouping-modes.md`
- **Covers:** US-DS-02
- **Content:** The same View popover offers grouping: By Asset (default), By Programme,
  By Strategy. Grouping re-draws the swimlane rows — useful for seeing all initiatives
  within a programme regardless of which asset they belong to.
- **Screenshot:** `public/features/grouped.png`

#### `inline-toggles.md`
- **Covers:** US-DS-03
- **Content:** Four icon toggle buttons in the header (desktop) / settings sheet (mobile):
  - **Conflict detection** — show/hide red conflict markers
  - **Dependency lines** — show/hide dependency arrows
  - **Descriptions** — show/hide initiative description text on bars and card rows
  - **Budget** — cycles: off → budget labels → bar height mode → off
  Each button shows an `aria-pressed` state; changes take effect immediately.
- **Screenshot:** Capture new — header with all four toggle buttons visible and annotated.

#### `zoom-and-columns.md`
- **Covers:** US-TV-07, US-DS-05
- **Content:** Zoom in/out with the +/- buttons in the header; the zoom is disabled at
  min/max and persists across reloads. Drag the border between the sidebar and content
  columns to resize the asset name column — also persists.
- **Screenshot:** `public/features/column-resize.png`

#### `legend.md`
- **Covers:** US-DS-04
- **Content:** A collapsible floating legend is anchored to the bottom-right of the canvas.
  It shows colour swatches for the active colour mode, milestone icon types
  (info/warning/critical), dependency arrow styles, and the conflict indicator.
  Click the legend header to collapse/expand; state persists.
- **Screenshot:** Capture new — legend expanded showing all four sections.

---

### Section 07 — Data Manager

#### `overview.md`
- **Covers:** US-DA-01
- **Content:** The Data Manager has nine tabs: Initiatives, Dependencies, Assets, Asset
  Categories, Programmes, Strategies, Milestones, Resources, Applications. Each tab shows
  a row count badge. Use this view for bulk edits, imports, and data cleanup.
- **Screenshot:** `public/tutorial/5-data-manager.png`

#### `inline-editing.md`
- **Covers:** US-DA-02, US-DA-03
- **Content:** Double-click any cell to edit it in place — text, numbers, dropdowns, and
  checkboxes are all supported. Edits save immediately and update the timeline. "Add Row"
  creates a new record. Delete a row with the trash icon (confirmation required). "Reset"
  options let you return to demo data or clear everything.
- **Screenshot:** `public/features/inline-editing.png`

#### `csv-paste.md`
- **Covers:** US-DA-04
- **Content:** Click "Paste CSV" in any table tab; paste CSV text (with or without a
  header row). Rows with an `id` matching an existing record will *update* that record
  rather than create a duplicate. Quoted values containing commas are handled correctly.
  Missing optional columns are ignored.
- **Screenshot:** Capture new — CSV paste dialog open.

#### `search-and-filter.md`
- **Covers:** US-DA-08
- **Content:** The global search input in the header filters simultaneously: initiative bars
  on the timeline, and all rows in every Data Manager table. Clear the input to restore
  everything.
- **Screenshot:** `public/features/global-search.png`

---

### Section 08 — Resources

#### `resource-roster.md`
- **Covers:** US-RC-01
- **Content:** Go to Data Manager → Resources tab; add each team member with Name and Role.
  Resources are used to populate the Owner and Assigned Resources fields on initiatives.
- **Screenshot:** Capture new — Resources tab in Data Manager.

#### `assigning-resources.md`
- **Covers:** US-RC-02
- **Content:** Open an initiative's edit panel; use the Owner dropdown to set the primary
  responsible person (their initials appear as a badge on the bar); use the Resources
  checklist to assign multiple contributors. Enable the "Show Resources" toggle to display
  names on bars.
- **Screenshot:** `public/features/capacity.png` (or capture new of initiative panel
  with resources section visible)

---

### Section 09 — Reports

#### `overview.md`
- **Covers:** US-RP-01
- **Content:** Navigate to the Reports tab; a home screen shows four cards — choose one to
  open that full-width report. A back button returns you to the home screen.
- **Screenshot:** Capture new — Reports home screen with four cards.

#### `initiatives-dependencies-report.md`
- **Covers:** US-RP-02
- **Content:** Lists every initiative grouped by asset, with plain-English dependency
  sentences written from each initiative's perspective (e.g. "Blocked: X can't start until
  Y has finished"). Useful for sharing with stakeholders who don't use the timeline.
- **Screenshot:** Capture new — dependency report section.

#### `budget-report.md`
- **Covers:** US-RP-03
- **Content:** Shows total spend broken down by programme, strategy, and asset category.
  Totals are calculated from the budget values in the Data Manager initiatives table.
- **Screenshot:** Capture new — budget summary charts.

#### `capacity-report.md`
- **Covers:** US-RP-04, US-RC-03
- **Content:** Shows how each resource is allocated over the planning timeline. Allocation
  reflects current initiative resource assignments. Use this to spot overloaded people
  before the schedule is locked.
- **Screenshot:** `public/features/capacity.png`

#### `history-diff-report.md`
- **Covers:** US-RP-05
- **Content:** See "Comparing Versions" in Section 10. The same diff is available directly
  from Reports → History Differences without opening the Version Manager.
- **Screenshot:** `public/features/version-history.png`

---

### Section 10 — Version History

#### `saving-a-version.md`
- **Covers:** US-VH-01
- **Content:** Click the History tab; click "Save Current State"; give the snapshot a name
  and optional description. Saved snapshots are deep clones — changes after saving do not
  affect them. Snapshots persist in IndexedDB across reloads.
- **Screenshot:** `public/features/version-history.png`

#### `comparing-versions.md`
- **Covers:** US-VH-04
- **Content:** In the Reports view, open "History Differences"; select a saved baseline
  version from the dropdown; run the diff. The report highlights which initiatives/assets
  were added, removed, or modified between that baseline and the current state.
- **Screenshot:** Capture new — diff report showing changes.

#### `restoring-a-version.md`
- **Covers:** US-VH-02, US-VH-03
- **Content:** In the History tab, select a snapshot and click "Restore" — a confirmation
  modal warns that the current state will be overwritten. To clean up, delete snapshots
  you no longer need via the trash icon (confirmation required).
- **Screenshot:** Capture new — version list with restore/delete actions visible.

---

### Section 11 — Import & Export

#### `excel-import.md`
- **Covers:** US-DA-05
- **Content:** Click Import in the header; upload a `.xlsx` file; the preview modal shows
  the data before committing. Choose "Merge Data" to update existing records and add new
  ones, or "Overwrite All Data" to replace everything. Schema warnings are shown if
  required fields are missing.
- **Screenshot:** Capture new — Import Preview modal open.

#### `excel-export.md`
- **Covers:** US-DA-06
- **Content:** Click Export → Excel; a `.xlsx` file is downloaded containing all data sheets
  (Initiatives, Assets, Programmes, Strategies, Milestones). Use this for offline backup
  or sharing with colleagues.
- **Screenshot:** None needed.

#### `pdf-svg-export.md`
- **Covers:** US-DA-07
- **Content:** While in the Visualiser view, click Export → PDF or Export → SVG to
  download the current timeline canvas. PDF is optimised for printing/embedding in
  reports; SVG is a vector format suitable for presentations.
- **Screenshot:** None needed.

---

### Section 12 — Mobile

#### `card-view.md`
- **Covers:** US-MB-01 → US-MB-05, US-MB-04
- **Content:** On a phone or tablet, the Visualiser tab shows an asset card layout instead
  of the scrollable timeline. Each card represents an asset; initiatives within it are
  grouped by a configurable bucket (Timeline period, Quarter, Year, Programme, or
  Strategy). Tap an initiative row to open the full edit panel. Conflict badges appear on
  cards where scheduling conflicts exist. The date window filter (start date + months)
  applies — initiatives outside the range are hidden with an "outside date range" message.
- **Screenshot:** Capture new — mobile card view showing multiple asset cards.

#### `mobile-settings.md`
- **Covers:** US-MB-02, US-MB-06
- **Content:** Tap the settings icon in the mobile header to open the bottom settings sheet.
  From here: change the bucket grouping, toggle Descriptions / Budget / Relationships /
  Conflicts display on card rows. These are the mobile equivalents of the desktop inline
  toggles.
- **Screenshot:** Capture new — mobile settings sheet open.

---

## Screenshot Capture Plan

The table below shows every screenshot needed, distinguishing between existing images that
can be reused and new captures needed.

| Page | Screenshot | Status | Source |
|------|-----------|--------|--------|
| what-is-scenia | Hero overview | ✅ exists | `public/tutorial/1-overview.png` |
| reading-the-timeline | Full timeline | ✅ exists | `public/tutorial/2-visualiser.png` |
| moving-and-resizing | Drag/resize demo | ✅ exists | `public/features/move-resize.png` |
| conflict-detection | Conflict marker | ✅ exists | `public/features/conflict.png` |
| drawing-dependencies | Dependency arrows | ✅ exists | `public/features/dependency.png` |
| milestone-dependencies | Milestone arrow | ✅ exists | `public/features/milestone-dependency.png` |
| colour-modes | Colour by status | ✅ exists | `public/features/colour-by-status.png` |
| grouping-modes | Grouped view | ✅ exists | `public/features/grouped.png` |
| zoom-and-columns | Column resize | ✅ exists | `public/features/column-resize.png` |
| inline-editing (data) | Table editing | ✅ exists | `public/features/inline-editing.png` |
| search-and-filter | Global search | ✅ exists | `public/features/global-search.png` |
| capacity-report | Capacity chart | ✅ exists | `public/features/capacity.png` |
| history-diff-report | Version diff | ✅ exists | `public/features/version-history.png` |
| saving-a-version | Version history | ✅ exists | `public/features/version-history.png` |
| data-manager/overview | Data Manager | ✅ exists | `public/tutorial/5-data-manager.png` |
| first-launch | Tutorial modal | 🔲 capture new | `e2e/capture-screenshots.spec.ts` |
| navigating-the-app | Header + tabs | ✅ exists | `public/features/view-switching.png` |
| configuring-the-window | Header controls | 🔲 capture new | |
| creating-initiatives | Creation panel | 🔲 capture new | |
| today-indicator | Today line | 🔲 capture new | |
| editing-an-initiative | Edit panel | 🔲 capture new | |
| deleting-an-initiative | Confirm modal | 🔲 capture new | |
| dependency-types | All three types | 🔲 capture new | |
| editing-dependencies | Dep panel open | 🔲 capture new | |
| critical-path | CP highlighting | 🔲 capture new | |
| adding-applications | Applications tab | 🔲 capture new | |
| lifecycle-segments | Swimlane + bars | 🔲 capture new | |
| managing-segments | Selected segment | 🔲 capture new | |
| display-mode | Apps-only mode | 🔲 capture new | |
| inline-toggles | Header toggles | 🔲 capture new | |
| legend | Legend expanded | 🔲 capture new | |
| csv-paste | CSV dialog | 🔲 capture new | |
| resource-roster | Resources tab | 🔲 capture new | |
| assigning-resources | Initiative panel resources | 🔲 capture new | |
| reports/overview | Reports home | 🔲 capture new | |
| initiatives-dependencies-report | Dep report | 🔲 capture new | |
| budget-report | Budget charts | 🔲 capture new | |
| comparing-versions | Diff report | 🔲 capture new | |
| restoring-a-version | Version list | 🔲 capture new | |
| excel-import | Import preview | 🔲 capture new | |
| card-view (mobile) | Mobile cards | 🔲 capture new | |
| mobile-settings | Settings sheet | 🔲 capture new | |

**13 existing** screenshots can be reused. **27 new** captures needed.

---

## User Story Coverage Map

| User Story File | Stories | Guide Section(s) |
|----------------|---------|-----------------|
| 01-timeline-visualiser | US-TV-01 → US-TV-11 | §02 Timeline, §06 Display Settings |
| 02-initiative-management | US-IM-01 → US-IM-07 | §03 Initiatives |
| 03-dependency-mapping | US-DM-01 → US-DM-08 | §04 Dependencies |
| 04-data-management | US-DA-01 → US-DA-08 | §07 Data Manager, §11 Import/Export |
| 05-version-history | US-VH-01 → US-VH-04 | §10 Version History |
| 06-reports | US-RP-01 → US-RP-05 | §09 Reports |
| 07-resources-capacity | US-RC-01 → US-RC-03 | §08 Resources |
| 08-applications-lifecycle | US-AL-01 → US-AL-08 | §05 Applications |
| 09-display-settings | US-DS-01 → US-DS-06 | §06 Display Settings |
| 10-mobile | US-MB-01 → US-MB-06 | §12 Mobile |
| 11-navigation-ux | US-UX-01 → US-UX-09 | §01 Getting Started, §03, §07 |

---

## Build Sequence

Recommended order of page authoring, front-loaded by user importance:

1. §01 Getting Started (3 pages) — unblocks all other sections
2. §02 Timeline (6 pages) — core of the product
3. §03 Initiatives (3 pages) — most-used interaction
4. §07 Data Manager (4 pages) — second most-used
5. §04 Dependencies (5 pages) — key differentiator
6. §06 Display Settings (5 pages) — customisation
7. §11 Import/Export (3 pages) — practical utility
8. §10 Version History (3 pages)
9. §09 Reports (5 pages)
10. §05 Applications (4 pages)
11. §08 Resources (2 pages)
12. §12 Mobile (2 pages)

Screenshots for new captures can be added to `e2e/capture-screenshots.spec.ts` in a
dedicated `userGuide` describe block, using the same `page.screenshot()` pattern used for
existing tutorial and feature images. Store them in `public/user-guide/`.

---

## README (Navigation Hub)

The `docs/user-guide/README.md` should serve as a full table of contents linking every page,
organised by section, with a one-line description of each. It should also include a
"Quick Start" path (§01 → §02 → §03) for new users and a "Feature Reference" index for
users looking up a specific capability.
