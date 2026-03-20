# UX Observations

User feedback captured 2026-03-19. Raw reactions from real device usage — not yet triaged into tasks.

---

## iPad Pro — Header & Vertical Space

**Observation:** On an iPad Pro the menu/header bar wraps to three lines, consuming roughly 20% of vertical screen space before any roadmap content is visible.

**Additional 20% lost to:** the programme colour legend and the visual key explaining what dependency arrows and conflict indicators look like — both currently rendered inline in the header/toolbar area.

**Proposed solution:** Move the colour legend, milestone icon key, and dependency/conflict arrow key out of the header entirely and into a **floating legend box anchored to the bottom-right corner** of the visualiser. Requirements:

- Collapsible/minimisable so users can hide it when not needed (toggle button, e.g. a small "Legend" pill)
- When expanded, shows:
  - Programme colours (swatch + name for each programme)
  - Milestone icon types (info / warning / critical)
  - Dependency arrow styles (blocks / requires / related)
  - Conflict indicator graphic
  - **Current date and time** (so that exported PDFs and SVGs carry a timestamp)
- The box must be included in PDF and SVG exports — i.e. it should live inside the element that gets captured, not outside it
- Collapsed state should persist (localStorage or similar)

**Why the date/time matters:** When a PDF or SVG is generated and shared, recipients have no way to know when the snapshot was taken. Embedding the date/time in the legend solves this without adding clutter to the main canvas.

---

## Data Manager — Initiatives Table Header Overlap

**Observation:** In the Data Manager view, the "Progress" and "Owner" column headers overlap each other in the initiatives table — a rendering bug, likely a column width or overflow issue.

---

## Visualiser — Colour/Group Switcher Takes Too Much Header Space

**Observation:** The controls for switching how initiatives are coloured (by programme / strategy / status) and how they are grouped (by asset / programme / strategy) occupy too much horizontal space in the menu bar, contributing to the multi-line wrap problem on iPad and other narrow viewports.

**Proposed solution:** Replace the inline toggle buttons with a single compact in-canvas dropdown or popover (similar to the existing Display Settings popover pattern). Could be a small "View" or "Group / Colour" pill button that opens a small panel with both controls inside.

---

## Visualiser — Visualiser-Only Settings Leak into Other Views (Bug)

**Observation:** When switching from the Visualiser to the Data Manager or Reports view, certain settings that are only relevant to the visualiser remain visible in the header — e.g. the toggle for showing or hiding initiative descriptions. These controls have no effect in those views and should not be shown.

**Expected behaviour:** Header controls should be contextual — visualiser-only settings (description display, conflict detection, critical path, resource names, colour mode, group mode, zoom) should be hidden when the active view is Data Manager or Reports.

---

## Reports View — Replace Dump Layout with Report Selection Menu

**Observation:** The Reports view currently renders all four reports stacked on a single page, which feels haphazard and overwhelming — especially as each report grows in length.

**Proposed solution:** Introduce a reports home screen with four large, clearly labelled cards/buttons:

- **History Report** — version snapshots and change log
- **Budget Report** — spend breakdown by programme/asset
- **Initiatives & Dependencies Report** — full initiative list with dependency relationships
- **Capacity Report** — resource assignments and workload

**Behaviour:**

- Clicking a card navigates into that single report, full-width
- A back button / breadcrumb returns the user to the reports home screen
- Only one report is visible at a time — no scrolling past unrelated reports
- Cards could include a brief one-line description and an icon to aid scannability

---

## Features Modal — Image Quality and Card Sizing

**Observation:** Several feature cards in the Features modal have poor or missing screenshots, and the card layout doesn't adapt to whether there's a real image or just a placeholder icon.

**Specific issues:**

- **Safe & Secure Storage** — no dedicated screenshot, just an icon. Should be a smaller/compact card rather than a full-size image card.
- **Excel Import & Export** — same problem, just an icon. Should also be a smaller card.
- **Drag, Drop & Resize** and **Dependency Mapping** — appear to use the same screenshot. Each needs its own distinct image.
- **Conflict Detection** — screenshot does not show an actual conflict or conflict milestone indicator. Needs a screenshot with a visible conflict.
- **Critical Path Highlighting** — screenshot does not show a critical path being highlighted (expected: initiative bars and dependency arrows highlighted in a distinct colour). Needs a real example.
- **Colour by Status** — should show initiatives actually coloured by status (planned / active / done / cancelled), not the default programme colour mode.
- **Milestone Dependencies** — needs a screenshot showing a dependency arrow originating from a milestone, not a regular initiative.
- **Resources & Capacity** — needs a screenshot showing the capacity report or resource assignments in the panel.
- **Version History** — should show a real screenshot of the Version Manager panel with saved snapshots visible, not an icon.

**Proposed layout fix:** Introduce two card sizes — a full card (with screenshot) and a compact card (icon + title + description only, no image area). Cards that lack a real screenshot should automatically use the compact layout rather than showing an empty or generic image area.

---

## Data Manager — Table Tabs Overflow on Narrow Viewports

**Observation:** The tab strip used to switch between tables (Initiatives, Assets, Programmes, Strategies, Milestones, Dependencies, Categories, Resources) is now wide enough to exceed the viewport width, causing horizontal scrolling of the tab bar. Doesn't look good and is awkward on tablets.

**Proposed solutions (pick one or combine):**

- Wrap tabs to a second row when they don't fit (flex-wrap)
- Replace the tab strip with a compact dropdown/select on narrow viewports
- Use icon-only tabs with tooltips below a breakpoint to save horizontal space
- Group related tabs (e.g. "People" for Resources, "Structure" for Assets/Categories) to reduce tab count

---
