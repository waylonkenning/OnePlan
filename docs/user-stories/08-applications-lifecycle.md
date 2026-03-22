# User Stories — Applications & Lifecycle Segments

## US-AL-01: Model IT Applications Within an Asset

**As an** IT portfolio manager,
**I want** to record the software applications that make up each IT asset,
**so that** I can distinguish between the strategic asset (e.g. CIAM) and the specific products delivering it (e.g. Entra B2C, Okta).

**Acceptance Criteria:**
- An "Applications" tab is present in the Data Manager with Name and Asset (parent) columns
- Applications can be added, edited inline, and deleted
- Each application belongs to exactly one IT asset
- Applications are included in version snapshots

---

## US-AL-02: View Applications as a Swimlane in the Timeline

**As an** IT portfolio manager,
**I want** each asset's applications to appear in a single "Applications" swimlane beneath the asset's initiative row,
**so that** I can see the full application landscape alongside the initiatives that affect it.

**Acceptance Criteria:**
- For each asset that has applications, a single "Applications" swimlane appears immediately below the asset's initiative row
- The swimlane label is shown in the left sidebar
- Lifecycle segments for different applications within the same swimlane stack vertically into separate rows when their date ranges conflict
- The swimlane height expands to accommodate stacked rows
- Assets with no applications render without any swimlane (no regressions)
- Milestones remain at the asset level

---

## US-AL-03: Assign Lifecycle Segments to an Application

**As an** IT portfolio manager,
**I want** to define time-bounded lifecycle segments on each application (e.g. In Production, Sunset, Out of Support),
**so that** I can show the full lifecycle state of a technology over the planning horizon.

**Acceptance Criteria:**
- Double-clicking an empty area in the Applications swimlane opens the segment creation panel pre-filled with the approximate dates
- The segment creation panel includes an Application dropdown listing all applications for the asset; selecting one associates the segment with that application
- A segment has: status (Planned / Funded / In Production / Sunset / Out of Support / Retired), optional label, start date, end date
- End date must be after start date (inline validation shown)
- Saving a segment renders a coloured bar in the swimlane at the correct position
- The same application can have multiple non-overlapping (or overlapping) segments representing lifecycle progression
- Segments are persisted to IndexedDB and survive page reload

---

## US-AL-04: Edit and Delete Lifecycle Segments

**As an** IT portfolio manager,
**I want** to click an existing segment bar to open an edit panel,
**so that** I can update dates, status, or label, or remove the segment entirely.

**Acceptance Criteria:**
- Single-clicking a segment bar selects it; double-clicking an existing segment bar opens the Edit Lifecycle Segment panel directly (single-click selects the segment; double-click opens the panel)
- The panel pre-populates with the segment's current values
- Saving updates the segment on the timeline
- A delete button (with confirmation modal) is present for segments created via double-click as well as those created via single-click editing

---

## US-AL-05: Drag and Resize Lifecycle Segments

**As an** IT portfolio manager,
**I want** to drag a segment bar to move it and drag its edges to resize it,
**so that** I can adjust lifecycle dates directly on the canvas, consistent with how I manage initiative bars.

**Acceptance Criteria:**
- Dragging a segment bar horizontally moves its start and end dates, preserving duration
- Dragging a segment bar vertically moves it to the next or previous row within the swimlane (same as the ↑/↓ row buttons)
- Dragging the left edge changes the start date
- Dragging the right edge changes the end date
- Left and right resize edges show a visible white indicator bar so users know they are draggable
- Row-control buttons are positioned in the top-left of the segment bar so they do not overlap the right-edge resize handle
- Changes are saved to IndexedDB on mouse release
- Dragging does not accidentally trigger a click-to-open-panel action
- While dragging a segment vertically, all other segments remain fixed in their current positions; conflict resolution (row reassignment of neighbours) is deferred until mouse release
- Clicking a segment (mousedown + mouseup without movement) does not cause any other segment to change position

---

## US-AL-06: Link an Initiative to an Application

**As an** IT portfolio manager,
**I want** to link an initiative to a specific application within its asset,
**so that** I can record which application a piece of work relates to.

**Acceptance Criteria:**
- The InitiativePanel includes an "Application" dropdown filtered to applications belonging to the selected asset
- Changing the asset resets the application selection
- The selected application is saved and persists to IndexedDB
- Linked initiatives continue to render at the asset level on the timeline (applicationId is metadata only)

---

## US-AL-07: Stack Overlapping Segments Without Collision

**As an** IT portfolio manager,
**I want** overlapping lifecycle segments on the same application to stack into separate rows,
**so that** I can see all segments even when their date ranges overlap.

**Acceptance Criteria:**
- Overlapping segments are automatically placed into separate rows within the single Applications swimlane
- The swimlane height expands to accommodate stacked rows
- Dragging a segment horizontally resolves conflicts by pushing colliding segments to the nearest free row
- Row assignments persist to IndexedDB

---

## US-AL-08: Visually Distinguish Segment Statuses

**As an** IT portfolio manager,
**I want** lifecycle segments to be visually distinct by status,
**so that** I can immediately see the lifecycle state of each technology at a glance.

**Acceptance Criteria:**
- Each lifecycle status has a distinct colour (e.g. Planned = slate, Funded = blue, In Production = green, Sunset = amber, Out of Support = orange, Retired = red)
- Segments use a stripe pattern or other visual treatment to further distinguish statuses
- The status label or application name is displayed on the segment bar
- Statuses are editable directly from the segment panel

---

## US-AL-09: Segment Label Remains Visible When Bar Extends Before the Timeline Window

**As an** IT portfolio manager,
**I want** to always see the label on a lifecycle segment bar even when the segment started before the visible timeline window,
**so that** I can identify what each segment represents without having to scroll back in time or hover for a tooltip.

**Acceptance Criteria:**
- When a segment's start date is before the visible timeline window and its bar extends into the visible area, the label is pinned to the left edge of the content area (not clipped off-screen)
- When a segment is fully within the visible window, the label sits at the natural start of the bar (no change to normal behaviour)
- Both the application name / custom label and the status badge remain readable at the clamped position
