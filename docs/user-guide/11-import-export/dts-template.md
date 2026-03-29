# NZ Digital Target State Template

The NZ Digital Target State (DTS) template structures your IT portfolio against the GCDO reference architecture — the New Zealand government's target model for digital public infrastructure and shared capabilities.

## What the template includes

Selecting the DTS template on first load sets up:

**Six DTS layers** (asset categories):

| Layer | What it represents |
|-------|--------------------|
| Customer Layer | Citizen and business touchpoints |
| Channels | All-of-Government, agency, and non-government channels |
| Digital Public Infrastructure | 11 shared national capabilities (AI, identity, payments, etc.) |
| Integration | Data, API and AI Services Exchange |
| Agency, Platform & Infrastructure | Agency-specific platforms and infrastructure |
| Common Consolidated Platforms | Shared back-office systems (ITSM, FMIS, HRIS, EAM, Contracts) |

**20 pre-built assets** with DTS alias codes (DTS.DPI.01 – DTS.PLT.05), covering the 11 DPI components, 3 channel types, integration layer, and 5 common consolidated platform types. The Customer Layer also includes three reference touchpoints (Citizens & Residents, Businesses & Employers, Iwi & Community Organisations) so the full four-layer structure is visible from the start.

**Demo data** (optional) loads 14 initiatives across the three DTS adoption phases and back-office consolidation, 8 application lifecycle segments showing legacy systems transitioning to DPI equivalents, 5 milestones including GCDO Payments Platform GA and Cluster Platform Go-Live as external dependency events, and 5 pre-drawn dependency arrows showing the critical sequencing constraints of DTS adoption.

## When to use this template

Choose the DTS template if your agency wants to:

- Map its current investment portfolio to the GCDO target architecture
- Identify which DTS shared capabilities it is consuming, building, or yet to adopt
- Report portfolio progress against the Digital Target State to GCDO or cluster leads

## DTS-specific features

Several features in Scenia are only active in DTS and Mixed workspaces:

**DTS Adoption Status per asset** — each of the 20 DTS assets has an adoption status field (Not Started / Scoping / In Delivery / Adopted / Decommissioning Incumbent / Not Applicable). Set it in Data Manager → Assets. Enable the **DTS Adoption Status** toggle in the display menu to show coloured badges on the timeline.

**DTS Alignment Coverage report** — a grid of all 20 DTS assets arranged in their six layers, coloured by adoption status with initiative count and budget per asset. Available in the Reports section. See [DTS Alignment Report](../09-reports/dts-alignment-report.md).

**DTS Phase on initiatives** — each initiative can be tagged with its DTS adoption phase (Phase 1 / Phase 2 / Phase 3 / Back-Office / Not DTS). Use this to group the timeline by phase or to see spend broken down by phase in the Budget report.

**DTS Summary tab in Excel export** — when exporting from a DTS or Mixed workspace, the Excel workbook includes a DTS Summary sheet with one row per asset showing adoption status, initiative count, total budget, lead owner, and target adoption date.

## Using the GEANZ catalogue alongside DTS

If you want the full GEANZ technology catalogue browsable alongside the DTS structure, choose **Mixed** instead of DTS. The Mixed template gives you the six DTS layers with the GEANZ catalogue section below. In the Mixed template, GEANZ application area rows show a badge indicating the corresponding DTS alias code where a mapping exists, so you can see where your GEANZ applications sit in the DTS architecture without separate research.

## Starting without demo data

If you want the DTS structure but not the example initiatives and segments, select **Without demo data** when choosing the DTS template. You will get the six DTS layers and 20 pre-built assets ready to populate with your own work.

## Resetting or switching templates

To switch to a different template at any time:

1. Go to the **Data Manager** view.
2. Scroll to the bottom of any tab and click **Clear data and start again**.
3. The template picker reopens — choose a new template and select with or without demo data.

> **Note:** This permanently replaces all your current data.

---

*NZ Government Digital Target State © Crown copyright. Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Source: [GCDO, February 2026 (dns.govt.nz)](https://dns.govt.nz)*

---

- Previous: [GEANZ Catalogue](geanz-catalogue.md)
- Next: [PDF / SVG Export](pdf-svg-export.md)
