# User Stories — Reports

## US-RP-01: Navigate to a Report from a Home Screen

**As an** IT portfolio manager,
**I want** a Reports home screen that lists available report types,
**so that** I can navigate directly to the analysis I need without seeing all reports at once.

**Acceptance Criteria:**
- The Reports view shows a home screen with four selectable report cards: History, Budget, Initiatives & Dependencies, Capacity
- Clicking a card navigates into that full-width report
- A back button returns to the report selection home screen
- The "Reports" nav tab shows the correct active state

---

## US-RP-02: View an Initiatives & Dependencies Report

**As an** IT portfolio manager,
**I want** a written report that lists all initiatives and their dependencies,
**so that** I can share a document view with stakeholders who don't use the timeline.

**Acceptance Criteria:**
- The report is grouped by asset
- Each initiative lists its dependencies using perspective-aware language:
  - Blocked initiative (target of `blocks`): "Blocked: [initiative] can't start until [other] has finished."
  - Blocking initiative (source of `blocks`): "Blocking: [initiative] must finish before [other] can start."
  - Requiring initiative (source of `requires`): "Required: [initiative] requires [other] to start first."
  - Required initiative (target of `requires`): "Required by: [other] requires this to start first."
- No legacy "blocks X —" or "general connection" wording appears
- Milestone dependencies are included

---

## US-RP-03: View a Budget Summary Report

**As an** IT portfolio manager,
**I want** a budget breakdown across the portfolio,
**so that** I can see how spend is distributed by programme, strategy, and category.

**Acceptance Criteria:**
- A budget report section is visible in the Reports view
- Spend is broken down by programme, strategy, and asset category
- Chart totals match the sum of initiative budgets in the Data Manager

---

## US-RP-04: View a Capacity Report

**As an** IT portfolio manager,
**I want** to see a capacity report showing resource allocation over time,
**so that** I can identify overloaded resources before the schedule is locked.

**Acceptance Criteria:**
- The Capacity report shows allocation per resource across the timeline
- The report reflects the resources and assignments currently in the Data Manager

---

## US-RP-05: View a History Differences Report

**As an** IT portfolio manager,
**I want** to run a diff report between two versions directly from the Reports view,
**so that** I don't have to navigate to the Version Manager to understand what changed.

**Acceptance Criteria:**
- The "History Differences" report card opens the diff UI
- An empty state is shown when no saved versions exist
- A version selector appears after at least one version has been saved
- Running the diff shows inline results
- An error message is displayed if versions fail to load
