# User Stories — Initiative Management

## US-IM-01: Edit Initiative Details in a Slide-In Panel

**As an** IT portfolio manager,
**I want** to click an initiative bar to open a side panel with all its details,
**so that** I can view and update the initiative without navigating away.

**Acceptance Criteria:**
- Clicking an initiative bar opens the InitiativePanel slide-in panel
- The panel shows: name, asset, programme, strategy, start date, end date, status, RAG status, progress, CapEx, OpEx, description, owner, linked application
- Changes saved in the panel immediately update the initiative bar and persist to IndexedDB
- The panel can be closed with the X button, the Cancel button, or the Escape key
- Tab key cycles focus within the panel without escaping to the rest of the page

---

## US-IM-02: Delete an Initiative

**As an** IT portfolio manager,
**I want** to delete an initiative from the edit panel,
**so that** I can remove cancelled or mistaken entries.

**Acceptance Criteria:**
- A delete button is visible in the InitiativePanel for existing initiatives
- Clicking delete shows a confirmation modal (no browser `window.confirm`)
- Confirming removes the initiative from the timeline and from IndexedDB
- Cancelling keeps the initiative unchanged

---

## US-IM-03: Track Initiative Status

**As an** IT portfolio manager,
**I want** to assign a status (Planned / Active / Done / Cancelled) to each initiative,
**so that** I can communicate progress state across the portfolio.

**Acceptance Criteria:**
- A Status field (Planned / Active / Done / Cancelled) is available in the InitiativePanel
- The same field is available in the Data Manager initiatives table
- The status value is saved and persisted to IndexedDB across reloads

---

## US-IM-04: Track Initiative Progress

**As an** IT portfolio manager,
**I want** to record a percentage completion on each initiative,
**so that** stakeholders can see how far along work is.

**Acceptance Criteria:**
- A % complete field is available in the InitiativePanel
- The same field is available in the Data Manager initiatives table
- The initiative bar renders a fill overlay proportional to the % complete value
- Progress values persist to IndexedDB across reloads

---

## US-IM-05: Assign an Owner to an Initiative

**As an** IT portfolio manager,
**I want** to assign an owner to each initiative,
**so that** accountability is visible directly on the timeline.

**Acceptance Criteria:**
- An Owner field is available in the InitiativePanel, populated from the Resources table
- Owner initials appear as a badge on the initiative bar
- The owner value is saved and persisted to IndexedDB across reloads

---

## US-IM-06: Set a Budget on an Initiative

**As an** IT portfolio manager,
**I want** to record a budget figure on each initiative,
**so that** financial planning is integrated into the portfolio view.

**Acceptance Criteria:**
- Separate **CapEx** and **OpEx** fields are available in the InitiativePanel and Data Manager
- The combined total (CapEx + OpEx) is used wherever a single "budget" figure is displayed (bar label, bar height, report totals)
- Enabling the "budget" display toggle shows a concise budget label (combined total) on the initiative bar
- Enabling "bar height mode" increases the bar height proportionally based on the combined total
- CapEx and OpEx figures are individually summed in the Budget Summary report

---

## US-IM-07: Group and Collapse Overlapping Initiatives

**As an** IT portfolio manager,
**I want** overlapping initiatives on the same asset to stack rather than collide,
**so that** I can see all work even when the schedule is busy.

**Acceptance Criteria:**
- The greedy placement algorithm arranges overlapping initiatives into multiple rows within the same swimlane
- Swimlane height expands dynamically to accommodate stacked rows
- Handles 20+ overlapping initiatives on a single asset without infinite loops or UI breakage
- A collapsed group shows: the sum of initiative budgets, initiative names concatenated, and a bullet-point description
- Collapsed group description expands to full height — no CSS `line-clamp-3` truncation
- Group description is visible even on bars spanning less than 8% of the timeline width

---

## US-IM-08: Split Budget into CapEx and OpEx

**As an** IT portfolio manager,
**I want** to record capital and operational expenditure separately on each initiative,
**so that** budget reports can distinguish investment spend from ongoing run costs.

**Acceptance Criteria:**
- Separate **CapEx** and **OpEx** numeric fields are available in the InitiativePanel
- The same two fields are available in the Data Manager initiatives table
- The combined total (CapEx + OpEx) is used wherever a single budget figure is displayed: bar label, bar height mode, and report totals
- CapEx and OpEx are individually summed in the Budget Summary report
- Both fields persist to IndexedDB across reloads
- Enabling the "budget" display toggle shows the combined total as a label on the initiative bar
- Enabling "bar height mode" scales bar height proportionally based on the combined total

---

## US-IM-09: Tag an Initiative with a DTS Adoption Phase

**As an** IT portfolio manager working within a DTS or Mixed workspace,
**I want** to tag each initiative with its DTS adoption phase,
**so that** I can group and colour the timeline by phase and report spend per phase.

**Acceptance Criteria:**
- A **DTS Phase** field (Phase 1 – Register & Expose / Phase 2 – Integrate DPI / Phase 3 – AI & Legacy Exit / Back-Office Consolidation / Not DTS) is available in the InitiativePanel when the workspace is DTS or Mixed
- The same field is available in the Data Manager initiatives table for DTS and Mixed workspaces
- The DTS Phase value persists to IndexedDB across reloads
- The timeline can be grouped by DTS Phase (see US-DS-02)
- The timeline can be coloured by DTS Phase (see US-DS-08)
- The Budget Summary report breaks spend down by DTS Phase in DTS and Mixed workspaces

---

## US-IM-10: Initiative Bar Interaction and Content Layout

**As an** IT portfolio manager,
**I want** initiative bars to show key information at a glance and respond predictably to clicks,
**so that** I can read the timeline and open the edit panel without unnecessary interactions.

**Acceptance Criteria:**
- A single click on an initiative bar selects it and reveals an edit icon (✎) in the top-right corner of the bar
- Double-clicking an initiative bar opens the edit panel directly, without requiring a separate click on the edit icon
- The edit icon is only visible on the selected bar; unselected bars show no icon
- The bar displays: initiative name, optional description text, optional budget pill, optional owner initials badge
- A progress fill overlay covers the left portion of the bar proportional to the initiative's % complete
- Resize handles appear on hover at the left and right edges of the bar; grabbing either edge resizes the initiative without opening the panel
- All bar content and interactions behave identically across all grouping modes (by asset, programme, strategy, DTS phase)
