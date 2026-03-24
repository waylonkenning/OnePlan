# User Story 14: Enriched Demo Data with GEANZ Assets

## Story

As a new user loading Scenia for the first time,
I want to see a realistic NZ government portfolio pre-populated with GEANZ assets, initiatives, and lifecycle segments,
So that I can immediately understand the value of the GEANZ catalogue feature and the visualiser without having to configure anything.

## Acceptance Criteria

**AC1:** On first load, GEANZ asset swimlanes from at least 10 of the 17 TAP areas are immediately visible without any user interaction (no pre-populate clicks required).

**AC2:** Each pre-populated GEANZ area shows a "Remove all" button (`geanz-remove-btn-{alias}`) in the area header, and the area row (`geanz-area-row-{alias}`) is hidden.

**AC3:** TAP areas not included in the demo data (e.g. TAP.05, TAP.10, TAP.11, TAP.17) still render their collapsed area rows with pre-populate buttons.

**AC4:** At least one visible GEANZ asset has an initiative in the timeline (e.g. Authentication → MFA Modernisation).

**AC5:** At least one visible GEANZ asset has application lifecycle segments displayed.

## Scope

- Adds GEANZ assets to `demoAssets` using `alias`, `externalId`, and `categoryId: GEANZ_CATEGORY_ID`
- Adds `demoInitiatives` for each pre-populated GEANZ asset (minimum one per asset)
- Adds `demoApplicationSegments` for a representative subset of assets
- Adds `demoMilestones` for key GEANZ assets
- No changes to the existing banking demo assets or the GEANZ catalogue itself
- Context is a NZ government agency (consistent with GEANZ's purpose)

## TAP Areas to Pre-populate

| Area | Assets included |
|------|----------------|
| TAP.01 Corporate | FMIS, HR Management, ERP |
| TAP.02 Service Delivery | Case Management, CRM |
| TAP.03 Experience | Customer Portal, Web CMS |
| TAP.04 Data & Info Mgmt | Data Governance, Records Management |
| TAP.06 Integration | API Management, Enterprise Service Bus |
| TAP.07 IAM | Identity Governance, Authentication |
| TAP.08 Security | Network Security, SIEM |
| TAP.09 Orchestration | Business Process Management |
| TAP.12 ICT Management | ITSM, CMDB |
| TAP.13 Collaboration | Email, Video Services |
| TAP.14 Monitoring | System Monitoring, APM |
| TAP.15 Infrastructure & Cloud | IaaS, PaaS |
| TAP.16 Analytics & BI | Data Warehouse, BI Reporting |

TAP.05, TAP.10, TAP.11, and TAP.17 remain as unpopulated area rows in the demo.

## Files to Touch

- `src/demoData.ts` — add GEANZ assets, initiatives, segments, milestones
- `e2e/geanz-demo-data.spec.ts` — new E2E test file
