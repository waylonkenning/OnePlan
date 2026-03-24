/**
 * Demo data for the NZ Digital Target State workspace template.
 *
 * Provides a realistic NZ government portfolio across the six DTS layers so that
 * new users selecting the DTS template see a working example immediately.
 *
 * Reuses programme, strategy, and resource IDs from demoData.ts.
 */

import { Initiative, Milestone, ApplicationSegment } from '../types';

function relDate(yearOffset: number, month: number, day: number): string {
  const year = new Date().getFullYear() + yearOffset;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const dtsDemoInitiatives: Initiative[] = [
  // ── Digital Public Infrastructure (cat-dts-dpi) ──────────────────────────

  {
    id: 'dts-i-identity',
    name: 'Identity Platform Uplift',
    programmeId: 'prog-dtp',
    strategyId: 'strat-zero',
    assetId: 'dts-dpi-01',
    startDate: relDate(0, 4, 1),
    endDate: relDate(1, 3, 31),
    budget: 1200000,
    description: 'Uplift agency identity infrastructure to the DTS Identity & Credential Services shared capability, including RealMe+ integration and phishing-resistant MFA for all staff.',
    status: 'active',
    progress: 60,
    ownerId: 'res-4',
    resourceIds: ['res-3'],
  },
  {
    id: 'dts-i-ai-platform',
    name: 'AI Platform Pilot',
    programmeId: 'prog-dtp',
    strategyId: 'strat-data',
    assetId: 'dts-dpi-02',
    startDate: relDate(0, 7, 1),
    endDate: relDate(1, 6, 30),
    budget: 850000,
    description: 'Stand up the shared AI Platform Services capability to support agency experimentation and responsible AI deployment aligned to the DTS model.',
    status: 'planned',
    progress: 10,
    ownerId: 'res-2',
    resourceIds: ['res-6'],
  },
  {
    id: 'dts-i-notify',
    name: 'Notify NZ Adoption',
    programmeId: 'prog-dtp',
    strategyId: 'strat-cust',
    assetId: 'dts-dpi-04',
    startDate: relDate(0, 10, 1),
    endDate: relDate(1, 6, 30),
    budget: 320000,
    description: 'Migrate agency transactional notifications to the all-of-government Notifications & Messaging System, replacing legacy email-only channels.',
    status: 'planned',
    progress: 5,
    ownerId: 'res-1',
  },
  {
    id: 'dts-i-payments',
    name: 'Payments Consolidation',
    programmeId: 'prog-mod',
    strategyId: 'strat-api',
    assetId: 'dts-dpi-05',
    startDate: relDate(1, 1, 1),
    endDate: relDate(2, 3, 31),
    budget: 2100000,
    description: 'Consolidate legacy payment processing across three business units onto the shared DTS Payments Management capability, reducing duplication and improving reconciliation.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-2',
    resourceIds: ['res-3'],
  },
  {
    id: 'dts-i-data-dict',
    name: 'Data Dictionary Build',
    programmeId: 'prog-data',
    strategyId: 'strat-data',
    assetId: 'dts-dpi-07',
    startDate: relDate(0, 4, 1),
    endDate: relDate(0, 12, 31),
    budget: 280000,
    description: 'Populate and publish the agency data dictionary aligned to the DTS Data Dictionary shared capability, covering all priority data domains.',
    status: 'active',
    progress: 45,
    ownerId: 'res-3',
  },
  {
    id: 'dts-i-safeguard',
    name: 'AI Safeguard Framework',
    programmeId: 'prog-reg',
    strategyId: 'strat-reg',
    assetId: 'dts-dpi-08',
    startDate: relDate(0, 7, 1),
    endDate: relDate(1, 3, 31),
    budget: 420000,
    description: 'Implement the agency-level Data & AI Safeguard controls aligned to the GCDO framework, including privacy impact assessments and algorithmic transparency.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-4',
  },

  // ── Channels (cat-dts-channels) ──────────────────────────────────────────

  {
    id: 'dts-i-portal',
    name: 'Agency Portal Refresh',
    programmeId: 'prog-cx',
    strategyId: 'strat-cust',
    assetId: 'dts-ch-02',
    startDate: relDate(0, 1, 1),
    endDate: relDate(0, 9, 30),
    budget: 650000,
    description: 'Redesign the public-facing agency digital service portal to meet the NZ Digital Service Design Standard and align with All-of-Government channel patterns.',
    status: 'active',
    progress: 70,
    ownerId: 'res-1',
    resourceIds: ['res-6'],
  },

  // ── Integration (cat-dts-integration) ────────────────────────────────────

  {
    id: 'dts-i-api-gw',
    name: 'API Gateway Implementation',
    programmeId: 'prog-dtp',
    strategyId: 'strat-api',
    assetId: 'dts-int-01',
    startDate: relDate(0, 1, 1),
    endDate: relDate(0, 12, 31),
    budget: 480000,
    description: 'Implement agency API gateway aligned to the DTS Data, API and AI Services Exchange layer, enabling secure exposure of agency data to authorised consumers.',
    status: 'active',
    progress: 75,
    ownerId: 'res-6',
    resourceIds: ['res-2'],
  },

  // ── Common Consolidated Platforms (cat-dts-platforms) ────────────────────

  {
    id: 'dts-i-itsm',
    name: 'ITSM Platform Migration',
    programmeId: 'prog-mod',
    strategyId: 'strat-cloud',
    assetId: 'dts-plt-02',
    startDate: relDate(1, 4, 1),
    endDate: relDate(2, 3, 31),
    budget: 1500000,
    description: 'Migrate from legacy on-premise ITSM tooling to the Common Consolidated Platform ITSM, joining the cluster shared service.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-1',
    resourceIds: ['res-3'],
  },
  {
    id: 'dts-i-fmis',
    name: 'FMIS Cloud Uplift',
    programmeId: 'prog-cloud',
    strategyId: 'strat-cloud',
    assetId: 'dts-plt-04',
    startDate: relDate(1, 1, 1),
    endDate: relDate(2, 9, 30),
    budget: 1800000,
    description: 'Migrate the agency financial management system to the Common Consolidated Platform FMIS shared service, reducing agency-specific infrastructure overhead.',
    status: 'planned',
    progress: 0,
    ownerId: 'res-2',
  },
];

export const dtsDemoMilestones: Milestone[] = [
  {
    id: 'dts-ms-identity-ga',
    assetId: 'dts-dpi-01',
    date: relDate(1, 3, 31),
    name: 'RealMe+ Integration GA',
    type: 'critical',
  },
  {
    id: 'dts-ms-payments-decision',
    assetId: 'dts-dpi-05',
    date: relDate(0, 12, 1),
    name: 'Payments Procurement Decision',
    type: 'warning',
  },
  {
    id: 'dts-ms-api-golive',
    assetId: 'dts-int-01',
    date: relDate(0, 12, 31),
    name: 'API Gateway Go-Live',
    type: 'critical',
  },
  {
    id: 'dts-ms-portal-launch',
    assetId: 'dts-ch-02',
    date: relDate(0, 9, 30),
    name: 'Portal Launch',
    type: 'info',
  },
];

export const dtsDemoApplicationSegments: ApplicationSegment[] = [
  // Identity: current system in production, new capability being built
  {
    id: 'dts-seg-identity-prod',
    assetId: 'dts-dpi-01',
    status: 'appstatus-in-production',
    startDate: relDate(-1, 1, 1),
    endDate: relDate(1, 3, 31),
  },
  {
    id: 'dts-seg-identity-planned',
    assetId: 'dts-dpi-01',
    status: 'appstatus-planned',
    startDate: relDate(0, 4, 1),
    endDate: relDate(1, 6, 30),
    row: 1,
  },
  // API Gateway: existing ESB sunset, new gateway coming
  {
    id: 'dts-seg-api-prod',
    assetId: 'dts-int-01',
    status: 'appstatus-in-production',
    startDate: relDate(0, 1, 1),
    endDate: relDate(2, 12, 31),
  },
  // ITSM: legacy in production until migration complete
  {
    id: 'dts-seg-itsm-prod',
    assetId: 'dts-plt-02',
    status: 'appstatus-in-production',
    startDate: relDate(-1, 1, 1),
    endDate: relDate(1, 3, 31),
  },
  {
    id: 'dts-seg-itsm-sunset',
    assetId: 'dts-plt-02',
    status: 'appstatus-sunset',
    startDate: relDate(1, 4, 1),
    endDate: relDate(2, 3, 31),
    row: 1,
  },
  // Agency portal: currently in production
  {
    id: 'dts-seg-portal-prod',
    assetId: 'dts-ch-02',
    status: 'appstatus-in-production',
    startDate: relDate(-1, 1, 1),
    endDate: relDate(2, 12, 31),
  },
];
