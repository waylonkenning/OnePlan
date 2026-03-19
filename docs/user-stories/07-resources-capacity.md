# User Stories — Resources & Capacity Planning

## US-RC-01: Manage a Resource Roster

**As an** IT portfolio manager,
**I want** to maintain a list of people and their roles in the Data Manager,
**so that** I can assign them to initiatives.

**Acceptance Criteria:**
- A "Resources" tab is present in the Data Manager
- Resources have Name and Role fields
- Resources can be added, edited inline, and deleted (with confirmation modal)

---

## US-RC-02: Assign Resources to an Initiative

**As an** IT portfolio manager,
**I want** to assign one or more resources to an initiative from the edit panel,
**so that** I can track who is doing what across the portfolio.

**Acceptance Criteria:**
- The InitiativePanel includes a resource assignment checklist populated from the Resources table
- Multiple resources can be assigned to a single initiative
- Assigned resource names appear on the initiative bar when the "Show Resources" toggle is enabled
- Owner initials badge on the bar derives from the linked owner resource record
- Assignment data is persisted to IndexedDB across reloads

---

## US-RC-03: View Resource Capacity Across the Timeline

**As an** IT portfolio manager,
**I want** to see how each resource is allocated over time in the Capacity report,
**so that** I can identify and resolve over-allocation before it becomes a problem.

**Acceptance Criteria:**
- The Capacity report shows allocation per resource across the timeline period
- Allocation reflects the resource assignments on all current initiatives
- The report updates when initiatives or resource assignments change
