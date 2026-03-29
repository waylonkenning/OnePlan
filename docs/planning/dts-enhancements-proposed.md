# Proposed DTS Enhancements — Review Draft

> Based on the gap analysis in [dts-alignment-assessment.md](dts-alignment-assessment.md).
> Each proposal is written as a User Story ready to enter the development workflow once approved.
> Items are grouped by priority tier. Within each tier, the order reflects suggested implementation sequence.

---

## Tier 1 — High Priority (Complete the alignment story)

These two items are what turn Scenia from a DTS planning tool into a DTS alignment reporting tool. They depend on each other — the coverage report needs the adoption status field to be meaningful.

---

### US-19: DTS Adoption Status per Asset

**As an** agency planner,
**I want** to record the DTS adoption status for each of my 20 DTS assets,
**So that** I can clearly communicate where my agency stands against each DPI component and Common Consolidated Platform.

**Proposed status values:**
- Not Started
- Scoping
- In Delivery
- Adopted
- Decommissioning Incumbent
- Not Applicable

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | A "DTS Adoption Status" field is available on each asset row in the Data Manager Assets tab |
| AC2 | The field is a dropdown with the six values above |
| AC3 | The status is displayed as a coloured badge on each DTS asset row header on the timeline, controlled by a toggle in the visualiser display menu |
| AC4 | The toggle is off by default; when enabled, coloured badges appear on all DTS asset rows |
| AC5 | The status persists to IndexedDB and survives page reload |
| AC6 | The DTS template pre-populates sensible default statuses on the 20 assets (e.g. Phase 1 assets as "In Delivery", back-office as "Not Started") |
| AC7 | Non-DTS assets (e.g. GEANZ template) show no adoption status field — it only appears when the asset has a DTS alias code |
| AC8 | The toggle only appears in the visualiser menu when the workspace contains DTS assets |

---

### US-20: DTS Alignment Coverage Report

**As an** agency planner or enterprise architect,
**I want** a single-page report showing all 20 DTS assets coloured by their adoption status with initiative count and budget per asset,
**So that** I can answer "where does our agency stand against the DTS?" at a glance and share this with cluster leads or GCDO.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | A new "DTS Alignment" card appears in the Reports home screen when the workspace uses the DTS or Mixed template (i.e. has DTS alias codes on assets) |
| AC2 | The report renders a grid of all 20 DTS assets arranged in their 6 DTS layers |
| AC3 | Each asset tile is coloured by its DTS Adoption Status (from US-19): Not Started (grey), Scoping (yellow), In Delivery (blue), Adopted (green), Decommissioning Incumbent (orange), Not Applicable (light grey) |
| AC4 | Each asset tile shows the count of active/planned initiatives and the total budget allocated |
| AC5 | Clicking an asset tile navigates to the timeline filtered to that asset |
| AC6 | The report is included in the PDF/SVG export |
| AC7 | The report does not appear for non-DTS workspaces (GEANZ-only or blank) |
| AC8 | The report appears alongside the existing Maturity Heatmap as a separate report card — the heatmap (internal capability maturity) and the alignment report (DTS adoption progress) answer different questions and both remain available |

---

## Tier 2 — Medium Priority (Strengthen the planning layer)

These items improve how agencies plan and sequence their DTS journey within Scenia, and make the output more useful for GCDO/Treasury reporting.

---

### US-21: DTS Phase Field on Initiatives

**As an** agency planner,
**I want** to tag each initiative with its DTS adoption phase,
**So that** I can filter and group the timeline by phase and clearly show which delivery work belongs to which part of the DTS journey.

**Proposed phase values:**
- Phase 1 — Register & Expose
- Phase 2 — Integrate DPI
- Phase 3 — AI & Legacy Exit
- Back-Office Consolidation
- Not DTS

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | A "DTS Phase" dropdown field is available on each initiative in the initiative edit panel and Data Manager |
| AC2 | The timeline can be grouped by DTS Phase (added as an option alongside the existing "Group by Programme / Strategy / Asset" options) |
| AC3 | The budget report includes a breakdown by DTS Phase alongside the existing programme and strategy breakdowns |
| AC4 | The DTS template demo data pre-populates the correct phase on all 14 demo initiatives |
| AC5 | The field is optional and hidden for non-DTS workspaces (only shown when the workspace has DTS alias codes) |

**Open question for review:** Should "DTS Phase" appear for all workspaces or only DTS/Mixed? Keeping it DTS-specific avoids cluttering the UI for GEANZ and blank workspace users.

---

### US-22: Pre-drawn DTS Dependencies in Demo Data

**As a** new user exploring the DTS template,
**I want** the demo data to include dependency arrows showing the critical sequencing constraints of DTS adoption,
**So that** I can immediately see how Scenia's dependency and critical-path features work in the DTS context.

**Proposed dependencies to add to the demo:**

