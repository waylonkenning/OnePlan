# User Stories — Timeline Visualiser

## US-TV-01: View IT Portfolio on a Timeline

**As an** IT portfolio manager,
**I want** to see all IT initiatives laid out as bars on a horizontal timeline grouped by asset and category,
**so that** I can understand what is happening across the portfolio at a glance.

**Acceptance Criteria:**
- Initiative bars are rendered at the correct horizontal position based on `startDate` and `endDate`
- Bars are grouped by IT asset within collapsible category swimlanes
- Asset name labels are sticky on the left and remain visible when scrolling horizontally
- Category labels remain sticky and visible when scrolling horizontally
- Swimlane height is compact by default (60px minimum) and expands dynamically when initiatives overlap
- The timeline correctly renders when an initiative has an invalid or missing date (no crash)

---

## US-TV-02: Configure the Timeline Window

**As an** IT portfolio manager,
**I want** to configure the start date and duration of the visible timeline window,
**so that** I can focus on the relevant planning horizon.

**Acceptance Criteria:**
- A header control allows setting the timeline start date (year/month)
- A header control allows setting the number of months to display
- Settings are persisted to IndexedDB and survive page reload
- If an initiative extends beyond the configured duration, the timeline auto-extends to fit it
- The timeline always shows the current or next year by default (not a hardcoded past year)

---

## US-TV-03: Create an Initiative by Double-Clicking the Timeline

**As an** IT portfolio manager,
**I want** to double-click an empty space on the timeline to create a new initiative,
**so that** I can quickly add work without leaving the visualiser.

**Acceptance Criteria:**
- Double-clicking an empty area on an asset's content row opens the initiative creation panel
- The asset and approximate start date are pre-filled based on where the click landed
- The new initiative appears on the timeline after saving

---

## US-TV-04: Drag to Move an Initiative

**As an** IT portfolio manager,
**I want** to drag an initiative bar left or right to change its start and end dates,
**so that** I can adjust the schedule directly on the canvas.

**Acceptance Criteria:**
- Dragging an initiative bar horizontally changes both `startDate` and `endDate`, preserving duration
- The initiative stays in its vertical row during the drag
- Changes are persisted to IndexedDB and survive page reload
- Drag cursor is not shown on mobile viewports

---

## US-TV-05: Resize an Initiative

**As an** IT portfolio manager,
**I want** to drag the left or right edge of an initiative bar to change its start or end date,
**so that** I can adjust scope or timeline without opening the edit panel.

**Acceptance Criteria:**
- A left-edge handle changes `startDate` when dragged
- A right-edge handle changes `endDate` when dragged
- The initiative does not snap back after mouse release
- Changes persist across page reload
- Resize handles are not shown on mobile viewports

---

## US-TV-06: View a Today Indicator Line

**As an** IT portfolio manager,
**I want** to see a vertical line marking today's date on the timeline,
**so that** I can immediately see how current work relates to the plan.

**Acceptance Criteria:**
- A red vertical line is rendered at today's date
- The line is labelled "Today"
- The indicator updates correctly when the timeline start date is changed

---

## US-TV-07: Zoom the Timeline

**As an** IT portfolio manager,
**I want** to zoom the timeline in and out,
**so that** I can see either fine-grained detail or the big picture.

**Acceptance Criteria:**
- Zoom-in button widens the timeline columns
- Zoom-out button narrows the timeline columns
- The zoom-in button is disabled at maximum zoom
- The zoom-out button is disabled at minimum zoom
- Zoom level persists across page reloads

---

## US-TV-08: Detect Scheduling Conflicts

**As an** IT portfolio manager,
**I want** to see a visual indicator when two initiatives on the same asset overlap in time,
**so that** I can identify resourcing or scheduling conflicts.

**Acceptance Criteria:**
- A red "Conflict Detected" marker appears at the start of any time overlap between two initiatives on the same asset
- Initiatives that share exactly the same end/start date (touching but not overlapping) are NOT marked as conflicts
- Conflict markers appear behind sticky swimlane labels when scrolling horizontally
- Initiative bars do not overlap sticky asset labels on hover
- Conflict detection can be toggled on/off via a header control

---

## US-TV-09: Reorder Assets and Categories by Drag-and-Drop

**As an** IT portfolio manager,
**I want** to drag assets and categories into my preferred vertical order,
**so that** the most important areas appear at the top.

**Acceptance Criteria:**
- Dragging a category row changes its vertical order relative to other categories
- Dragging an asset within a category changes its order within that category
- Drag handles are shown on desktop; hidden on mobile
- Reordered positions persist across page reloads

---

## US-TV-10: Collapse and Expand Swimlane Groups

**As an** IT portfolio manager,
**I want** to collapse category or asset swimlanes,
**so that** I can focus on the areas I care about.

**Acceptance Criteria:**
- Clicking a category header collapses all asset rows within it
- Collapsed swimlanes reduce the overall timeline height
- Expanding a swimlane restores the initiative bars
- Collapsed/expanded state persists across page reloads
