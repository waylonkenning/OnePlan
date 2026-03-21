# User Stories — Mobile Experience

## US-MB-01: Use the App on a Mobile Device (Foundation)

**As an** IT portfolio manager on the go,
**I want** the app to render usably on a mobile viewport,
**so that** I can review the portfolio from my phone.

**Acceptance Criteria:**
- Timeline sidebar narrows to 120px on mobile viewport (393px wide)
- Outer padding reduces appropriately
- Content fits without excessive horizontal scroll
- The header is scrollable horizontally; Import button is reachable by scrolling
- Data Manager tables have a scrollable container

---

## US-MB-02: Access Controls via a Mobile-Optimised Header

**As an** IT portfolio manager on mobile,
**I want** a simplified header and bottom tab bar rather than the full desktop control bar,
**so that** the screen is not overwhelmed by controls.

**Acceptance Criteria:**
- Desktop header controls (colour mode, group mode, zoom, etc.) are hidden on mobile
- A mobile header with a settings icon is shown instead
- Tapping the settings icon opens a bottom sheet; tapping the backdrop or pressing Escape closes it
- A bottom tab bar at the bottom of the screen switches between views (Visualiser, Data Manager, Reports, History)
- The desktop layout is completely unchanged

---

## US-MB-03: Touch-Optimised Interaction on Mobile

**As an** IT portfolio manager on mobile,
**I want** the initiative bars to be touch-friendly,
**so that** I can tap to open details without accidentally triggering drag/resize.

**Acceptance Criteria:**
- Drag cursor is not shown on initiative bars on mobile
- Resize edge handles are not shown on mobile
- Panel form inputs are at least 44px tall for comfortable tapping
- Budget field has `inputmode="numeric"` for a number keyboard

---

## US-MB-04: View Portfolio as Asset Cards on Mobile

**As an** IT portfolio manager on mobile,
**I want** to see the portfolio as a list of asset cards instead of the timeline,
**so that** I can browse initiative details without horizontal scrolling.

**Acceptance Criteria:**
- On mobile viewports, the Visualiser tab renders a card-based layout (`MobileCardView`) instead of the timeline
- One card per asset, grouped by category
- Initiatives within each card are grouped into configurable buckets: Timeline, Quarter, Year, Programme, Strategy
- A bucket selector is available in the mobile settings sheet
- Tapping an initiative row within a card opens the InitiativePanel
- Conflict badges are shown on cards where conflicts exist
- `mobileBucketMode` setting persists to IndexedDB
- The desktop timeline layout is completely unchanged
- The card view filters initiatives so that only initiatives within the configured start date and months window are shown
- When all initiatives are hidden due to the date filter (but initiatives do exist), a distinct 'outside date range' empty state is shown rather than the generic 'no initiatives' message

---

## US-MB-05: Readable Rendering on Mobile

**As an** IT portfolio manager on mobile,
**I want** the interface to render cleanly without visual overflow,
**so that** the experience feels native rather than a squashed desktop view.

**Acceptance Criteria:**
- Asset name sidebar truncates long names with ellipsis (no overflow)
- Drag handle icons are hidden on mobile for category and asset rows
- Legend items wrap correctly so all programme/strategy names are visible
- Tab bar active state uses a border indicator for clear visual distinction

---

## US-MB-06: View Initiative Details in Mobile Card Rows

**As an** IT portfolio manager on mobile,
**I want** the display toggles (Descriptions, Budget, Relationships, Conflicts) to affect what is shown on mobile card rows,
**so that** I get the same control over information density as on the desktop timeline.

**Acceptance Criteria:**
- When the Descriptions toggle is on, each initiative row in the card view shows the initiative's description text
- When the Budget toggle is on, each initiative row shows the formatted budget (NZD)
- When the Relationships toggle is on, each initiative row shows related initiative names and dependency type
- When the Conflicts toggle is off, conflict badges are hidden from asset card headers
- All four toggles are accessible via the mobile settings sheet
