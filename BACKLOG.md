# OnePlan Feature Backlog

Tasks to be worked on one by one, following the CLAUDE.md process (User Story → Test → Code → Full Suite → Docs → Commit).

---

## Visualiser — Dependency Arrows

- [x] **Arrow selection when arrows are adjacent** *(completed)*
  Arrows in the same routing corridor are automatically staggered 16px apart. When a click lands near multiple overlapping arrows, a disambiguation popover lists the relationships by name so the user can pick the correct one.

- [x] **Default relationship type when drawing an arrow should be "Requires"** *(completed)*
  Dragging vertically from one initiative to another now creates a `requires` relationship by default.

- [x] **Arrow z-index: arrows must always render above initiative bars** *(completed)*
  The dependency SVG is now at z-[25], above the hover:z-20 applied to initiative bars.

- [x] **Arrow label tooltip on click** *(completed)*
  Clicking the dependency label pill shows a fixed tooltip with the full sentence (e.g. "Passkey Rollout must finish before SSO Consolidation can start"). Auto-dismisses after 3 seconds or on click. Does not open the edit panel.

---

## Visualiser — Grouped Initiatives

- [x] **Too much vertical padding inside a grouped initiative bar** *(completed)*
  Grouped initiative bars have excess vertical padding. Tightened the internal spacing (`py-0.5`) so the bar height better matches its content.

- [x] **Grouped initiative description: one bullet point per initiative name** *(completed)*
  Initiative names in a collapsed group description are now each on their own line as bullet points (e.g. • Passkey Rollout), replacing the old " + " separator.

---

## Panels & Modals

- [x] **Edit Relationship modal: show full initiative names without truncation** *(completed)*
  Removed `truncate` from the Source and Target labels in `DependencyPanel`. Names now use `break-words` so long names wrap rather than being cut off.

- [x] **Create Initiative modal: show related initiatives at the bottom** *(completed)*
  Added a "Related Initiatives" section at the bottom of the Initiative panel, listing each dependency with a directional label (e.g. "Blocks", "Required by"). Hidden when no dependencies exist. Body already scrolls; footer is already fixed.

---

## Header Display Settings

- [x] **Replace Display popover with inline icon toggles in the header** *(completed)*
  Replaced the Display popover with four inline icon toggle buttons: Conflict Detection (AlertTriangle), Relationships (GitBranch), Descriptions (AlignLeft), Budget (DollarSign). Budget cycles off → label → bar-height. A small "⋯" overflow button retains Snap to Month and Empty Rows. Active state shown via blue colour; inactive via grey.

---

## Browser Dialogs

- [x] **Replace all browser window.confirm dialogs with in-app modals** *(completed)*

---

## Reports Mode

- [x] **Add a "Reports" mode alongside Visualiser and Data Manager** *(completed)*
  Added a third navigation tab (BarChart2 icon). Clicking Reports shows a `ReportsView` scaffold. Nav button highlights when active; switching away and back retains the view.

- [ ] **Report: History Differences**
  Move the existing Version History difference report into the new Reports mode so it is accessible as a first-class report rather than buried in the history sidebar.

- [ ] **Report: Initiatives and their Dependencies**
  Generate a plain-language report per asset listing each initiative and its dependencies. Example output:
  > **Customer IAM (CIAM)**
  > - Passkey Rollout blocks SSO Consolidation — Passkey Rollout must finish before SSO Consolidation can start.
