# Scenia — DTS Alignment Assessment

> **Question:** Can Scenia be used by NZ government agencies as an easy way to plan for and communicate alignment to the NZ Digital Target State?
>
> **Source:** [dns.govt.nz — Digital Target State](https://dns.govt.nz/digital-government/digitising-government-programme-dgp/digital-target-state) and the [NZ Government Digital Target State, February 2026 (PDF)](https://dns.govt.nz/assets/Digital-government/Digitisation-Government-Programme/NZ-Goverment-Digital-Target-State-February-2026.pdf)

---

## 1. What DTS Alignment Actually Requires of Agencies

The dns.govt.nz page is explicit: *"Government agencies must align to the Digital Target State."* In practice, alignment means five things:

**A. Architecture conformance.** Agencies must organise their technology investments against the four-layer DTS model: Customer, DPI, Integration, and Agency/Platform. The 11 DPI components and 5 Common Consolidated Platforms are the canonical shared capabilities agencies are expected to adopt — and retire their own equivalents of.

**B. A phased adoption journey.** The architecture implies a concrete delivery sequence: Phase 1 (register and expose), Phase 2 (integrate DPI capabilities), Phase 3 (AI adoption and legacy exit), with back-office consolidation running in parallel.

**C. Cluster participation.** Agencies join clusters and migrate to cluster-shared platforms. Cluster governance is an external dependency that sets hard constraints on agency planning.

**D. External dependency management.** Agency roadmaps are gated by GCDO delivery — the RealMe+ onboarding window, Payments Platform GA, cluster platform go-live. Agencies must plan around these, not assume they control them.

**E. Progress communication.** There is no prescribed GCDO reporting template or cadence on the page (the only stated mechanism is email to gcdo@dia.govt.nz). In practice, agencies will need to demonstrate alignment through Treasury investment submissions, cluster governance, and planning cycles. The absence of a formal reporting mechanism is itself a gap in GCDO's guidance — but the expectation still exists.

---

## 2. What Scenia Currently Provides

### The DTS template
Selecting "NZ Digital Target State" on first load gives the agency:
- **6 DTS layers** as asset categories (Customer Layer, Channels, Digital Public Infrastructure, Integration, Agency Platform & Infrastructure, Common Consolidated Platforms)
- **20 pre-built assets** with canonical DTS alias codes (DTS.CH.01–03, DTS.DPI.01–11, DTS.INT.01, DTS.PLT.01–05), sourced directly from the February 2026 GCDO document and correctly attributed under CC BY 4.0

### Demo data
The DTS template with demo data loads:
- **14 initiatives** across Phase 1 (catalogue registration, rules digitalisation, data dictionary alignment, core data API), Phase 2 (notifications consolidation, headless CMS, digital credential adoption, payment flows migration), Phase 3 (AI governance, semantic search, AI-assisted routing, portal decommission), and back-office (ITSM and HRIS consolidation)
- **5 milestones** — including GCDO Payments Platform GA and Cluster Platform Go-Live as critical external dependencies
- **14 application lifecycle segments** showing legacy systems transitioning from In Production through Sunset as DPI equivalents come online — on Identity, Payments, Notifications, the agency portal, ITSM, and HRIS
- **4 DTS-specific programmes** and **5 DTS-specific strategies**
- Budgets ranging from $120K (catalogue registration) to $4.2M (payments migration)

### Core app capabilities relevant to DTS
| Capability | Relevance to DTS |
|---|---|
| Timeline view | Visualises all initiatives against the 20 DTS assets across a 3-year horizon; colouring by programme, strategy, or status |
| Budget report | Breaks down spend by DTS layer — shows investment in DPI Integration vs. Channel Transformation vs. Back-Office |
| Maturity heatmap | Rates each of the 20 DTS assets on a 1–5 scale; shows which capabilities are underdeveloped |
| Initiative & dependency report | Lists all initiatives with dependency chains; relevant for modelling DTS adoption sequencing |
| Version history | Named snapshots persisted across sessions; History Diff compares two planning-cycle versions |
| Excel and PDF export | Exports portfolio data and timeline canvas for sharing and submission |
| Mixed template | DTS six-layer structure with the GEANZ catalogue browsable beneath it — adds agency-specific application detail |

---

## 3. Where Scenia Meets the Goal ✅

**The canonical DTS structure is correct and ready to use.** The 6 layers, 20 assets, and alias codes match the GCDO's own document. An agency does not have to interpret or recreate the architecture — it is there on day one.

**The phased adoption journey is built into the demo data.** The 14 demo initiatives are organised across the three phases and back-office consolidation, in the same sequence the DTS architecture implies. An agency can load the template, replace demo initiatives with their real delivery items, and have a credible DTS-aligned roadmap immediately.

**External gating dependencies are modelled as milestones.** The GCDO Payments Platform GA and Cluster Platform Go-Live milestones directly represent the real planning constraints agencies face. This is a meaningful differentiator — most portfolio tools don't model external dependency events.

**The lifecycle segments tell the transition story.** Seeing a legacy system's "In Production" segment give way to "Sunset" as the DPI-enabled replacement appears is the central narrative of DTS adoption. Scenia makes this visually legible in a way no spreadsheet can.

**The budget report answers "how much are we investing in DTS alignment?"** Breaking spend by asset category gives an immediate view of total investment per DTS layer — directly relevant to Treasury and GCDO conversations about DTS investment.

**The maturity heatmap gives a status snapshot.** Rating all 20 DTS assets against a maturity scale and seeing them colour-coded is the closest thing Scenia currently has to an alignment summary view.

**Version history supports planning-cycle governance.** Saving snapshots at each planning cycle and comparing via the History Diff report is exactly the kind of change-tracking a steering committee or GCDO would expect.

---

## 4. Where Scenia Falls Short ❌

### 4.1 No DTS adoption status per asset
There is no structured field for "what is this agency's DTS adoption status for this DPI component?" — e.g. Not Started / In Delivery / Adopted / Decommissioning Incumbent. An agency needs to be able to answer this question clearly for each of the 20 DTS assets to report alignment to GCDO. Today it can be inferred from the timeline, but not stated.

### 4.2 No DTS coverage view
There is no report that shows, at a glance, which of the 20 DTS assets have active initiatives, which are adopted, and which have no investment at all. A grid of the 20 assets coloured green/amber/red by alignment status would be the single most useful DTS-specific output Scenia could produce. The maturity heatmap is the closest equivalent, but it answers "how mature are we?" not "are we aligned?"

### 4.3 No DTS Phase field on initiatives
Initiatives have programme and strategy tags, but there is no "DTS Phase" field (Phase 1 / Phase 2 / Phase 3 / Back-Office / Not DTS). Agencies cannot filter or report the timeline by DTS adoption phase — a natural question when presenting to a cluster lead or GCDO.

### 4.4 The maturity heatmap answers the wrong DTS question
The 5-level maturity scale (Emergent to Optimised) measures internal capability maturity. For DTS, the relevant question is not "how mature is your identity platform?" but "have you adopted RealMe+ at all?" These are different questions. The heatmap is useful but not sufficient for DTS alignment reporting.

### 4.5 Export is portfolio data, not a DTS alignment report
Excel export and PDF export give the full initiative list and the timeline canvas. Neither produces something shaped for GCDO consumption — e.g. a one-page summary of which DPI components are adopted, which are in flight, and what total investment is allocated to DTS delivery. Agencies must manipulate the export data manually to produce that artefact.

### 4.6 No initiative-level DTS sequencing dependencies in the demo
The demo initiative descriptions mention sequencing (e.g. "Dependent on Rules Library registration being complete"), but there are no dependency arrows drawn between these initiatives on the timeline. The critical path through rules digitalisation → semantic search, and AI governance → AI Platform Services, is not visible. This means the dependency and critical-path features of the app are not demonstrated in the DTS context.

### 4.7 All data is local — no sharing or submission
Everything lives in IndexedDB in one browser. There is no way to share a DTS alignment plan with a cluster lead, submit it to GCDO, or collaborate across an agency team without exporting manually. For a tool positioned to support GCDO reporting, this is real friction.

### 4.8 The Customer Layer has no assets
The Customer Layer category is present but empty. This is architecturally correct — the customer layer is not itself a set of agency-owned systems — but a blank category at the top of the timeline may confuse planners who expect to place something there.

---

## 5. Overall Verdict

**Scenia is a strong foundation but not yet a complete DTS alignment tool.**

It has the right structure (correct taxonomy, correct attribution, phased demo data, lifecycle segments, external dependency milestones), and it already does things no generic portfolio tool can do in the DTS context — particularly the lifecycle transition story and the budget-by-DTS-layer report.

What it lacks is the layer that turns portfolio data into an *alignment statement*: a per-asset adoption status field, a DTS coverage report, a DTS phase label on initiatives, and a structured export shaped for GCDO reporting. Without these, an agency using Scenia still has to do significant manual work to answer the fundamental question: *"Where does our agency stand against the DTS?"*

The gap is not large — it is one new field, one new report, and one new export tab. But it is the gap between a tool that helps agencies plan *within* the DTS framework and a tool that helps them *report on* their DTS alignment.

---

## 6. Prioritised Opportunities

| Priority | Opportunity | What it unlocks |
|---|---|---|
| 🔴 High | **DTS Adoption Status field per asset** — dropdown: Not Started / Scoping / In Delivery / Adopted / Decommissioning Incumbent / Not Applicable | Directly answers GCDO's alignment question per DPI component |
| 🔴 High | **DTS Alignment Coverage report** — grid of all 20 DTS assets coloured by adoption status, with initiative count and budget per asset | The single most useful output for GCDO/cluster reporting |
| 🟡 Medium | **DTS Phase field on initiatives** — Phase 1 / Phase 2 / Phase 3 / Back-Office / Not DTS | Enables filter/group by phase on the timeline and in reports |
| 🟡 Medium | **Pre-drawn initiative dependencies in the demo** — connect rules digitalisation → semantic search, AI governance → AI routing, portal initiatives | Demonstrates the critical-path feature in DTS language |
| 🟡 Medium | **DTS Summary tab in Excel export** — one row per DTS asset: adoption status, active initiatives, total budget, owner, target date | Ready-made artefact for GCDO/Treasury submission |
| 🟢 Lower | **DTS Cluster field in workspace settings** — labels exports and reports with the agency's cluster | Makes exported artefacts legible to cluster leads |
| 🟢 Lower | **Customer Layer canonical touchpoints** — 3–4 reference assets (Citizens & Residents, Businesses & Employers, etc.) | Completes the architecture diagram, reduces planner confusion |
| 🟢 Lower | **GEANZ-to-DTS cross-mapping tooltips** — surface which DTS component a GEANZ application type maps to | Reduces interpretation effort for Mixed template users |

---

*Assessment based on: [dns.govt.nz — Digital Target State](https://dns.govt.nz/digital-government/digitising-government-programme-dgp/digital-target-state) and codebase review, March 2026.*
