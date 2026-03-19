# User Stories — Dependency Mapping

## US-DM-01: Draw a Dependency Between Initiatives

**As an** IT portfolio manager,
**I want** to draw a dependency arrow between two initiative bars by dragging vertically,
**so that** I can model sequencing constraints directly on the canvas.

**Acceptance Criteria:**
- Dragging vertically from one initiative bar to another creates a dependency
- The arrow starts from the centre of the source initiative bar
- New arrows default to `requires` type (blue)
- The arrow is rendered as an SVG overlay above all initiative bars (z-index always greater than 20, including on hover)

---

## US-DM-02: Edit and Delete Dependencies

**As an** IT portfolio manager,
**I want** to click a dependency arrow to open an edit panel,
**so that** I can change the type, reverse the direction, or delete the dependency.

**Acceptance Criteria:**
- Clicking a dependency arrow opens the dependency edit panel
- The panel shows the full names of both source and target initiatives without truncation
- Dependency type can be changed: `blocks` (red), `requires` (blue), `related` (dark, no arrowhead)
- Dependency direction can be reversed from the panel
- A delete button removes the dependency (with confirmation modal)
- The panel can be dismissed with Escape

---

## US-DM-03: View Dependency Visuals on the Timeline

**As an** IT portfolio manager,
**I want** dependency arrows to be visually distinct by type,
**so that** I can understand the nature of constraints at a glance.

**Acceptance Criteria:**
- `blocks` dependencies render as red arrows
- `requires` dependencies render as blue arrows
- `related` dependencies render as dark arrows with no arrowhead
- Intra-asset dependency arrows have at least a 32px vertical gap to avoid overlap
- Dependency labels are offset from the arrow midpoint so they don't cover the line
- Clicking a dependency label shows a plain-language tooltip sentence; clicking the tooltip dismisses it
- Dependency visibility can be toggled on/off via a header control

---

## US-DM-04: Reposition a Dependency Arrow

**As an** IT portfolio manager,
**I want** to drag a dependency arrow horizontally to move its midpoint,
**so that** I can reduce visual clutter when arrows overlap.

**Acceptance Criteria:**
- Dragging an arrow horizontally changes its routing offset
- Parallel arrows in the same corridor are automatically staggered with different midX values
- Dragged offsets persist across page reloads

---

## US-DM-05: Disambiguate Overlapping Arrows

**As an** IT portfolio manager,
**I want** to select from a disambiguation popover when clicking near overlapping arrows,
**so that** I can open the correct dependency panel without guessing.

**Acceptance Criteria:**
- Clicking near two overlapping arrows shows a disambiguation popover listing both
- Clicking a specific arrow (by `data-dep-id`) opens the correct dependency panel

---

## US-DM-06: View Dependencies in the Initiative Panel

**As an** IT portfolio manager,
**I want** to see related dependencies listed in the initiative edit panel,
**so that** I have context when editing a specific initiative.

**Acceptance Criteria:**
- A "Related Initiatives" section appears in the InitiativePanel when the initiative has dependencies
- The section is hidden when the initiative has no dependencies

---

## US-DM-07: Create Dependencies from Milestones

**As an** IT portfolio manager,
**I want** to create a dependency from a milestone to an initiative,
**so that** I can model "initiative cannot start until this milestone is reached" constraints.

**Acceptance Criteria:**
- A dependency can be drawn from a milestone to an initiative
- Milestone dependencies are rendered as arrows in the timeline
- Milestone dependencies are included in the dependency report

---

## US-DM-08: Highlight the Critical Path

**As an** IT portfolio manager,
**I want** to highlight the longest dependency chain on the timeline,
**so that** I can immediately see which sequence of work determines the overall end date.

**Acceptance Criteria:**
- A "Critical Path" toggle button is visible in the header, off by default
- Enabling the toggle visually distinguishes bars and arrows on the critical path from non-critical items
- The critical path toggle state persists across page reloads
