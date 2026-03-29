# DTS Demo Data Research — Realistic Initiatives & Applications

> **Purpose:** Inform a richer set of demo data for the NZ Digital Target State (DTS) template in Scenia. The current demo data uses generic initiative names. This document proposes realistic alternatives based on a review of the [NZ Government Digital Target State (February 2026)](https://dns.govt.nz/assets/Digital-government/Digitisation-Government-Programme/NZ-Goverment-Digital-Target-State-February-2026.pdf).
>
> Initiatives and applications are written to represent **any large NZ government agency** — no specific agency is assumed. Names avoid sector-specific references (no "benefits", "tax", "health") so the demo reads as plausible for MBIE, DIA, MSD, IRD, MoH, or similar.

---

## 1. What the DTS Document Actually Says

The DTS document describes four layers (Customer, DPI, Integration, Agency/Platform) and eleven DPI components. Each component implies a concrete onboarding journey for agencies. There are no specific delivery dates in the document — it is an architectural target, not a roadmap. Demo initiatives should reflect the *kind* of work agencies do to adopt DTS, not a prescriptive schedule.

The document explicitly names three existing agency channels that will eventually be phased out as DPI matures: **MyIR** (IRD), **MyMSD** (MSD), and **MyACC** (ACC). The most compelling demo narrative is an agency actively migrating from a legacy self-service portal toward DPI-enabled delivery via the Govt.nz App.

---

## 2. The Adoption Journey (Three Phases)

The architecture implies a natural staging that applies to any agency:

### Phase 1 — Register and Expose (Year 1)
Make the agency's services, data, and rules visible to the DTS layer.

- Register services in the **Data & Services Catalogue**
- Encode service delivery rules in the **Rules Library** (machine-readable)
- Align data schemas to the **Data Dictionary**
- Build APIs to the **Data & AI Services Exchange**

### Phase 2 — Integrate DPI Capabilities (Years 1–2)
Replace agency-built versions of common capabilities with DPI equivalents.

- Migrate payment flows to **Payments Management**
- Plug notification events into the **Notifications & Messaging System**
- Issue credentials via **Identity & Credential Services**; accept digital wallet credentials
- Register content with the **Headless CMS**

### Phase 3 — Consume AI and Phase Out Legacy (Years 2–3+)
Shift to AI-enabled delivery and decommission legacy customer channels.

- Consume **AI Platform Services** (LLMs/SLMs) via the AI Services Exchange
- Route AI requests through the **AI Broker / Gateway**
- Apply **Data & AI Safeguard** controls to all AI use
- Decommission the legacy self-service portal as customers migrate to the Govt.nz App
- Consolidate HRIS, FMIS, ITSM, EAM, Contracts Management to the **Cluster Common Consolidated Platforms**

---

## 3. Proposed Demo Initiatives

Each maps to a DTS asset. Names are neutral enough to apply across agencies.

### Phase 1 — Register and Expose

| Initiative | DTS Asset | Description | Notes |
|---|---|---|---|
| **Service Rules Digitalisation** | Rules Library | Encode agency service delivery rules in machine-readable format and register them in the DTS Rules Library, enabling DPI-orchestrated service decisions without real-time agency involvement. | High complexity. Rules may have legal status — legal review required. |
| **Public Services Catalogue Registration** | Data & Services Catalogue | Register the agency's publicly-facing services in the All-of-Government Data & Services Catalogue as the foundational step for DPI orchestration. | Early win — prerequisite for all subsequent DPI integration. |
| **Data Dictionary Alignment Programme** | Data Dictionary | Audit and remap core agency data elements (identity, entitlements, contact, payment) against the DTS Data Dictionary. Publish aligned schemas to the Services Exchange. | Data quality programme. Multi-year tail for large agencies. |
| **Core Data API — Services Exchange** | Data & AI Services Exchange | Expose the agency's core customer data service as a consented API via the Data & AI Services Exchange, enabling agency-to-agency data sharing with customer consent at point of service. | Removes need for bilateral data sharing agreements with other agencies. |

### Phase 2 — Integrate DPI Capabilities

| Initiative | DTS Asset | Description | Notes |
|---|---|---|---|
| **Payment Flows Migration to AoG Platform** | Payments Management | Migrate agency payment disbursements from the legacy payment engine to the All-of-Government Payments Management platform. Phased by payment type. | High risk — requires Treasury engagement. External dependency on platform readiness. |
| **Notifications Consolidation** | Notifications & Messaging System | Decommission agency-owned notification pathways (SMS, email, in-portal inbox) and migrate all customer-facing notifications to the DPI Notifications & Messaging System, preserving customer preferences from the Govt.nz App. | Significant change management. Multiple internal teams affected. |
| **Digital Credential Adoption** | Identity & Credential Services | Enable the agency to issue credentials to customers' digital wallets and accept RealMe+ wallet credentials as proof of identity for service access, replacing username/password login on the agency portal. | Dependency on GCDO's credential issuance platform reaching production. |
| **Agency Content — Headless CMS Registration** | Headless Content Management System | Register the agency's authoritative content (policy summaries, eligibility guides, forms metadata) with the DPI Headless CMS, making it available to the Govt.nz App without the agency maintaining a separate web content stack. | Aligns with eventual agency portal decommission. |

### Phase 3 — AI Adoption and Legacy Exit

| Initiative | DTS Asset | Description | Notes |
|---|---|---|---|
| **Agency Portal Decommission** | All-of-Government Channels (Govt.nz App) | Migrate authenticated customer self-service from the agency's legacy portal to the All-of-Government Govt.nz App service cluster. Decommission the legacy portal once customer adoption reaches target threshold. | Flagship initiative. Politically visible. Multi-year. |
| **AI-Assisted Service Routing** | AI Platform Services / AI Broker | Integrate the agency's case management system with DPI AI Platform Services (LLM/SLM) via the AI Services Exchange to classify incoming requests and route to the appropriate service path. Governed by the Data & AI Safeguard framework. | Requires Data & AI Safeguard sign-off before production deployment. |
| **Semantic Search Integration** | Semantic Search | Contribute agency service definitions and rules to the DPI Semantic Search layer, enabling the Govt.nz App to surface relevant agency services to customers based on life event context rather than requiring customers to know what to apply for. | Dependent on Rules Library registration being complete. |
| **AI Governance Framework** | Data & AI Safeguard | Implement the DTS Data & AI Safeguard policy and control framework across all agency AI use cases. Establish an internal AI governance register aligned to central standards. | Precondition for AI Broker and AI Platform Services adoption. |

### Back-Office Consolidation

| Initiative | DTS Asset | Description | Notes |
|---|---|---|---|
| **HRIS Migration to Cluster Platform** | Common Consolidated Platforms (HRIS) | Migrate the agency's HR system to the Cluster HRIS Common Consolidated Platform, decommissioning the standalone instance. | Cluster dependency — requires cluster governance agreement before starting. |
| **ITSM Platform Consolidation** | Common Consolidated Platforms (ITSM) | Migrate IT service management to the cluster-shared ITSM platform. Decommissions the standalone instance and consolidates operations. | Quicker win than HRIS or FMIS. Good early candidate. |

---

## 4. Proposed Demo Applications (Lifecycle Segments)

Generic names that read as plausible for any large NZ government agency.

| Application | Asset | Lifecycle Story |
|---|---|---|
| **Legacy Payments Engine** | Payments Management | Core payments system. Currently in Production. Moving to Sunset as payment flows migrate to AoG Payments Management. |
| **Agency Self-Service Portal** | All-of-Government Channels | Currently in Production. Planned for Sunset once Govt.nz App customer adoption reaches target threshold. Central decommission story. |
| **Agency Notification Service** | Notifications & Messaging System | Currently in Production. Transitioning to DPI Notifications — show Production → Sunset alongside the DPI component going live. |
| **Digital Credential Integration** | Identity & Credential Services | Currently Planned — represents the incoming RealMe+ integration. Moves to Production in Phase 2. |
| **Case Management System** | Agency, Platform & Infrastructure | Core case management. Currently Production. API exposure to the Services Exchange planned. |
| **AI Routing Service** | AI Platform Services | New — currently Planned, moving to Production. Represents the agency's first production AI use case. |
| **HRIS (On-Premise)** | Common Consolidated Platforms (HRIS) | Currently Production. Moving to Sunset as the cluster HRIS migration completes. |
| **Reporting & Analytics Platform** | Agency, Platform & Infrastructure | Currently Production. Under review as AI Platform Services and the Services Exchange reduce the need for bespoke agency reporting. |

---

## 5. Milestones Worth Including

| Milestone | Type | Notes |
|---|---|---|
| **Cabinet Digital Mandate** | Info | Policy trigger — government direction to adopt DTS capabilities by a target date |
| **GCDO Payments Platform GA** | Critical | External dependency — AoG Payments Management must be production-ready before agency can migrate |
| **Portal Decommission Decision Gate** | Warning | Internal governance — leadership sign-off required to proceed with legacy portal shutdown |
| **RealMe+ Agency Onboarding Window** | Info | GCDO-led — signals that Identity & Credential Services is ready for agency onboarding |
| **Cluster Platform Go-Live** | Critical | Cluster milestone — agency back-office migration cannot start until the cluster platform is live |

---

## 6. Portfolio Narrative

> *The agency is mid-way through its DTS adoption journey. Phase 1 foundation work — service catalogue registration, rules digitalisation, data dictionary alignment — is underway or complete. Phase 2 integration of DPI payment, notification, and identity capabilities is in active delivery, with the legacy self-service portal beginning its managed wind-down as customers shift to the Govt.nz App. Phase 3 AI adoption is in early planning, with the AI Governance Framework standing up as a precondition. The critical path runs through GCDO's Payments Platform availability gate and the cluster platform go-live.*

---

## 7. Implementation Notes for Scenia

- **Strategies:** "DTS Adoption", "Channel Shift", "AI-Enabled Services", "Back-Office Consolidation", "Data Interoperability"
- **Programmes:** "DPI Integration Programme", "Channel Transformation", "AI & Data Programme", "Back-Office Modernisation"
- **Owners:** Generic NZ government titles — "Director Digital Channels", "Programme Manager DTS Adoption", "Chief Data Officer", "Enterprise Architect"
- **Budgets:** $600K (catalogue registration) to $15M (payments migration). Realistic NZ government range.
- **Timeline:** 3-year window centred around now (2025–2028), Phase 1 underway, Phase 2 in delivery, Phase 3 early/planning

---

*Source: [NZ Government Digital Target State, February 2026 — GCDO, dns.govt.nz](https://dns.govt.nz/assets/Digital-government/Digitisation-Government-Programme/NZ-Goverment-Digital-Target-State-February-2026.pdf). Crown copyright, licensed CC BY 4.0.*
