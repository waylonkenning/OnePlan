# User Stories — Display Settings & Visualisation Modes

## US-DS-01: Colour Initiatives by Programme, Strategy, or Progress

**As an** IT portfolio manager,
**I want** to choose how initiative bars are coloured,
**so that** I can surface the dimension most relevant to my current analysis.

**Acceptance Criteria:**
- A View popover in the header offers five colour modes: By Programme, By Strategy, By Progress, By Status (RAG), By DTS Phase
- Selecting "By Programme" colours bars by their assigned programme
- Selecting "By Strategy" colours bars by their assigned strategy
- Selecting "By Progress" colours bars by their status value (Planned / Active / Done / Cancelled)
- Selecting "By Status" colours bars by their RAG status (Green / Amber / Red); unset bars default to neutral grey
- Selecting "By DTS Phase" colours bars by their DTS adoption phase; only meaningful in DTS and Mixed workspaces
- The floating legend updates to show the correct swatches and labels for the active mode
- The selected colour mode persists across page reloads

---

## US-DS-02: Group Initiatives by Programme or Strategy

**As an** IT portfolio manager,
**I want** to regroup the timeline rows by programme or strategy instead of by asset,
**so that** I can view the portfolio from a different organisational perspective.

**Acceptance Criteria:**
- A View popover offers four grouping modes: By Asset (default), By Programme, By Strategy, By DTS Phase
- Switching grouping re-renders swimlane rows with the appropriate labels
- Initiative bars in all grouping modes show the same information: name, subtitle, description, budget, owner badge
- By DTS Phase grouping is only meaningful in DTS and Mixed workspaces
- The selected grouping mode persists across page reloads

---

## US-DS-03: Toggle Inline Display Options

**As an** IT portfolio manager,
**I want** to toggle what detail is shown on initiative bars without opening a settings panel,
**so that** I can quickly reduce or add clutter on the canvas.

**Acceptance Criteria:**
- Four icon toggle buttons in the header control: conflict detection, dependency lines, descriptions, budget display
- Each button has an `aria-label` and `aria-pressed` attribute reflecting its current state
- Budget toggle cycles between off / label mode / bar-height mode
- Changes take immediate effect on the canvas

---

## US-DS-04: View a Floating Legend

**As an** IT portfolio manager,
**I want** a collapsible legend anchored to the timeline canvas,
**so that** I can always refer to colour meanings without the legend taking up header space.

**Acceptance Criteria:**
- A legend box is anchored to the bottom-right of the visualiser canvas
- It shows: programme/strategy colour swatches, milestone icon types (info/warning/critical), dependency arrow styles (blocks/requires/related), conflict indicator
- The legend can be collapsed and expanded
- Collapsed/expanded state persists across page reloads

---

## US-DS-05: Resize the Sidebar Column

**As an** IT portfolio manager,
**I want** to drag the boundary between the asset name sidebar and the timeline content area to resize it,
**so that** I can see more of long asset names or more of the timeline.

**Acceptance Criteria:**
- Dragging the boundary between the sidebar and content columns resizes both
- Resized column widths are persisted across page reloads

---

## US-DS-07: Colour Initiatives by RAG Status

**As an** IT portfolio manager,
**I want** to assign a RAG (Red / Amber / Green) status to each initiative and colour the timeline by it,
**so that** I can instantly see the health of every initiative at a glance.

**Acceptance Criteria:**
- A `ragStatus` field (Green / Amber / Red) is available in the InitiativePanel
- The same field is available in the Data Manager initiatives table
- The `ragStatus` value persists to IndexedDB across reloads
- The View popover offers a fourth colour mode: "By Status"
- Selecting "By Status" colours initiative bars: Green → green, Amber → amber, Red → red; initiatives with no `ragStatus` set default to a neutral grey
- The floating legend updates to show Green, Amber, Red swatches and labels when "By Status" is active
- The selected colour mode persists across page reloads

---

## US-DS-06: Choose What to Display on the Timeline

**As an** IT portfolio manager,
**I want** to choose whether the timeline shows initiatives, application lifecycle segments, or both,
**so that** I can focus the canvas on the layer most relevant to my current task.

**Acceptance Criteria:**
- A display mode picker in the header offers three options: Initiatives Only, Applications Only, Both
- Selecting "Initiatives Only" hides all application swimlanes and segments
- Selecting "Applications Only" hides all initiative bars (but keeps asset/category labels)
- Selecting "Both" shows initiatives and application swimlanes together (the default)
- The selected display mode persists across page reloads
- In "Applications Only" mode with Empty Rows set to "Show" (default), all asset rows are visible even if an asset has no applications configured
- In "Applications Only" mode with Empty Rows set to "Hide", asset rows with no applications are not rendered
- In "Both" mode with Empty Rows set to "Hide", asset rows with neither initiatives nor applications are hidden; assets with applications but no initiatives remain visible

---

## US-DS-08: Colour Initiatives by DTS Phase

**As an** IT portfolio manager working within a DTS or Mixed workspace,
**I want** to colour initiative bars by their DTS adoption phase,
**so that** I can immediately see which phase of the Digital Target State each initiative is driving.

**Acceptance Criteria:**
- The View popover offers a fifth colour mode: "By DTS Phase", available only in DTS and Mixed workspaces
- Each DTS Phase value is assigned a distinct colour: Phase 1 – Register & Expose, Phase 2 – Integrate DPI, Phase 3 – AI & Legacy Exit, Back-Office Consolidation, Not DTS
- Initiatives with no DTS Phase set appear in neutral grey
- The floating legend updates to show the DTS Phase swatches and labels when this mode is active
- The selected colour mode persists across page reloads
