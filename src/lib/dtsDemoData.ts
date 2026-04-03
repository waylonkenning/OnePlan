/**
 * Demo data for the NZ Digital Target State workspace template.
 *
 * Represents a large NZ government agency mid-way through its DTS adoption
 * journey — Phase 1 (register and expose) underway, Phase 2 (integrate DPI
 * capabilities) in active delivery, Phase 3 (AI adoption and legacy exit) in
 * early planning. Back-office consolidation running in parallel.
 *
 * Source: NZ Government Digital Target State, February 2026 — GCDO, dns.govt.nz
 * © Crown copyright. Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
 */

import { Initiative, Milestone, ApplicationSegment, Application, Programme, Strategy, DtsAdoptionStatus, DtsPhase, DtsPhaseRecord, Dependency } from '../types';

function relDate(yearOffset: number, month: number, day: number): string {
  const year = new Date().getFullYear() + yearOffset;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── DTS-specific programmes ───────────────────────────────────────────────────

export const dtsDemoProgrammes: Programme[] = [
  { id: 'dts-prog-dpi',  name: 'DPI Integration Programme',  color: 'bg-blue-500' },
  { id: 'dts-prog-ch',   name: 'Channel Transformation',      color: 'bg-fuchsia-500' },
  { id: 'dts-prog-ai',   name: 'AI & Data Programme',         color: 'bg-amber-500' },
  { id: 'dts-prog-back', name: 'Back-Office Modernisation',   color: 'bg-rose-500' },
];

// ── DTS-specific strategies ───────────────────────────────────────────────────

export const dtsDemoStrategies: Strategy[] = [
  { id: 'dts-strat-dts',  name: 'DTS Adoption',             color: 'bg-indigo-500' },
  { id: 'dts-strat-ch',   name: 'Channel Shift',             color: 'bg-sky-500' },
  { id: 'dts-strat-ai',   name: 'AI-Enabled Services',       color: 'bg-violet-500' },
  { id: 'dts-strat-back', name: 'Back-Office Consolidation', color: 'bg-orange-500' },
  { id: 'dts-strat-data', name: 'Data Interoperability',     color: 'bg-emerald-500' },
];

// ── Initiatives ───────────────────────────────────────────────────────────────

export const dtsDemoInitiatives: Initiative[] = [

  // Phase 1 — Register and Expose ────────────────────────────────────────────

  {
    id: 'dts-i-catalogue',
    name: 'Public Services Catalogue Registration',
    programmeId: 'dts-prog-dpi',
    strategyId: 'dts-strat-dts',
    assetId: 'dts-dpi-09',
    startDate: relDate(0, 1, 15),
    endDate: relDate(0, 6, 30),
    capex: 120000, opex: 0,
    description: 'Register the agency\'s publicly-facing services in the All-of-Government Data & Services Catalogue — the foundational prerequisite for DPI orchestration. Covers service definitions, eligibility criteria, and entry points for all 32 public-facing services.',
    status: 'active',
    progress: 85,
    ownerId: 'res-1',
    resourceIds: ['res-3'],
  },
  {
    id: 'dts-i-rules',
    name: 'Service Rules Digitalisation',
    programmeId: 'dts-prog-dpi',
    strategyId: 'dts-strat-dts',
    assetId: 'dts-dpi-10',
    startDate: relDate(0, 2, 1),
    endDate: relDate(0, 11, 30),
    capex: 750000, opex: 0,
    description: 'Encode agency service delivery rules in machine-readable format and register them in the DTS Rules Library, enabling DPI-orchestrated service decisions at runtime without real-time agency involvement. Covers ~350 rules across 8 service areas. Requires legal review for rules with statutory basis.',
    status: 'active',
    progress: 45,
    ownerId: 'res-3',
    resourceIds: ['res-2'],
  },
  {
    id: 'dts-i-data-dict',
    name: 'Data Dictionary Alignment',
    programmeId: 'dts-prog-ai',
    strategyId: 'dts-strat-data',
    assetId: 'dts-dpi-07',
    startDate: relDate(0, 4, 1),
    endDate: relDate(1, 1, 31),
    capex: 380000, opex: 0,
    description: 'Audit and remap the agency\'s core data elements — identity, entitlements, contact, and payment fields — against the DTS Data Dictionary. Resolve schema conflicts across 6 source systems and publish aligned schemas to the Services Exchange for interoperability.',
    status: 'active',
    progress: 30,
    ownerId: 'res-3',
    resourceIds: ['res-2'],
  },
  {
    id: 'dts-i-api',
    name: 'Core Data API — Services Exchange',
    programmeId: 'dts-prog-dpi',
    strategyId: 'dts-strat-data',
    assetId: 'dts-int-01',
    startDate: relDate(0, 7, 1),
    endDate: relDate(1, 2, 28),
    capex: 420000, opex: 0,
    description: 'Expose the agency\'s core customer data service as a consented API via the Data & AI Services Exchange, enabling agency-to-agency data sharing with customer consent at point of service. Replaces 4 existing bilateral data-sharing integrations.',
    status: 'active',
    progress: 20,
    ownerId: 'res-6',
    resourceIds: ['res-2'],
  },

  // Phase 2 — Integrate DPI Capabilities ────────────────────────────────────

  {
    id: 'dts-i-notify',
    name: 'Notifications Consolidation',
    programmeId: 'dts-prog-dpi',
    strategyId: 'dts-strat-dts',
    assetId: 'dts-dpi-04',
    startDate: relDate(0, 9, 1),
    endDate: relDate(1, 5, 31),
    capex: 480000, opex: 0,
    description: 'Decommission the agency\'s 9 owned notification pathways (SMS gateway, transactional email service, and in-portal inbox) and migrate all customer-facing notifications to the DPI Notifications & Messaging System. Customer notification preferences set in the Govt.nz App will be preserved.',
    status: 'planned',
    progress: 5,
    ownerId: 'res-1',
    resourceIds: ['res-6'],
  },
  {
    id: 'dts-i-cms',
    name: 'Content Migration to Headless CMS',
    programmeId: 'dts-prog-ch',
    strategyId: 'dts-strat-ch',
    assetId: 'dts-dpi-11',
    startDate: relDate(0, 10, 1),
    endDate: relDate(1, 4, 30),
    capex: 220000, opex: 0,
    description: 'Register the agency\'s authoritative content — policy summaries, eligibility guides, and forms metadata — with the DPI Headless Content Management System, making it available to the Govt.nz App without the agency maintaining a separate web content stack. Aligns with eventual agency portal decommission.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-1',
  },
  {
    id: 'dts-i-identity',
    name: 'Digital Credential Adoption',
    programmeId: 'dts-prog-dpi',
    strategyId: 'dts-strat-dts',
    assetId: 'dts-dpi-01',
    startDate: relDate(1, 1, 1),
    endDate: relDate(1, 10, 31),
    capex: 1100000, opex: 0,
    description: 'Enable the agency to issue credentials to customers\' digital wallets and accept RealMe+ wallet credentials as proof of identity for service access, replacing username and password login on the agency portal. Blocked on GCDO\'s RealMe+ issuance platform reaching production readiness.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-4',
    resourceIds: ['res-6'],
  },
  {
    id: 'dts-i-payments',
    name: 'Payment Flows Migration to AoG Platform',
    programmeId: 'dts-prog-dpi',
    strategyId: 'dts-strat-dts',
    assetId: 'dts-dpi-05',
    startDate: relDate(1, 4, 1),
    endDate: relDate(2, 3, 31),
    capex: 4200000, opex: 0,
    description: 'Migrate agency payment disbursements from the legacy payments engine to the All-of-Government Payments Management platform. Phased by payment type: Phase 1 covers low-volume payment types; Phase 2 covers high-volume recurring disbursements. Requires Treasury engagement and is dependent on GCDO Payments Platform GA.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-2',
    resourceIds: ['res-3', 'res-6'],
  },

  // Phase 3 — AI Adoption and Legacy Exit ───────────────────────────────────

  {
    id: 'dts-i-safeguard',
    name: 'AI Governance Framework',
    programmeId: 'dts-prog-ai',
    strategyId: 'dts-strat-ai',
    assetId: 'dts-dpi-08',
    startDate: relDate(0, 8, 1),
    endDate: relDate(1, 2, 28),
    capex: 480000, opex: 0,
    description: 'Implement the DTS Data & AI Safeguard policy and control framework across all agency AI use cases. Establish an internal AI governance register aligned to central GCDO standards. This is the precondition for adoption of AI Platform Services and the AI Broker.',
    status: 'planned',
    progress: 10,
    ownerId: 'res-4',
  },
  {
    id: 'dts-i-semantic',
    name: 'Semantic Search Integration',
    programmeId: 'dts-prog-ch',
    strategyId: 'dts-strat-ch',
    assetId: 'dts-dpi-06',
    startDate: relDate(1, 4, 1),
    endDate: relDate(1, 10, 31),
    capex: 350000, opex: 0,
    description: 'Contribute agency service definitions and rules to the DPI Semantic Search layer, enabling the Govt.nz App to surface relevant agency services to customers based on life event context — rather than requiring customers to identify the correct service themselves. Dependent on Rules Library registration being complete.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-2',
  },
  {
    id: 'dts-i-ai-routing',
    name: 'AI-Assisted Service Routing',
    programmeId: 'dts-prog-ai',
    strategyId: 'dts-strat-ai',
    assetId: 'dts-dpi-02',
    startDate: relDate(1, 7, 1),
    endDate: relDate(2, 3, 31),
    capex: 1600000, opex: 0,
    description: 'Integrate the agency\'s case management system with DPI AI Platform Services (LLM/SLM) via the AI Services Exchange to classify incoming service requests and route to the appropriate case path. All outputs governed by the Data & AI Safeguard framework. Requires AI Governance Framework sign-off before production deployment.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-2',
    resourceIds: ['res-4', 'res-6'],
  },
  {
    id: 'dts-i-portal',
    name: 'Agency Portal Decommission',
    programmeId: 'dts-prog-ch',
    strategyId: 'dts-strat-ch',
    assetId: 'dts-ch-01',
    startDate: relDate(2, 1, 1),
    endDate: relDate(2, 12, 31),
    capex: 2800000, opex: 0,
    description: 'Migrate authenticated customer self-service from the agency\'s legacy portal to the All-of-Government Govt.nz App service cluster. Decommission the legacy portal once customer adoption reaches the agreed threshold. Dependent on Headless CMS, Notifications, and Digital Credential Adoption being complete.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-1',
    resourceIds: ['res-3'],
  },

  // Back-Office Consolidation ────────────────────────────────────────────────

  {
    id: 'dts-i-itsm',
    name: 'ITSM Platform Consolidation',
    programmeId: 'dts-prog-back',
    strategyId: 'dts-strat-back',
    assetId: 'dts-plt-02',
    startDate: relDate(1, 4, 1),
    endDate: relDate(2, 1, 31),
    capex: 890000, opex: 0,
    description: 'Migrate IT service management from the agency\'s standalone ITSM instance to the cluster-shared Common Consolidated Platform, consolidating operations and eliminating agency-specific licensing and support costs.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-5',
    resourceIds: ['res-6'],
  },
  {
    id: 'dts-i-hris',
    name: 'HRIS Migration to Cluster Platform',
    programmeId: 'dts-prog-back',
    strategyId: 'dts-strat-back',
    assetId: 'dts-plt-03',
    startDate: relDate(1, 7, 1),
    endDate: relDate(2, 9, 30),
    capex: 3200000, opex: 0,
    description: 'Migrate the agency\'s HR system to the Social Sector Cluster HRIS Common Consolidated Platform, decommissioning the on-premise instance. Cannot start until the cluster platform go-live milestone is reached.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-5',
    resourceIds: ['res-3'],
  },
];

// ── Milestones ────────────────────────────────────────────────────────────────

export const dtsDemoMilestones: Milestone[] = [
  {
    id: 'dts-ms-mandate',
    assetId: 'dts-dpi-09',
    date: relDate(0, 1, 20),
    name: 'Cabinet Digital Mandate',
    type: 'info',
  },
  {
    id: 'dts-ms-realme-ready',
    assetId: 'dts-dpi-01',
    date: relDate(0, 12, 1),
    name: 'RealMe+ Agency Onboarding Window',
    type: 'info',
  },
  {
    id: 'dts-ms-payments-ga',
    assetId: 'dts-dpi-05',
    date: relDate(1, 3, 31),
    name: 'GCDO Payments Platform GA',
    type: 'critical',
  },
  {
    id: 'dts-ms-cluster-golive',
    assetId: 'dts-plt-03',
    date: relDate(1, 6, 30),
    name: 'Cluster Platform Go-Live',
    type: 'critical',
  },
  {
    id: 'dts-ms-portal-gate',
    assetId: 'dts-ch-01',
    date: relDate(1, 11, 30),
    name: 'Portal Decommission Decision Gate',
    type: 'warning',
  },
];

// ── Application records for DTS assets ────────────────────────────────────────
// One Application per unique (asset, named system) combination.
// The name comes from the old inline label on the segment.

export const dtsDemoApplications: Application[] = [
  { id: 'app-dts-exchange',   assetId: 'dts-int-01', name: 'Services Exchange API' },
  { id: 'app-dts-legacy-idp', assetId: 'dts-dpi-01', name: 'Legacy IdP' },
  { id: 'app-dts-realme',     assetId: 'dts-dpi-01', name: 'RealMe+' },
  { id: 'app-dts-payments',   assetId: 'dts-dpi-05', name: 'Legacy Payments Engine' },
  { id: 'app-dts-notify',     assetId: 'dts-dpi-04', name: 'Notify.govt.nz' },
  { id: 'app-dts-portal',     assetId: 'dts-ch-02',  name: 'Agency Portal' },
  { id: 'app-dts-aog',        assetId: 'dts-ch-01',  name: 'Govt.nz App' },
  { id: 'app-dts-ai',         assetId: 'dts-dpi-02', name: 'AI Platform' },
  { id: 'app-dts-itsm',       assetId: 'dts-plt-02', name: 'Agency ITSM (Standalone)' },
  { id: 'app-dts-hris',       assetId: 'dts-plt-03', name: 'On-Premise HRIS' },
];

// ── Application lifecycle segments ────────────────────────────────────────────

export const dtsDemoApplicationSegments: ApplicationSegment[] = [
  // Services Exchange: new capability going into production
  { id: 'dts-seg-exchange-prod',   applicationId: 'app-dts-exchange',   status: 'appstatus-planned',       startDate: relDate(0, 7, 1),  endDate: relDate(2, 12, 31) },

  // Identity: legacy auth system in production, new RealMe+ integration planned
  { id: 'dts-seg-identity-legacy', applicationId: 'app-dts-legacy-idp', status: 'appstatus-in-production', startDate: relDate(-2, 1, 1), endDate: relDate(1, 10, 31) },
  { id: 'dts-seg-identity-new',    applicationId: 'app-dts-realme',     status: 'appstatus-planned',       startDate: relDate(1, 1, 1),  endDate: relDate(2, 12, 31), row: 1 },

  // Payments: legacy engine in production, entering sunset as migration proceeds
  { id: 'dts-seg-payments-legacy', applicationId: 'app-dts-payments',   status: 'appstatus-in-production', startDate: relDate(-2, 1, 1), endDate: relDate(1, 9, 30) },
  { id: 'dts-seg-payments-sunset', applicationId: 'app-dts-payments',   status: 'appstatus-sunset',        startDate: relDate(1, 10, 1), endDate: relDate(2, 6, 30),  row: 1 },

  // Notifications: existing service in production, moving to sunset
  { id: 'dts-seg-notify-legacy',   applicationId: 'app-dts-notify',     status: 'appstatus-in-production', startDate: relDate(-2, 1, 1), endDate: relDate(1, 5, 31) },
  { id: 'dts-seg-notify-sunset',   applicationId: 'app-dts-notify',     status: 'appstatus-sunset',        startDate: relDate(1, 6, 1),  endDate: relDate(2, 3, 31),  row: 1 },

  // Agency Portal (Existing Agency Channels): in production, heading for sunset
  { id: 'dts-seg-portal-prod',     applicationId: 'app-dts-portal',     status: 'appstatus-in-production', startDate: relDate(-2, 1, 1), endDate: relDate(2, 6, 30) },
  { id: 'dts-seg-portal-sunset',   applicationId: 'app-dts-portal',     status: 'appstatus-sunset',        startDate: relDate(2, 7, 1),  endDate: relDate(3, 6, 30),  row: 1 },

  // Govt.nz App (AoG Channels): planned — the future state
  { id: 'dts-seg-aog-planned',     applicationId: 'app-dts-aog',        status: 'appstatus-planned',       startDate: relDate(2, 1, 1),  endDate: relDate(3, 12, 31) },

  // AI Platform: new capability planned
  { id: 'dts-seg-ai-planned',      applicationId: 'app-dts-ai',         status: 'appstatus-planned',       startDate: relDate(1, 7, 1),  endDate: relDate(2, 12, 31) },

  // ITSM: standalone in production, moving to sunset as cluster migration completes
  { id: 'dts-seg-itsm-prod',       applicationId: 'app-dts-itsm',       status: 'appstatus-in-production', startDate: relDate(-2, 1, 1), endDate: relDate(1, 9, 30) },
  { id: 'dts-seg-itsm-sunset',     applicationId: 'app-dts-itsm',       status: 'appstatus-sunset',        startDate: relDate(1, 10, 1), endDate: relDate(2, 3, 31),  row: 1 },

  // HRIS: on-premise in production, moving to sunset as cluster migration completes
  { id: 'dts-seg-hris-prod',       applicationId: 'app-dts-hris',       status: 'appstatus-in-production', startDate: relDate(-2, 1, 1), endDate: relDate(2, 3, 31) },
  { id: 'dts-seg-hris-sunset',     applicationId: 'app-dts-hris',       status: 'appstatus-sunset',        startDate: relDate(2, 4, 1),  endDate: relDate(3, 3, 31),  row: 1 },
];

// ── Default DTS phase records (user-configurable) ─────────────────────────

export const defaultDtsPhases: DtsPhaseRecord[] = [
  { id: 'phase-1',     name: 'Phase 1 — Register & Expose',  color: 'bg-blue-500' },
  { id: 'phase-2',     name: 'Phase 2 — Integrate DPI',       color: 'bg-violet-500' },
  { id: 'phase-3',     name: 'Phase 3 — AI & Legacy Exit',    color: 'bg-emerald-500' },
  { id: 'back-office', name: 'Back-Office Consolidation',      color: 'bg-amber-500' },
  { id: 'not-dts',     name: 'Not DTS',                        color: 'bg-slate-400' },
];

// ── Default DTS phases for demo initiatives ────────────────────────────────

export const dtsDemoInitiativePhases: Record<string, DtsPhase> = {
  // Phase 1 — Register & Expose
  'dts-i-catalogue': 'phase-1',
  'dts-i-rules':     'phase-1',
  'dts-i-data-dict': 'phase-1',
  'dts-i-api':       'phase-1',
  // Phase 2 — Integrate DPI Capabilities
  'dts-i-notify':    'phase-2',
  'dts-i-cms':       'phase-2',
  'dts-i-identity':  'phase-2',
  'dts-i-payments':  'phase-2',
  // Phase 3 — AI Adoption and Legacy Exit
  'dts-i-safeguard':  'phase-3',
  'dts-i-semantic':   'phase-3',
  'dts-i-ai-routing': 'phase-3',
  'dts-i-portal':     'phase-3',
  // Back-Office Consolidation
  'dts-i-itsm': 'back-office',
  'dts-i-hris': 'back-office',
};

// ── Default DTS adoption statuses for demo data ────────────────────────────
// Keyed by asset ID. Represents a mid-journey agency: Phase 1 assets active,
// Phase 2 in delivery, Phase 3/back-office not yet started.

export const dtsDemoAdoptionStatuses: Record<string, DtsAdoptionStatus> = {
  // Channels — already using AoG channels and agency channels
  'dts-ch-01': 'in-delivery',
  'dts-ch-02': 'adopted',
  'dts-ch-03': 'not-applicable',

  // Digital Public Infrastructure
  'dts-dpi-01': 'in-delivery',   // Identity & Credential Services (RealMe+)
  'dts-dpi-02': 'scoping',       // AI Platform Services
  'dts-dpi-03': 'not-started',   // AI Broker / Gateway
  'dts-dpi-04': 'in-delivery',   // Notifications & Messaging
  'dts-dpi-05': 'in-delivery',   // Payments Management
  'dts-dpi-06': 'scoping',       // Semantic Search
  'dts-dpi-07': 'in-delivery',   // Data Dictionary
  'dts-dpi-08': 'scoping',       // Data & AI Safeguard
  'dts-dpi-09': 'in-delivery',   // Data & Services Catalogue
  'dts-dpi-10': 'in-delivery',   // Rules Library
  'dts-dpi-11': 'in-delivery',   // Headless CMS

  // Integration
  'dts-int-01': 'in-delivery',   // Data, API and AI Services Exchange

  // Common Consolidated Platforms
  'dts-plt-01': 'not-started',   // EAM
  'dts-plt-02': 'in-delivery',   // ITSM
  'dts-plt-03': 'in-delivery',   // HRIS
  'dts-plt-04': 'not-started',   // FMIS
  'dts-plt-05': 'not-started',   // Contracts Management
};

// ── Pre-drawn dependencies for demo data ─────────────────────────────────
//
// Initiative-to-initiative dependencies reflect sequencing stated in the
// initiative descriptions above.
// Milestone dependencies reflect external blockers called out in descriptions.

export const dtsDemoDependencies: Dependency[] = [

  // Phase 1 → Phase 2 sequencing
  // Data Dictionary alignment must complete before Core Data API can expose aligned schemas
  { id: 'dts-dep-01', sourceId: 'dts-i-data-dict', targetId: 'dts-i-api',       type: 'blocks' },

  // Rules Library must be registered before Semantic Search can index them
  { id: 'dts-dep-02', sourceId: 'dts-i-rules',     targetId: 'dts-i-semantic',  type: 'blocks' },

  // Phase 2 → Phase 3 sequencing
  // AI Governance Framework must be signed off before AI-Assisted Service Routing goes to production
  { id: 'dts-dep-03', sourceId: 'dts-i-safeguard', targetId: 'dts-i-ai-routing', type: 'blocks' },

  // Portal Decommission prerequisites (three blockers called out in description)
  { id: 'dts-dep-04', sourceId: 'dts-i-identity',  targetId: 'dts-i-portal',    type: 'blocks' },
  { id: 'dts-dep-05', sourceId: 'dts-i-cms',       targetId: 'dts-i-portal',    type: 'blocks' },
  { id: 'dts-dep-06', sourceId: 'dts-i-notify',    targetId: 'dts-i-portal',    type: 'blocks' },

  // Milestone blockers — external platform readiness gates
  // RealMe+ Agency Onboarding Window must be reached before Digital Credential Adoption can start
  { id: 'dts-dep-07', sourceId: 'dts-ms-realme-ready',  targetId: 'dts-i-identity', type: 'blocks', sourceType: 'milestone' },
  // GCDO Payments Platform GA must be reached before Payment Flows Migration can start
  { id: 'dts-dep-08', sourceId: 'dts-ms-payments-ga',   targetId: 'dts-i-payments', type: 'blocks', sourceType: 'milestone' },
  // Cluster Platform Go-Live must be reached before HRIS Migration can start
  { id: 'dts-dep-09', sourceId: 'dts-ms-cluster-golive', targetId: 'dts-i-hris',    type: 'blocks', sourceType: 'milestone' },
];