| From | To | Type | Rationale |
|---|---|---|---|
| Service Rules Digitalisation | Semantic Search Integration | Finish-to-Start | Rules Library registration must complete before Semantic Search can be populated |
| AI Governance Framework | AI-Assisted Service Routing | Finish-to-Start | Safeguard sign-off gates AI Platform Services production deployment |
| Digital Credential Adoption | Agency Portal Decommission | Finish-to-Start | Credential adoption must be live before the portal can be decommissioned |
| Content Migration to Headless CMS | Agency Portal Decommission | Finish-to-Start | Content must be registered before portal can be shut down |
| Notifications Consolidation | Agency Portal Decommission | Finish-to-Start | Notification migration must complete before portal retirement |

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | The five dependency relationships above are pre-drawn in the DTS demo data (with demo data enabled) |
| AC2 | Critical path highlighting works correctly across these dependencies |
| AC3 | The Dependencies tab in the Data Manager shows all five relationships |
| AC4 | The Initiatives & Dependencies report includes these relationships |
| AC5 | No dependency arrows are drawn when the template is loaded without demo data |

---

### US-23: DTS Summary Tab in Excel Export

**As an** agency planner preparing a submission for GCDO or Treasury,
**I want** the Excel export to include a DTS Summary tab,
**So that** I have a ready-made structured artefact showing my agency's alignment status across all 20 DTS assets without needing to manipulate the raw data export.

**Proposed DTS Summary tab columns:**
DTS Layer | Asset Code | Asset Name | Adoption Status | Active Initiatives | Total Budget ($) | Lead Owner | Target Adoption Date

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | When exporting to Excel from a DTS or Mixed workspace, the export includes an additional "DTS Summary" tab |
| AC2 | The tab has one row per DTS asset (20 rows), with the columns above |
| AC3 | Adoption Status is drawn from US-19's DTS Adoption Status field |
| AC4 | Active Initiatives is the count of non-retired initiatives linked to that asset |
| AC5 | Total Budget sums the budget of all initiatives linked to that asset |
| AC6 | Lead Owner is the owner of the largest-budget initiative on that asset (or blank if none) |
| AC7 | Target Adoption Date is the end date of the latest active initiative on that asset |
| AC8 | The tab does not appear in Excel exports from non-DTS workspaces |

---

## Tier 3 — Lower Priority (Polish and completeness)

Smaller improvements that round out the DTS experience. Recommend parking these until Tier 1 and 2 are delivered.

---

### US-24: Customer Layer Canonical Touchpoints

**As an** agency planner using the DTS template,
**I want** the Customer Layer to have a small set of reference assets representing the types of customers agencies serve,
**So that** the top layer of the DTS architecture is not blank and the full four-layer structure is visible.

**Proposed assets to add to dtsCatalogue.ts:**

| ID | Name | Alias |
|---|---|---|
| dts-cust-01 | Citizens & Residents | DTS.CUST.01 |
| dts-cust-02 | Businesses & Employers | DTS.CUST.02 |
| dts-cust-03 | Iwi & Community Organisations | DTS.CUST.03 |

These would be read-only reference assets — visible on the timeline but not intended to carry initiatives. Consideration: they may create confusion if planners try to attach initiatives to them. An alternative is to add a note to the category label rather than adding assets.

**Open question for review:** Add reference assets, or add a descriptive note to the Customer Layer category header instead?

---

### US-25: DTS Cluster Field in Workspace Settings

**As an** agency planner,
**I want** to record my agency's cluster name in the workspace settings,
**So that** PDF exports and the Excel DTS Summary tab are labelled with the correct cluster context, making them legible to cluster leads reviewing multiple agency plans.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | A "Cluster" text field is available in the workspace/timeline settings panel |
| AC2 | The cluster name appears in the header of PDF/SVG exports |
| AC3 | The cluster name appears in the DTS Summary Excel tab (US-23) |
| AC4 | The field is optional and blank by default |

---

### US-26: GEANZ-to-DTS Cross-Mapping Tooltips

**As an** agency planner using the Mixed template,
**I want** to see which DTS component a GEANZ application area maps to,
**So that** I can understand where my GEANZ applications sit in the DTS architecture without having to research this separately.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC1 | GEANZ application area rows in the Mixed template show a tooltip or badge indicating the corresponding DTS asset alias code (where a mapping exists) |
| AC2 | Mappings are defined in a lookup table (e.g. GEANZ "Identity & Access Management" → DTS.DPI.01) |
| AC3 | The mapping is informational only — it does not affect sorting, filtering, or data structure |
| AC4 | GEANZ areas with no clear DTS mapping show no badge |

---

## Summary

| # | Title | Priority | Dependencies |
|---|---|---|---|
| US-19 | DTS Adoption Status per Asset | 🔴 High | None |
| US-20 | DTS Alignment Coverage Report | 🔴 High | US-19 |
| US-21 | DTS Phase Field on Initiatives | 🟡 Medium | None |
| US-22 | Pre-drawn DTS Dependencies in Demo | 🟡 Medium | None |
| US-23 | DTS Summary Tab in Excel Export | 🟡 Medium | US-19 |
| US-24 | Customer Layer Canonical Touchpoints | 🟢 Lower | None |
| US-25 | DTS Cluster Field in Workspace Settings | 🟢 Lower | US-23 |
| US-26 | GEANZ-to-DTS Cross-Mapping Tooltips | 🟢 Lower | None |

**Suggested delivery order:** US-19 → US-20 → US-21 + US-22 (parallel) → US-23 → US-24 + US-25 + US-26 (parallel, if prioritised).
