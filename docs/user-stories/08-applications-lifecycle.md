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

## US-AL-02: View Applications as Sub-Rows in the Timeline

**As an** IT portfolio manager,
**I want** each application to appear as its own swimlane row beneath its parent asset row,
**so that** I can see the application landscape alongside the initiatives that affect it.

**Acceptance Criteria:**
- For each asset that has applications, one sub-row per application appears immediately below the asset's initiative row
- The application name is shown in the left sidebar of the sub-row
- Assets with no applications render without any sub-rows (no regressions)
- Milestones remain at the asset level

---

## US-AL-03: Assign Lifecycle Segments to an Application

**As an** IT portfolio manager,
**I want** to define time-bounded lifecycle segments on each application (e.g. In Production, Sunset, Out of Support),
**so that** I can show the full lifecycle state of a technology over the planning horizon.

**Acceptance Criteria:**
- Double-clicking an empty area in an application sub-row opens the segment creation panel pre-filled with the application and approximate dates
- A segment has: status (Planned / Funded / In Production / Sunset / Out of Support / Retired), optional label, start date, end date
- End date must be after start date (inline validation shown)
- Saving a segment renders a coloured bar in the application's sub-row at the correct position
- The same application can have multiple non-overlapping (or overlapping) segments representing lifecycle progression
- Segments are persisted to IndexedDB and survive page reload

---

## US-AL-04: Edit and Delete Lifecycle Segments

**As an** IT portfolio manager,
**I want** to click an existing segment bar to open an edit panel,
**so that** I can update dates, status, or label, or remove the segment entirely.

**Acceptance Criteria:**
- Clicking a segment bar opens the ApplicationSegmentPanel slide-in panel
- The panel pre-populates with the segment's current values
- Saving updates the segment on the timeline
- A delete button (with confirmation modal) removes the segment

---

## US-AL-05: Drag and Resize Lifecycle Segments

**As an** IT portfolio manager,
**I want** to drag a segment bar to move it and drag its edges to resize it,
**so that** I can adjust lifecycle dates directly on the canvas, consistent with how I manage initiative bars.

**Acceptance Criteria:**
- Dragging a segment bar horizontally moves its start and end dates, preserving duration
- Dragging the left edge changes the start date
- Dragging the right edge changes the end date
- Changes are saved to IndexedDB on mouse release
- Dragging does not accidentally trigger a click-to-open-panel action

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
