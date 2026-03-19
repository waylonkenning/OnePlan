# User Stories — Initiative Management

## US-IM-01: Edit Initiative Details in a Slide-In Panel

**As an** IT portfolio manager,
**I want** to click an initiative bar to open a side panel with all its details,
**so that** I can view and update the initiative without navigating away.

**Acceptance Criteria:**
- Clicking an initiative bar opens the InitiativePanel slide-in panel
- The panel shows: name, asset, programme, strategy, start date, end date, status, progress, budget, description, owner, linked application
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
- A budget field is available in the InitiativePanel and Data Manager
- Enabling the "budget" display toggle shows a concise budget label on the initiative bar
- Enabling "bar height mode" increases the bar height proportionally for budgeted items
- Budget figures are used in the Budget Summary report

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
