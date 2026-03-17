# OnePlan Feature Backlog

Tasks to be worked on one by one, following the CLAUDE.md process (User Story → Test → Code → Full Suite → Docs → Commit).

---

## Visualiser — Dependency Arrows

- [x] **Arrow selection when arrows are adjacent** *(completed)*
  Arrows in the same routing corridor are automatically staggered 16px apart. When a click lands near multiple overlapping arrows, a disambiguation popover lists the relationships by name so the user can pick the correct one.

- [ ] **Default relationship type when drawing an arrow should be "Requires"**
  Currently, dragging vertically from one initiative to another creates a `blocks` relationship. The default should be `requires` instead.

- [ ] **Arrow z-index: arrows must always render above initiative bars**
  On hover, initiative bars currently obscure dependency arrows that pass over them. Arrows should always sit on top of initiative bars.

- [ ] **Arrow label tooltip on click**
  When a user clicks a dependency arrow label, flash a tooltip that states the full human-readable meaning of the relationship using initiative names — e.g. "Passkey Rollout must finish before SSO Consolidation can start" for a `blocks` relationship.

---

## Visualiser — Grouped Initiatives

- [ ] **Too much vertical padding inside a grouped initiative bar**
  Grouped initiative bars have excess vertical padding. Tighten the internal spacing so the bar height better matches its content.

- [ ] **Grouped initiative description: one bullet point per initiative name**
  Currently, initiative names in a collapsed group description are joined with " + ". Change the layout so each initiative name is on its own line, rendered as a bullet point (e.g. • Passkey Rollout).

---

## Panels & Modals

- [ ] **Edit Relationship modal: show full initiative names without truncation**
  The Source and Target initiative labels in the Edit Relationship modal are truncated with CSS `truncate`. Remove the truncation so the full name is always visible (wrap if needed).

- [ ] **Create Initiative modal: show related initiatives at the bottom**
  Add a "Related Initiatives" section at the bottom of the Create/Edit Initiative modal, listing any existing dependencies for that initiative. The modal body should scroll if needed, with Cancel / Delete / Save buttons fixed to the bottom.

---

## Header Display Settings

- [ ] **Replace Display popover with inline icon toggles in the header**
  The Display popover requires too many clicks to access common settings. Replace it with a row of icon buttons directly in the header — one per toggle (e.g. conflict detection, relationship lines, descriptions, budget). Each icon should show a descriptive tooltip on hover. Active/inactive state is shown via icon fill or colour.

---

## Browser Dialogs

- [x] **Replace all browser window.confirm dialogs with in-app modals** *(completed)*

---

## Reports Mode

- [ ] **Add a "Reports" mode alongside Visualiser and Data Manager**
  Create a third top-level navigation mode. The Reports view hosts read-only analytical reports generated from the current data.

- [ ] **Report: History Differences**
  Move the existing Version History difference report into the new Reports mode so it is accessible as a first-class report rather than buried in the history sidebar.

- [ ] **Report: Initiatives and their Dependencies**
  Generate a plain-language report per asset listing each initiative and its dependencies. Example output:
  > **Customer IAM (CIAM)**
  > - Passkey Rollout blocks SSO Consolidation — Passkey Rollout must finish before SSO Consolidation can start.
